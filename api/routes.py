from flask import Blueprint, request, jsonify
from web.socketio import socketio  # Import socketio from the new file
from transcriptions.transcribe import get_youtube_transcript, download_audio, transcribe_with_whisper, extract_video_id, highlight_differences
import os

api_bp = Blueprint('api', __name__)

@api_bp.route('/api/transcribe', methods=['POST'])
def transcribe():
    data = request.json
    url = data['url']
    method = data['method']
    whisper_model = data['whisperModel']

    video_id = extract_video_id(url)
    if not video_id:
        return jsonify({'error': 'Invalid YouTube URL'}), 400

    youtube_result = None
    whisper_result = None

    socketio.emit('progress', {'status': 'Starting transcription...'})

    if method == "YouTube" or method == "Both":
        socketio.emit('progress', {'status': 'Fetching YouTube transcription...'})
        youtube_result = get_youtube_transcript(video_id)
        socketio.emit('progress', {'status': 'YouTube transcription complete.'})

    if method == "Whisper" or method == "Both":
        socketio.emit('progress', {'status': 'Starting audio download...'})
        audio_file = download_audio(url, socketio=socketio)  # Pass socketio here
        socketio.emit('progress', {'status': f'Transcribing with Whisper ({whisper_model} model)...'})
        whisper_result = transcribe_with_whisper(audio_file, whisper_model)
        os.remove(audio_file)
        socketio.emit('progress', {'status': 'Whisper transcription complete.'})

    socketio.emit('progress', {'status': 'Transcription complete.'})

    return jsonify({
        'youtube_result': youtube_result,
        'whisper_result': whisper_result
    })

@api_bp.route('/api/compare', methods=['POST'])
def compare():
    data = request.json
    youtube_transcript = data.get('youtube_transcript')
    whisper_transcript = data.get('whisper_transcript')
    
    if not youtube_transcript or not whisper_transcript:
        return jsonify({'error': 'Both YouTube and Whisper transcripts are required.'}), 400
    
    try:
        comparison_result = highlight_differences(youtube_transcript, whisper_transcript)
        return jsonify({'comparison_result': comparison_result})
    except Exception as e:
        return jsonify({'error': f'Error during comparison: {str(e)}'}), 500
