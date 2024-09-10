from flask import Blueprint, render_template, request

web_bp = Blueprint('web', __name__)

@web_bp.route("/", methods=["GET"])
def transcription_page():
    method = request.args.get('method', 'YouTube')  # Default to 'YouTube' if not specified
    return render_template('transcription.html', method=method)