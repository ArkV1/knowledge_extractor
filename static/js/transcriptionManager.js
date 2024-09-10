export function initTranscriptionManager(elements, uiManager) {
    function handleFormSubmit(event) {
        event.preventDefault();
        const url = document.getElementById('url').value;
        const method = document.querySelector('input[name="method"]:checked').value;
        const whisperModel = document.getElementById('whisper-model').value;

        uiManager.resetUI();
        uiManager.showProgress('Starting transcription...');

        fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, method, whisperModel }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                try {
                    return JSON.parse(text);
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                    console.error('Received text:', text);
                    throw new Error('Invalid JSON response from server');
                }
            })
            .then(handleTranscriptionResponse)
            .catch(handleTranscriptionError)
            .finally(uiManager.hideProgress);
    }

    function handleTranscriptionResponse(data) {
        if (data.youtube_result) {
            elements.youtubeResult.innerText = data.youtube_result;
            const youtubeRefreshButton = elements.youtubeResultBox.querySelector('.refresh-button');
            if (youtubeRefreshButton) {
                youtubeRefreshButton.classList.remove('hidden');
            }
        }
        if (data.whisper_result) {
            elements.whisperResult.innerText = data.whisper_result;
            const whisperRefreshButton = elements.whisperResultBox.querySelector('.refresh-button');
            if (whisperRefreshButton) {
                whisperRefreshButton.classList.remove('hidden');
            }
        }
        elements.progressText.innerText = 'Transcription complete';
        elements.progressBar.style.width = '100%';

        const selectedMethod = document.querySelector('input[name="method"]:checked').value;
        uiManager.updateUI();
        uiManager.updateComparisonButtons();
    }

    function handleTranscriptionError(error) {
        console.error('Error:', error);
        elements.progressText.innerText = 'An error occurred during transcription: ' + error.message;
    }

    function handleRefresh() {
        const resultBox = this.closest('div').nextElementSibling;
        const boxId = resultBox.id;
        const url = document.getElementById('url').value;
        const method = boxId === 'youtube-result' ? 'YouTube' : 'Whisper';
        const whisperModel = document.getElementById('whisper-model').value;

        resultBox.innerText = 'Fetching transcript...';
        this.disabled = true;

        fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, method, whisperModel }),
        })
            .then(response => response.json())
            .then(data => {
                if (boxId === 'youtube-result') {
                    resultBox.innerText = data.youtube_result;
                } else {
                    resultBox.innerText = data.whisper_result;
                }
                uiManager.updateComparisonButtons();
            })
            .catch(error => {
                console.error('Error:', error);
                resultBox.innerText = 'An error occurred while refreshing the transcript.';
            })
            .finally(() => {
                this.disabled = false;
            });
    }

    return {
        handleFormSubmit,
        handleRefresh
    };
}