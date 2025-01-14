import os
import time
import requests
from asyncio import Event
from flask import Flask
from flask_socketio import SocketIO
from web.routes import web_bp
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config['SECRET_KEY'] = 'your-secret-key'  # Add a secret key for security

# Initialize SocketIO with CORS support
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

def register_blueprints(app):
    from api.routes import api_bp
    app.register_blueprint(api_bp)
    app.register_blueprint(web_bp)

# Register blueprints
register_blueprints(app)

# Create an event to signal the server to shut down
shutdown_event = Event()

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
    port = int(os.getenv('PORT', 3002))
    socketio.run(app, debug=True, port=port, allow_unsafe_werkzeug=True)

def stop_flask():
    shutdown_event.set()

if __name__ == "__main__":
    # Get environment from .env file
    flask_env = os.getenv('FLASK_ENV', 'development')
    port = int(os.getenv('PORT', 3002))
    
    if flask_env == 'development':
        print(f"Running in {flask_env} mode on port {port}")
        socketio.run(app, debug=True, port=port, allow_unsafe_werkzeug=True)
    else:
        print(f"Running in {flask_env} mode on port {port}")
        server_thread = Thread(target=run_flask)
        server_thread.daemon = True
        server_thread.start()

        wait_for_server(f"http://127.0.0.1:{port}")

        try:
            webview.create_window("YouTube Transcriber", f"http://127.0.0.1:{port}")
            webview.start(func=stop_flask)
        except Exception as e:
            print(f"Error creating webview window: {e}")
        finally:
            shutdown_event.set()
            server_thread.join(timeout=5)
