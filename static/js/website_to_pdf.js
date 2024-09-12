document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('pdf-form');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress');
    const resultContainer = document.getElementById('result-container');
    const pdfViewer = document.getElementById('pdf-viewer');
    const downloadLink = document.getElementById('download-link');
    const mainContainer = document.getElementById('main-container');

    function adjustContainerSize() {
        if (resultContainer.classList.contains('hidden')) {
            mainContainer.style.maxWidth = '672px';
        } else {
            mainContainer.style.maxWidth = '100%';
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const url = document.getElementById('url').value;
        const orientation = document.getElementById('orientation').value;

        progressContainer.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        progressBar.style.width = '0%';
        progressText.textContent = 'Starting conversion...';

        fetch('/api/convert-to-pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url, orientation: orientation }),
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);  // Debug print
                if (data.error) {
                    progressText.textContent = data.error;
                    return;
                }
                progressBar.style.width = '100%';
                progressText.textContent = 'Conversion complete!';

                pdfViewer.src = `/download/${data.filename}`;
                downloadLink.href = `/download/${data.filename}`;

                resultContainer.classList.remove('hidden');
                adjustContainerSize();
                adjustPdfViewerWidth();
            })
            .catch(error => {
                progressText.textContent = 'An error occurred during conversion.';
                console.error('Error:', error);
            });
    });

    function adjustPdfViewerWidth() {
        if (resultContainer.classList.contains('hidden')) {
            mainContainer.classList.remove('w-full');
            mainContainer.classList.add('max-w-2xl');
        } else {
            mainContainer.classList.remove('max-w-2xl');
            mainContainer.classList.add('w-full');
        }
    }

    // Call this function initially to set the correct size
    adjustContainerSize();
});