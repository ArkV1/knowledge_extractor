import os
import asyncio
from pyppeteer import launch
from pyppeteer.errors import BrowserError, TimeoutError
from werkzeug.utils import secure_filename
from multiprocessing import Process, Queue
import aiohttp
import zipfile
import json
import shutil
import requests
from logger import extension_logger

# Function to create a PDF using Pyppeteer
async def create_pdf(url, pdf_path, orientation='portrait'):
    browser = None
    try:
        extension_path = os.path.join(os.getcwd(), 'extensions', 'i-still-dont-care-about-cookies')
        if not os.path.exists(extension_path):
            raise FileNotFoundError(f"Extension directory not found: {extension_path}")

        browser = await launch(
            headless=False,
            args=[
                '--no-sandbox',
                '--disable-setuid-sandbox',
                f'--disable-extensions-except={extension_path}',
                f'--load-extension={extension_path}',
                '--disable-gpu',
                '--no-zygote',
            ],
            ignoreDefaultArgs=['--enable-automation'],
            timeout=60000
        )

        page = await browser.newPage()
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

        # Set viewport size based on orientation
        if orientation == 'landscape':
            await page.setViewport({'width': 1920, 'height': 1080})
        else:
            await page.setViewport({'width': 1080, 'height': 1920})

        await page.goto(url, {'waitUntil': 'networkidle0', 'timeout': 60000})
        await page.waitFor(5000)

        # Set page size and orientation
        page_width = '297mm' if orientation == 'landscape' else '210mm'
        page_height = '210mm' if orientation == 'landscape' else '297mm'

        # Add CSS for page orientation and to show all content
        await page.evaluate(f'''() => {{
            const style = document.createElement('style');
            style.textContent = `
                @page {{
                    size: {page_width} {page_height};
                    margin: 0;
                }}
                body {{
                    width: {page_width};
                    height: {page_height};
                    margin: 0;
                    -webkit-print-color-adjust: exact;
                }}
                * {{
                    -webkit-print-color-adjust: exact;
                }}
            `;
            document.head.appendChild(style);
        }}''')

        await page.pdf({
            'path': pdf_path,
            'width': page_width,
            'height': page_height,
            'printBackground': True,
            'preferCSSPageSize': True,
        })

        extension_logger.info(f"PDF created successfully: {pdf_path} with orientation: {orientation}")

    except BrowserError as e:
        extension_logger.error(f"Browser error: {str(e)}")
    except TimeoutError:
        extension_logger.error("Browser launch or navigation timed out")
    except Exception as e:
        extension_logger.error(f"Error creating PDF: {str(e)}")
    finally:
        if browser:
            await browser.close()

async def log_request(request):
    extension_logger.debug(f"Request: {request.method} {request.url}")

async def log_response(response):
    extension_logger.debug(f"Response: {response.status} {response.url}")

# Utility function to generate a safe filename
def generate_pdf_filename(url):
    safe_url = secure_filename(url)
    filename = f"{safe_url}.pdf"
    return filename

# Function to define the directory where PDFs will be stored
def get_pdf_directory():
    pdf_dir = os.path.join(os.getcwd(), 'downloads')
    if not os.path.exists(pdf_dir):
        os.makedirs(pdf_dir)
    return pdf_dir

# Function to handle URL to PDF conversion in a separate process
def convert_url_to_pdf(url, orientation, queue):
    pdf_dir = get_pdf_directory()
    filename = generate_pdf_filename(url)
    pdf_path = os.path.join(pdf_dir, filename)

    # Ensure the event loop is created and set in the current thread
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(create_pdf(url, pdf_path, orientation))
        queue.put(filename)
    except Exception as e:
        queue.put(e)

# Function to start the conversion process
def start_conversion(url, orientation='portrait'):
    queue = Queue()
    process = Process(target=convert_url_to_pdf, args=(url, orientation, queue))
    process.start()
    process.join()
    result = queue.get()
    if isinstance(result, Exception):
        raise result
    return result

def update_extension():
    extension_dir = os.path.join(os.getcwd(), 'extensions', 'i-still-dont-care-about-cookies')
    os.makedirs(extension_dir, exist_ok=True)

    try:
        response = requests.get('https://api.github.com/repos/OhMyGuus/I-Still-Dont-Care-About-Cookies/releases/latest')
        response.raise_for_status()
        data = response.json()
        version = data['tag_name']
        download_url = data['assets'][0]['browser_download_url']

        current_version = get_extension_version()
        if current_version == version:
            extension_logger.info(f"Extension is already up to date (version {version})")
            return version

        extension_logger.info(f"Downloading extension version {version} from {download_url}")

        response = requests.get(download_url)
        response.raise_for_status()
        zip_path = os.path.join(extension_dir, 'extension.zip')
        with open(zip_path, 'wb') as f:
            f.write(response.content)

        # Remove existing files in the extension directory
        for item in os.listdir(extension_dir):
            item_path = os.path.join(extension_dir, item)
            if item != 'extension.zip':
                if os.path.isfile(item_path):
                    os.unlink(item_path)
                elif os.path.isdir(item_path):
                    shutil.rmtree(item_path)

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extension_dir)

        os.remove(zip_path)

        # Ensure the correct manifest file is used
        manifest_v3_path = os.path.join(extension_dir, 'manifest_v3.json')
        manifest_path = os.path.join(extension_dir, 'manifest.json')
        if os.path.exists(manifest_v3_path):
            shutil.copy(manifest_v3_path, manifest_path)

        extension_logger.info(f"Extension updated successfully to version {version}")
        return version
    except requests.RequestException as e:
        extension_logger.error(f"Error downloading extension: {str(e)}")
        raise
    except zipfile.BadZipFile:
        extension_logger.error("Error: Downloaded file is not a valid zip file")
        raise
    except Exception as e:
        extension_logger.error(f"Unexpected error updating extension: {str(e)}")
        raise

def get_extension_version():
    extension_dir = os.path.join(os.getcwd(), 'extensions', 'i-still-dont-care-about-cookies')
    manifest_path = os.path.join(extension_dir, 'manifest.json')
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
            return manifest.get('version', 'Unknown')
    return 'Not installed'
