from flask import Blueprint, render_template, request, jsonify, send_file
import os
import requests
import zipfile
from features.pdf_converter import update_extension
from logger import app_logger

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

@web_bp.route("/update-extensions", methods=["POST"])
def update_extensions():
    try:
        new_version = update_extension()
        app_logger.info(f"Extension updated successfully to version {new_version}")
        return jsonify({"success": True, "version": new_version})
    except Exception as e:
        app_logger.error(f"Error in update_extensions route: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@web_bp.route('/syntax-highlighter')
def syntax_highlighter_page():
    return render_template('syntax_highlighter.html')


@web_bp.route('/sql-highlighter')
def sql_highlighter_page():
    return render_template('sql_highlighter.html')

@web_bp.route('/webcam')
def webcam():
    return render_template('webcam.html')
