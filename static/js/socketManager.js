export function initSocketManager(elements, uiManager) {
    const socket = io();
    let isDownloadComplete = false;

    socket.on('progress', function (data) {
        elements.progressText.classList.remove('hidden');
        elements.progressText.innerText = data.status;

        if (data.status === 'Starting download...') {
            elements.progressBarContainer.classList.remove('hidden');
            elements.progressBar.style.width = '0%';
            isDownloadComplete = false;
        }

        if (data.status.includes('Downloading:')) {
            const match = data.status.match(/(\d+(\.\d+)?)%/);
            if (match) {
                const percent = parseFloat(match[1]);
                elements.progressBar.style.width = `${percent / 2}%`;
            }

            const speedMatch = data.status.match(/Speed: (.+?)\)/);
            if (speedMatch) {
                elements.downloadSpeed.classList.remove('hidden');
                elements.downloadSpeed.innerText = `Download Speed: ${speedMatch[1]}`;
            }

            const etaMatch = data.status.match(/ETA: (.+?)$/);
            if (etaMatch) {
                elements.eta.classList.remove('hidden');
                elements.eta.innerText = `ETA: ${etaMatch[1]}`;
            }
        } else {
            elements.downloadSpeed.classList.add('hidden');
            elements.eta.classList.add('hidden');
        }

        if (data.status === 'Download finished, now converting...') {
            isDownloadComplete = true;
            elements.progressBar.style.width = '50%';
        }

        if (data.status.includes('Transcribing with Whisper')) {
            isDownloadComplete = true;
            elements.progressBar.style.width = '50%';
        }

        if (data.status.includes('Whisper progress:')) {
            const match = data.status.match(/(\d+(\.\d+)?)%/);
            if (match) {
                const percent = parseFloat(match[1]);
                elements.progressBar.style.width = `${50 + (percent / 2)}%`;
            }
        }

        if (data.status === 'YouTube transcription complete.' || 
            data.status === 'Whisper transcription complete.' || 
            data.status === 'Transcription complete.') {
            elements.progressBar.style.width = '100%';
        }

        if (data.status === 'Transcription complete.' || data.status === 'Comparison complete.') {
            setTimeout(() => {
                elements.progressBarContainer.classList.add('hidden');
                elements.progressText.classList.add('hidden');
            }, 2000);
        }
    });

    return {
        // You can add any methods here that you want to expose to other parts of the application
    };
}