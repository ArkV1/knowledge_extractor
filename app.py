from flask import Flask
from api.routes import api_bp  # Import your API blueprint
from web.routes import web_bp  # Import your Web blueprint
from web.socketio import socketio  # Import socketio from the new file
import webview
from threading import Thread
import time
import requests
import os
from dotenv import load_dotenv
import signal

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Register blueprints
app.register_blueprint(api_bp)
app.register_blueprint(web_bp)

# Attach Flask app to socketio instance
socketio.init_app(app)

def wait_for_server(url, timeout=30):
    start_time = time.time()
    while True:
        try:
            response = requests.get(url)
            if response.status_code == 200:
                print(f"Server started at {url}")
                break
        except requests.ConnectionError:
            print(f"Waiting for server at {url}...")
        if time.time() - start_time > timeout:
            print("Error: Flask server did not start in time.")
            break
        time.sleep(1)

def run_flask():
    """Start the Flask-SocketIO server."""
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, port=port)

def stop_flask():
    """Gracefully stop the Flask server."""
    os.kill(os.getpid(), signal.SIGINT)

if __name__ == "__main__":
    # Development mode
    if os.getenv('FLASK_ENV') == 'development':
        print("Running in development mode")
        port = int(os.getenv('PORT', 5000))
        socketio.run(app, debug=True, use_reloader=True, port=port)

    # Production mode
    else:
        print("Running in production mode")
        thread = Thread(target=run_flask)
        thread.daemon = True
        thread.start()

        port = int(os.getenv('PORT', 5000))
        wait_for_server(f"http://127.0.0.1:{port}")

        try:
            webview.create_window("YouTube Transcriber", f"http://127.0.0.1:{port}")
            # Start the webview and attach stop_flask to close event
            webview.start(stop_flask)
        except Exception as e:
            print(f"Error creating webview window: {e}")
