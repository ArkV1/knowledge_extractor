import os
from flask import Blueprint, request, jsonify
from transcriptions.transcribe import highlight_differences, extract_video_id, get_youtube_transcript, transcribe_with_whisper, download_audio
from web.socketio import socketio

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
        audio_file = download_audio(url, socketio=socketio)
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