from flask import Blueprint, render_template, request

web_bp = Blueprint('web', __name__)

@web_bp.route("/", methods=["GET"])
def index_page():
    return render_template('index.html')

@web_bp.route("/transcription", methods=["GET"])
def transcription_page():
    method = request.args.get('method', 'YouTube')
    return render_template('transcription.html', method=method)

@web_bp.route("/website-to-pdf", methods=["GET"])
def website_to_pdf_page():
    return render_template('website_to_pdf.html')