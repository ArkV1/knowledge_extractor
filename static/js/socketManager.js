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

        if (elements.progressBarContainer) {
            elements.progressBarContainer.classList.remove('hidden');
        }

        // Handle different progress stages
        switch(true) {
            case data.status.includes('Starting download'):
                elements.progressBar.style.width = '0%';
                break;
                
            case data.status.includes('Downloading:'):
                const match = data.status.match(/(\d+(\.\d+)?)%/);
                if (match) {
                    const percent = parseFloat(match[1]);
                    elements.progressBar.style.width = `${percent * 0.4}%`; // First 40%
                }
                break;
                
            case data.status.includes('Converting audio'):
                elements.progressBar.style.width = '45%';
                break;
                
            case data.status.includes('Loading Whisper model'):
                elements.progressBar.style.width = '50%';
                break;
                
            case data.status.includes('Transcribing'):
                elements.progressBar.style.width = '75%';
                break;
                
            case data.status.includes('complete'):
                elements.progressBar.style.width = '100%';
                setTimeout(() => {
                    elements.progressBarContainer.classList.add('hidden');
                    elements.progressText.classList.add('hidden');
                }, 2000);
                break;
        }
    }

    socket.on('download_speed', function(data) {
        if (elements.downloadSpeed) {
            elements.downloadSpeed.classList.remove('hidden');
            elements.downloadSpeed.innerText = data.speed;
        }
    });

    socket.on('eta', function(data) {
        if (elements.eta) {
            elements.eta.classList.remove('hidden');
            elements.eta.innerText = data.eta;
        }
    });

    return {
        // You can add any methods here that you want to expose to other parts of the application
    };
}