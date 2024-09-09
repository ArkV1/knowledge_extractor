const socket = io();
const mainContainer = document.getElementById('main-container');
const innerContainer = document.getElementById('inner-container');
const youtubeResult = document.getElementById('youtube-result');
const whisperResult = document.getElementById('whisper-result');
const downloadSpeed = document.getElementById('download-speed');
const eta = document.getElementById('eta');
const whisperModelContainer = document.getElementById('whisper-model-container');
const compareButton = document.getElementById('compare-button');
const progressBar = document.getElementById('progress-bar');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressText = document.getElementById('progress');
let isComparisonVisible = false;  // Track if comparison is active

function resetUI() {
    youtubeResult.innerText = '';
    whisperResult.innerText = '';
    document.getElementById('youtube-result-box').classList.remove('hidden');
    document.getElementById('whisper-result-box').classList.add('hidden');
    document.getElementById('comparison-result-box').classList.add('hidden');
    compareButton.innerText = "Compare Transcripts";
    compareButton.classList.add('hidden');
    document.getElementById('url').value = '';
    document.getElementById('youtube').checked = true;
    isComparisonVisible = false;

    // Hide all refresh buttons
    document.querySelectorAll('.refresh-button').forEach(button => {
        button.classList.add('hidden');
    });

    updateResultBoxes();
}

document.getElementById('transcription-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const url = document.getElementById('url').value;
    const method = document.querySelector('input[name="method"]:checked').value;
    const whisperModel = document.getElementById('whisper-model').value;

    progressText.classList.remove('hidden');
    progressBarContainer.classList.remove('hidden');
    progressText.innerText = 'Starting transcription...';
    progressBar.style.width = '0%';
    downloadSpeed.classList.add('hidden');
    eta.classList.add('hidden');

    // Reset result boxes
    youtubeResult.innerText = '';
    whisperResult.innerText = '';
    document.getElementById('youtube-result-box').classList.remove('hidden');
    document.getElementById('whisper-result-box').classList.add('hidden');
    document.getElementById('comparison-result-box').classList.add('hidden');
    compareButton.classList.add('hidden');

    // Hide all refresh buttons initially
    document.querySelectorAll('.refresh-button').forEach(button => {
        button.classList.add('hidden');
    });

    if (method === 'Whisper' || method === 'Both') {
        document.getElementById('whisper-result-box').classList.remove('hidden');
    }

    fetch('/api/transcribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, method, whisperModel }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.youtube_result) {
                youtubeResult.innerText = data.youtube_result;
                document.getElementById('youtube-result-box').querySelector('.refresh-button').classList.remove('hidden');
            }
            if (data.whisper_result) {
                whisperResult.innerText = data.whisper_result;
                document.getElementById('whisper-result-box').querySelector('.refresh-button').classList.remove('hidden');
            }
            if (data.youtube_result && data.whisper_result &&
                !data.youtube_result.startsWith("No transcript available") &&
                !data.youtube_result.startsWith("Error fetching YouTube transcript")) {
                compareButton.classList.remove('hidden');
            }
            progressText.innerText = 'Transcription complete';
            progressBar.style.width = '100%';
            adjustContainerWidth();
        })
        .catch(error => {
            console.error('Error:', error);
            progressText.innerText = 'An error occurred during transcription.';
        })
        .finally(() => {
            setTimeout(() => {
                progressBarContainer.classList.add('hidden');
                progressText.classList.add('hidden');
            }, 2000);
        });
});

function adjustContainerWidth() {
    const hasContent = youtubeResult.innerText || whisperResult.innerText || document.getElementById('comparison-result').innerHTML;
    if (hasContent) {
        mainContainer.classList.add('fade-in');
        mainContainer.classList.remove('max-w-lg');
        mainContainer.classList.add('max-w-4xl');
        innerContainer.classList.add('max-w-lg');
        setTimeout(() => {
            mainContainer.classList.add('show');
        }, 50);
    } else {
        mainContainer.classList.remove('show');
        setTimeout(() => {
            mainContainer.classList.remove('max-w-4xl');
            mainContainer.classList.add('max-w-lg');
            innerContainer.classList.remove('max-w-lg');
            mainContainer.classList.remove('fade-in');
        }, 300);
    }
}

function showResultBox(boxId) {
    const box = document.getElementById(boxId);
    box.classList.remove('hidden');
    box.classList.add('slide-down');
    setTimeout(() => {
        box.classList.add('show');
    }, 50);
}

function hideResultBox(boxId) {
    const box = document.getElementById(boxId);
    box.classList.remove('show');
    setTimeout(() => {
        box.classList.add('hidden');
        box.classList.remove('slide-down');
    }, 300);
}

