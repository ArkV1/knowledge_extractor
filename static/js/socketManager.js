export function initSocketManager(elements, uiManager) {
    let socket;
    try {
        socket = io();
    } catch (error) {
        console.error("Failed to initialize socket:", error);
        return null;
    }

    let isDownloadComplete = false;

    socket.on('connect', () => {
        console.log('Socket connected successfully');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    socket.on('progress', function (data) {
        try {
            updateProgress(data);
        } catch (error) {
            console.error('Error handling progress update:', error);
        }
    });

    function updateProgress(data) {
        if (!data || typeof data.status !== 'string') {
            console.warn('Invalid progress data received');
            return;
        }

        if (elements.progressText) {
            elements.progressText.classList.remove('hidden');
            elements.progressText.innerText = data.status;
        }

        if (data.status === 'Starting download...') {
            if (elements.progressBarContainer) {
                elements.progressBarContainer.classList.remove('hidden');
            }
            if (elements.progressBar) {
                elements.progressBar.style.width = '0%';
            }
            isDownloadComplete = false;
        }

        if (data.status.includes('Downloading:')) {
            const match = data.status.match(/(\d+(\.\d+)?)%/);
            if (match && elements.progressBar) {
                const percent = parseFloat(match[1]);
                elements.progressBar.style.width = `${percent / 2}%`;
            }

            const speedMatch = data.status.match(/Speed: (.+?)\)/);
            if (speedMatch && elements.downloadSpeed) {
                elements.downloadSpeed.classList.remove('hidden');
                elements.downloadSpeed.innerText = `Download Speed: ${speedMatch[1]}`;
            }

            const etaMatch = data.status.match(/ETA: (.+?)$/);
            if (etaMatch && elements.eta) {
                elements.eta.classList.remove('hidden');
                elements.eta.innerText = `ETA: ${etaMatch[1]}`;
            }
        } else {
            if (elements.downloadSpeed) elements.downloadSpeed.classList.add('hidden');
            if (elements.eta) elements.eta.classList.add('hidden');
        }

        if (data.status === 'Download finished, now converting...' || data.status.includes('Transcribing with Whisper')) {
            isDownloadComplete = true;
            if (elements.progressBar) {
                elements.progressBar.style.width = '50%';
            }
        }

        if (data.status.includes('Whisper progress:')) {
            const match = data.status.match(/(\d+(\.\d+)?)%/);
            if (match && elements.progressBar) {
                const percent = parseFloat(match[1]);
                elements.progressBar.style.width = `${50 + (percent / 2)}%`;
            }
        }

        if (data.status === 'YouTube transcription complete.' || 
            data.status === 'Whisper transcription complete.' || 
            data.status === 'Transcription complete.') {
            if (elements.progressBar) {
                elements.progressBar.style.width = '100%';
            }
        }

        if (data.status === 'Transcription complete.' || data.status === 'Comparison complete.') {
            setTimeout(() => {
                if (elements.progressBarContainer) elements.progressBarContainer.classList.add('hidden');
                if (elements.progressText) elements.progressText.classList.add('hidden');
            }, 2000);
        }
    }

    return {
        // You can add any methods here that you want to expose to other parts of the application
    };
}