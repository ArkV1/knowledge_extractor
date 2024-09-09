# YouTube Video Transcription Tool

This Python project automates the process of downloading YouTube videos, extracting audio, and transcribing them using OpenAI's Whisper model. The project works both as a **desktop application** (via PyWebView) and as a **web application** (via Flask). You can use either **YouTube’s auto-generated transcript** or **OpenAI Whisper** for transcription.

## Features

- Download audio from YouTube videos.
- Transcribe audio to text using OpenAI Whisper.
- Fetch YouTube's auto-generated transcripts.
- Run the app as both a desktop application (via PyWebView) and a web app (via Flask).

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Python 3.7+ installed.
- [FFmpeg](https://ffmpeg.org/download.html) installed and available in your system's PATH.
  - On macOS, you can install FFmpeg using Homebrew:
    ```bash
    brew install ffmpeg
    ```

## Setup

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/your-repository.git
    cd your-repository
    ```

2. **Create and activate a Python virtual environment**:
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate  # macOS/Linux
    ```

3. **Install the required dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4. **Create a `.env` file**:
    The `.env` file is used to set the environment for the application. You can create one in the root directory of the project with the following content:

    - For development:
      ```plaintext
      FLASK_ENV=development
      ```

    - For production:
      ```plaintext
      FLASK_ENV=production
      ```

## Running the Application

### Development Mode (with Hot Reload)

When running the app in development mode, **Flask** will enable **hot reload**, and you can access the app through your web browser.

1. Set `FLASK_ENV=development` in your `.env` file.
2. Run the app:
   ```bash
   python app.py
   ```
3. Open the browser and go to `http://127.0.0.1:5000` to access the app.

In **development mode**, **PyWebView** is not used so you can easily debug and reload the app in the browser as you make changes.

### Production Mode (PyWebView Desktop App)

In production mode, the app will run as a **desktop application** using **PyWebView**.

1. Set `FLASK_ENV=production` in your `.env` file.
2. Run the app:
   ```bash
   python app.py
   ```

The app will launch a native desktop window powered by **PyWebView**.

- **PyWebView** will wait for the Flask server to be fully up and running before opening the window.
- The app behaves like a local desktop application, but the back-end is powered by Flask.

### Important Notes:

- **In Development Mode**: Flask runs with hot reload enabled, making it easier to develop and test.
- **In Production Mode**: PyWebView launches a native window and Flask runs in the background.

## Usage

1. Enter a YouTube URL in the input field.
2. Choose the transcription method:
    - **YouTube's Own Transcription**: Fetch the transcript directly from YouTube if available.
    - **OpenAI Whisper Transcription**: Download the audio and transcribe it using Whisper.
3. The result will be displayed in the output area.

## Dependencies

The project relies on the following Python libraries, listed in `requirements.txt`:
- `Flask`
- `pywebview`
- `youtube-transcript-api`
- `openai-whisper`
- `yt-dlp`
- `ffmpeg-python`
- `requests`
- `python-dotenv`

You can update the `requirements.txt` file if necessary by running:
```bash
pip freeze > requirements.txt
```

## Contributing

If you'd like to contribute, feel free to submit a pull request or file an issue.

## License

This project is open-source and available under the [MIT License](LICENSE).
```
