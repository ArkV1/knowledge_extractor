export function initTranscriptionManager(elements, managers) {
    const uiManager = managers.uiManager;

    function handleFormSubmit(event) {
        try {
            const url = document.getElementById('url')?.value;
            const method = document.querySelector('input[name="method"]:checked')?.value;
            const whisperModel = document.getElementById('whisper-model')?.value;

            if (!url || !method) {
                throw new Error("Missing required form data");
            }

            // Reset the UI and show the progress bar while hiding the results section
            uiManager?.resetUI?.();
            uiManager?.showProgress?.('Starting transcription...');
            uiManager?.hideResultsSection?.();

            fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, method, whisperModel }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(handleTranscriptionResponse)
            .catch(handleTranscriptionError)
            .finally(() => uiManager?.hideProgress?.());
        } catch (error) {
            console.error("Error in form submission:", error);
            uiManager?.showProgress?.('An error occurred. Please try again.');
        }
    }

    function handleTranscriptionResponse(data) {
        try {
            // Cache the results
            if (!elements.transcriptionCache) {
                elements.transcriptionCache = {};
            }

            // Process YouTube transcript
            if (data.youtube_result) {
                elements.transcriptionCache.youtube = data.youtube_result;
                if (elements.youtubeResult) {
                    elements.youtubeResult.innerText = data.youtube_result;
                }
                const youtubeRefreshButton = elements.youtubeResultBox?.querySelector('.refresh-button');
                if (youtubeRefreshButton) {
                    youtubeRefreshButton.classList.remove('hidden');
                }
            }

            // Process Whisper transcript
            if (data.whisper_result) {
                elements.transcriptionCache.whisper = data.whisper_result;
                if (elements.whisperResult) {
                    elements.whisperResult.innerText = data.whisper_result;
                }
                const whisperRefreshButton = elements.whisperResultBox?.querySelector('.refresh-button');
                if (whisperRefreshButton) {
                    whisperRefreshButton.classList.remove('hidden');
                }
            }

            if (elements.progressText) {
                elements.progressText.innerText = 'Transcription complete';
            }
            if (elements.progressBar) {
                elements.progressBar.style.width = '100%';
            }

            // Show results section and adjust UI width after transcription completes
            uiManager?.showResultsSection?.();
            uiManager?.updateUI?.();
            uiManager?.updateComparisonButtons?.();
        } catch (error) {
            console.error("Error handling transcription response:", error);
            uiManager?.showProgress?.('An error occurred while processing the transcription.');
        }
    }

    function handleTranscriptionError(error) {
        console.error('Transcription error:', error);
        if (elements.progressText) {
            elements.progressText.innerText = 'An error occurred during transcription: ' + error.message;
        }
    }

    function handleRefresh() {
        try {
            const resultBox = this.closest('div')?.nextElementSibling;
            if (!resultBox) throw new Error("Result box not found");

            const boxId = resultBox.id;
            const url = document.getElementById('url')?.value;
            const method = boxId === 'youtube-result' ? 'YouTube' : 'Whisper';
            const whisperModel = document.getElementById('whisper-model')?.value;

            if (!url) throw new Error("URL is missing");

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
                uiManager?.updateComparisonButtons?.();
            })
            .catch(error => {
                console.error('Error:', error);
                resultBox.innerText = 'An error occurred while refreshing the transcript.';
            })
            .finally(() => {
                this.disabled = false;
            });
        } catch (error) {
            console.error("Error in refresh handling:", error);
            alert("An error occurred while attempting to refresh. Please try again.");
        }
    }

    return {
        handleFormSubmit,
        handleRefresh
    };
}