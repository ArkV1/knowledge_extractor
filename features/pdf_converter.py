import os
import asyncio
from pyppeteer import launch
from werkzeug.utils import secure_filename

# Function to create a PDF using Pyppeteer
async def create_pdf(url, pdf_path):
    try:
        # Launch headless browser
        browser = await launch(headless=True, args=['--no-sandbox'])
        page = await browser.newPage()
        
        # Navigate to the URL with a timeout and wait until network is idle
        await page.goto(url, {'waitUntil': 'networkidle2', 'timeout': 60000})
        
        # Generate PDF
        await page.pdf({
            'path': pdf_path,
            'format': 'A4',
            'printBackground': True
        })
        
        # Close the browser
        await browser.close()
    except Exception as e:
        await browser.close()
        raise e

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

# Main function to handle URL to PDF conversion
def convert_url_to_pdf(url):
    pdf_dir = get_pdf_directory()
    filename = generate_pdf_filename(url)
    pdf_path = os.path.join(pdf_dir, filename)

    # Run the async PDF creation
    asyncio.get_event_loop().run_until_complete(create_pdf(url, pdf_path))
    
    return filename
