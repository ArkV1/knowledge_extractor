from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
import asyncio
from features.transcription import (
    get_youtube_transcript, transcribe_with_whisper, 
    download_audio, extract_video_id, highlight_differences
)
from features.pdf_converter import convert_url_to_pdf
from web.socketio import socketio

api_bp = Blueprint('api', __name__)

# Transcribe Route
@api_bp.route("/api/transcribe", methods=['POST'])
def transcribe():
    data = request.json
    url = data['url']
    method = data['method']
    whisper_model = data['whisperModel']

    video_id = extract_video_id(url)
    if not video_id:
        return jsonify({'error': 'Invalid YouTube URL'}), 400

    youtube_result, whisper_result = None, None
    socketio.emit('progress', {'status': 'Starting transcription...'})

    # Fetch YouTube transcription
    if method == "YouTube" or method == "Both":
        socketio.emit('progress', {'status': 'Fetching YouTube transcription...'})
        youtube_result = get_youtube_transcript(video_id)
        socketio.emit('progress', {'status': 'YouTube transcription complete.'})

    # Fetch Whisper transcription
    if method == "Whisper" or method == "Both":
        socketio.emit('progress', {'status': 'Starting audio download...'})
        audio_file = download_audio(url, socketio=socketio)
        socketio.emit('progress', {'status': f'Transcribing with Whisper ({whisper_model} model)...'})
        whisper_result = transcribe_with_whisper(audio_file, whisper_model)
        os.remove(audio_file)
        socketio.emit('progress', {'status': 'Whisper transcription complete.'})

    socketio.emit('progress', {'status': 'Transcription complete.'})
    return jsonify({'youtube_result': youtube_result, 'whisper_result': whisper_result})

# Compare Route
@api_bp.route("/api/compare", methods=['POST'])
def compare():
    data = request.json
    youtube_transcript = data.get('youtube_transcript')
    whisper_transcript = data.get('whisper_transcript')
    comparison_mode = data.get('comparison_mode', 'inline')

    if not youtube_transcript or not whisper_transcript:
        return jsonify({'error': 'Both YouTube and Whisper transcripts are required.'}), 400

    try:
        if comparison_mode == 'inline':
            comparison_result = highlight_differences(youtube_transcript, whisper_transcript, mode='inline')
            return jsonify({'comparison_result': comparison_result, 'mode': 'inline'})
        elif comparison_mode == 'side_by_side':
            youtube_highlighted, whisper_highlighted = highlight_differences(youtube_transcript, whisper_transcript, mode='side_by_side')
            return jsonify({
                'youtube_result': youtube_highlighted, 
                'whisper_result': whisper_highlighted, 
                'mode': 'side_by_side'
            })
        else:
            return jsonify({'error': 'Invalid comparison mode.'}), 400
    except Exception as e:
        return jsonify({'error': f'Error during comparison: {str(e)}'}), 500

# Convert URL to PDF (Updated to use Pyppeteer)
@api_bp.route("/api/convert-to-pdf", methods=["POST"])
def convert_to_pdf():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({"error": "URL is required"}), 400

    try:
        # Call the new Pyppeteer-based PDF conversion function
        filename = convert_url_to_pdf(url)
        return jsonify({'filename': filename}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Download PDF file
@api_bp.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    downloads_dir = os.path.join(os.getcwd(), 'downloads')
    try:
        return send_file(os.path.join(downloads_dir, filename), as_attachment=True)
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404
