import whisper
import yt_dlp
import os
import re
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from difflib import SequenceMatcher

# Fetch YouTube Transcript
def get_youtube_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = " ".join(entry['text'] for entry in transcript).strip()
        return transcript_text
    except (TranscriptsDisabled, NoTranscriptFound):
        return "No transcript available for this video."
    except Exception as e:
        return f"Error fetching YouTube transcript: {str(e)}"

# Download YouTube audio and convert to mp3
def download_audio(video_url, output_dir="downloads", socketio=None):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    def progress_hook(d):
        if socketio:
            if d['status'] == 'downloading':
                percent = d['_percent_str']
                speed = d['_speed_str']
                eta = d['_eta_str']
                socketio.emit('progress', {'status': f'Downloading: {percent} (Speed: {speed}, ETA: {eta})'})
            elif d['status'] == 'finished':
                socketio.emit('progress', {'status': 'Download finished, now converting...'})

    # Set up YouTube-DL options
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),  # Save with title and correct extension
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'progress_hooks': [progress_hook],  # Attach progress hook
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            if socketio:
                socketio.emit('progress', {'status': 'Starting download...'})
            
            # Download the video/audio file
            info_dict = ydl.extract_info(video_url, download=True)
            
            # Prepare filename for mp3
            file_path = ydl.prepare_filename(info_dict)
            file_path = os.path.splitext(file_path)[0] + '.mp3'  # Ensure it is .mp3
            
            # Check if the converted file exists
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"The file {file_path} was not found after download and conversion.")
            
            return file_path  # Return the valid file path for the mp3 file

    except Exception as e:
        if socketio:
            socketio.emit('progress', {'status': f'Error during download: {str(e)}'})
        raise

# Transcribe audio using Whisper
def transcribe_with_whisper(audio_file, model_name='base'):
    model = whisper.load_model(model_name)
    result = model.transcribe(audio_file)
    return result["text"]

# Extract YouTube video ID from URL
def extract_video_id(url):
    if "v=" in url:
        video_id = url.split("v=")[1].split("&")[0]
        return video_id
    else:
        return None

# Highlight differences between two texts
def highlight_differences(text1, text2, mode='inline'):
    def tokenize(text):
        return re.findall(r'\w+|[^\w\s]', text.lower())

    words1, words2 = tokenize(text1), tokenize(text2)
    matcher = SequenceMatcher(None, words1, words2)
    result = []

    for op, i1, i2, j1, j2 in matcher.get_opcodes():
        if op == 'equal':
            result.extend(words1[i1:i2])
        elif op == 'delete':
            result.append('<span class="bg-red-200">')
            result.extend(words1[i1:i2])
            result.append('</span>')
        elif op == 'insert':
            result.append('<span class="bg-green-200">')
            result.extend(words2[j1:j2])
            result.append('</span>')
        elif op == 'replace':
            result.append('<span class="bg-red-200">')
            result.extend(words1[i1:i2])
            result.append('</span>')
            result.append('<span class="bg-green-200">')
            result.extend(words2[j1:j2])
            result.append('</span>')

    def reconstruct(tokens):
        reconstructed = []
        capitalize_next = True
        for token in tokens:
            if token in ('.', '!', '?'):
                capitalize_next = True
            elif re.match(r'\w', token):
                if capitalize_next:
                    token = token.capitalize()
                    capitalize_next = False
                if reconstructed and reconstructed[-1] not in (' ', "'"):
                    reconstructed.append(' ')
            reconstructed.append(token)
        return ''.join(reconstructed)

    if mode == 'inline':
        return reconstruct(result)
    else:  # side-by-side mode
        result1, result2 = [], []
        for op, i1, i2, j1, j2 in matcher.get_opcodes():
            if op == 'equal':
                result1.extend(words1[i1:i2])
                result2.extend(words2[j1:j2])
            elif op == 'delete':
                result1.append('<span class="bg-red-200">')
                result1.extend(words1[i1:i2])
                result1.append('</span>')
            elif op == 'insert':
                result2.append('<span class="bg-green-200">')
                result2.extend(words2[j1:j2])
                result2.append('</span>')
            elif op == 'replace':
                result1.append('<span class="bg-red-200">')
                result1.extend(words1[i1:i2])
                result1.append('</span>')
                result2.append('<span class="bg-green-200">')
                result2.extend(words2[j1:j2])
                result2.append('</span>')
        return reconstruct(result1), reconstruct(result2)

# Alias for backward compatibility
highlight_differences_inline = highlight_differences