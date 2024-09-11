document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pdf-form');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress');
    const resultContainer = document.getElementById('result-container');
    const pdfViewer = document.getElementById('pdf-viewer');
    const downloadLink = document.getElementById('download-link');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const url = document.getElementById('url').value;

        progressContainer.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        progressBar.style.width = '0%';
        progressText.textContent = 'Starting conversion...';

        fetch('/api/convert-to-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url }),
        })
        .then(response => response.json())
        .then(data => {
            progressBar.style.width = '100%';
            progressText.textContent = 'Conversion complete!';
            
            pdfViewer.src = `/download/${data.filename}`;
            downloadLink.href = `/download/${data.filename}`;
            
            resultContainer.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            progressText.textContent = 'An error occurred during conversion.';
        });
    });
});