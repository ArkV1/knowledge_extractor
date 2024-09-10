import whisper
import yt_dlp
import os
import re
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
from difflib import SequenceMatcher

def get_youtube_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        transcript_text = ""
        for entry in transcript:
            transcript_text += f"{entry['text']} "
        return transcript_text.strip()
    except (TranscriptsDisabled, NoTranscriptFound):
        return "No transcript available for this video."
    except Exception as e:
        return f"Error fetching YouTube transcript: {str(e)}"

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

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'progress_hooks': [progress_hook],
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            if socketio:
                socketio.emit('progress', {'status': 'Starting download...'})
            info_dict = ydl.extract_info(video_url, download=True)
            file_path = ydl.prepare_filename(info_dict)
            file_path = os.path.splitext(file_path)[0] + '.mp3'
            
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"The file {file_path} was not found after download and conversion.")
            
            return file_path
    except Exception as e:
        if socketio:
            socketio.emit('progress', {'status': f'Error during download: {str(e)}'})
        raise

def transcribe_with_whisper(audio_file, model_name):
    model = whisper.load_model(model_name)
    result = model.transcribe(audio_file)
    return result["text"]

def extract_video_id(url):
    if "v=" in url:
        video_id = url.split("v=")[1]
        if "&" in video_id:
            video_id = video_id.split("&")[0]
        return video_id
    else:
        return None

def highlight_differences(text1, text2, mode='inline'):
    def tokenize(text):
        return re.findall(r'\w+|[^\w\s]', text.lower())

    words1 = tokenize(text1)
    words2 = tokenize(text2)

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

    reconstructed = []
    capitalize_next = True
    for token in result:
        if token in ('.', '!', '?'):
            capitalize_next = True
        elif re.match(r'\w', token):
            if capitalize_next:
                token = token.capitalize()
                capitalize_next = False
            if reconstructed and reconstructed[-1] not in (' ', "'"):
                reconstructed.append(' ')
        reconstructed.append(token)

    if mode == 'inline':
        return ''.join(reconstructed)
    else:  # side-by-side mode
        return text1, text2

# Alias for backward compatibility
highlight_differences_inline = highlight_differences