function updateResultBoxes() {
    const method = document.querySelector('input[name="method"]:checked').value;
    const youtubeBox = document.getElementById('youtube-result-box');
    const whisperBox = document.getElementById('whisper-result-box');
    const resultsContainer = document.getElementById('results-container');

    hideResultBox('youtube-result-box');
    hideResultBox('whisper-result-box');
    resultsContainer.classList.remove('md:grid-cols-2');
    whisperModelContainer.classList.add('hidden');
    compareButton.classList.add('hidden');

    if (method === 'YouTube' || method === 'Both') {
        showResultBox('youtube-result-box');
    }
    if (method === 'Whisper' || method === 'Both') {
        showResultBox('whisper-result-box');
        whisperModelContainer.classList.remove('hidden');
    }
    if (method === 'Both') {
        resultsContainer.classList.add('md:grid-cols-2');
        if (youtubeResult.innerText && whisperResult.innerText &&
            youtubeResult.innerText !== 'Fetching transcript...' &&
            whisperResult.innerText !== 'Fetching transcript...') {
            compareButton.classList.remove('hidden');
        }
    }
}

compareButton.addEventListener('click', function () {
    const youtubeTranscript = youtubeResult.innerText;
    const whisperTranscript = whisperResult.innerText;

    progressText.classList.remove('hidden');
    progressBarContainer.classList.remove('hidden');
    progressText.innerText = 'Comparing transcripts...';
    progressBar.style.width = '0%';

    fetch('/api/compare', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtube_transcript: youtubeTranscript, whisper_transcript: whisperTranscript }),
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('comparison-result').innerHTML = data.comparison_result;
            showResultBox('comparison-result-box');
            hideResultBox('youtube-result-box');
            hideResultBox('whisper-result-box');
            compareButton.classList.add('hidden');
            document.getElementById('comparison-result-box').querySelector('.refresh-button').classList.remove('hidden');
            adjustContainerWidth();
        })
        .catch(error => {
            console.error('Error:', error);
            progressText.innerText = 'An error occurred during comparison.';
        })
        .finally(() => {
            progressBarContainer.classList.add('hidden');
            progressText.innerText = 'Comparison complete';
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressText.classList.add('hidden');
            }, 2000);
        });
});

document.getElementById('compare-back-button').addEventListener('click', function () {
    hideResultBox('comparison-result-box');
    showResultBox('youtube-result-box');
    showResultBox('whisper-result-box');
    compareButton.classList.remove('hidden');
});


document.querySelectorAll('input[name="method"]').forEach((radio) => {
    radio.addEventListener('change', updateResultBoxes);
});

document.querySelectorAll('.refresh-button').forEach(button => {
    button.addEventListener('click', function () {
        const resultBox = this.closest('div').nextElementSibling;
        const boxId = resultBox.id;
        const url = document.getElementById('url').value;
        const method = boxId === 'youtube-result' ? 'YouTube' : 'Whisper';
        const whisperModel = document.getElementById('whisper-model').value;

        // Show loading state
        resultBox.innerText = 'Fetching transcript...';
        this.disabled = true;

        fetch('/api/transcribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, method, whisperModel }),
        })
            .then(response => response.json())
            .then(data => {
                if (boxId === 'youtube-result') {
                    resultBox.innerText = data.youtube_result;
                } else {
                    resultBox.innerText = data.whisper_result;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                resultBox.innerText = 'An error occurred while refreshing the transcript.';
            })
            .finally(() => {
                this.disabled = false;
            });
    });
});

updateResultBoxes();

socket.on('progress', function (data) {
    progressText.classList.remove('hidden');
    progressText.innerText = data.status;

    // When the download starts, the progress bar should stay at 0%
    if (data.status === 'Starting download...') {
        progressBarContainer.classList.remove('hidden');
        progressBar.style.width = '0%';  // Start with the bar empty
    }

    // For download progress
    if (data.status.includes('Downloading:')) {
        const match = data.status.match(/(\d+(\.\d+)?)%/);
        if (match) {
            const percent = parseFloat(match[1]);
            progressBar.style.width = `${percent}%`;  // Update the bar with the download progress
        }

        const speedMatch = data.status.match(/Speed: (.+?)\)/);
        if (speedMatch) {
            downloadSpeed.classList.remove('hidden');
            downloadSpeed.innerText = `Download Speed: ${speedMatch[1]}`;
        }

        const etaMatch = data.status.match(/ETA: (.+?)$/);
        if (etaMatch) {
            eta.classList.remove('hidden');
            eta.innerText = `ETA: ${etaMatch[1]}`;
        }
    } else {
        downloadSpeed.classList.add('hidden');
        eta.classList.add('hidden');
    }

    // Ensure other progress steps like transcription update the progress bar as needed
    if (data.status === 'YouTube transcription complete.') {
        progressBar.style.width = '50%';  // Midway point for YouTube transcription
    } else if (data.status === 'Whisper transcription complete.' || data.status === 'Transcription complete.') {
        progressBar.style.width = '100%';  // Complete progress when transcription finishes
    }

    // Hide the progress bar after completion
    if (data.status === 'Transcription complete.' || data.status === 'Comparison complete.') {
        setTimeout(() => {
            progressBarContainer.classList.add('hidden');
            progressText.classList.add('hidden');
        }, 2000);
    }
});
