import os
import requests
import zipfile
import tempfile
import logging
from flask import send_file

EXTENSION_URL = "https://github.com/ArkV1/customPrismLive/archive/refs/heads/master.zip"
EXTENSION_DIR = "static/js/prism-live"

# Configure logging
logging.basicConfig(level=logging.DEBUG)

def update_prism_live_logic():
    try:
        logging.debug("Starting update_prism_live_logic")

        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            local_filename = os.path.join(temp_dir, "prism-live.zip")
            extract_path = EXTENSION_DIR

            logging.debug(f"Temporary directory created at {temp_dir}")
            logging.debug(f"Local filename set to {local_filename}")
            logging.debug(f"Extract path set to {extract_path}")

            # Download the file
            with requests.get(EXTENSION_URL, stream=True) as r:
                r.raise_for_status()
                logging.debug(f"Downloading from {EXTENSION_URL}")
                with open(local_filename, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
                        logging.debug(f"Written chunk of size {len(chunk)}")

            logging.debug("Download completed")

            # Extract the zip file
            with zipfile.ZipFile(local_filename, 'r') as zip_ref:
                zip_ref.extractall(extract_path)
                logging.debug(f"Extracted zip file to {extract_path}")

        logging.debug("Prism Live updated successfully")
        return {"status": "success", "message": "Prism Live updated successfully."}
    except Exception as e:
        logging.error(f"Error occurred: {str(e)}")
        return {"status": "error", "error": str(e)}
