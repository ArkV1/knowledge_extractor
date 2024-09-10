export function initComparisonManager(elements, uiManager) {
    function compareTranscripts(mode) {
        const youtubeTranscript = elements.youtubeResult.innerText;
        const whisperTranscript = elements.whisperResult.innerText;

        if (!youtubeTranscript || !whisperTranscript) {
            console.error('One or both transcripts are empty');
            elements.progressText.innerText = 'Error: One or both transcripts are empty';
            return;
        }

        uiManager.showProgress('Comparing transcripts...');

        fetch('/api/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                youtube_transcript: youtubeTranscript, 
                whisper_transcript: whisperTranscript,
                comparison_mode: mode
            }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            ensureComparisonElements();
            const comparisonResult = document.getElementById('comparison-result');
            const youtubeComparison = document.getElementById('youtube-comparison');
            const whisperComparison = document.getElementById('whisper-comparison');

            if (mode === 'inline') {
                comparisonResult.innerHTML = data.comparison_result;
                comparisonResult.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4');
                youtubeComparison.innerHTML = '';
                whisperComparison.innerHTML = '';
            } else if (mode === 'side_by_side') {
                youtubeComparison.innerHTML = data.youtube_result;
                whisperComparison.innerHTML = data.whisper_result;
                comparisonResult.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4');
            }

            elements.comparisonResultBox.classList.remove('hidden');
            elements.youtubeResultBox.classList.add('hidden');
            elements.whisperResultBox.classList.add('hidden');
            elements.inlineCompareButton.classList.add('hidden');
            elements.sideBySideCompareButton.classList.add('hidden');
        })
        .catch(error => {
            console.error('Error:', error);
            elements.progressText.innerText = 'An error occurred during comparison: ' + error.message;
        })
        .finally(uiManager.hideProgress);
    }

    function ensureComparisonElements() {
        const comparisonResultBox = document.getElementById('comparison-result-box');
        if (!comparisonResultBox) {
            console.error('Comparison result box not found');
            return;
        }

        let comparisonResult = document.getElementById('comparison-result');
        if (!comparisonResult) {
            comparisonResult = document.createElement('div');
            comparisonResult.id = 'comparison-result';
            comparisonResultBox.appendChild(comparisonResult);
        }

        let youtubeComparison = document.getElementById('youtube-comparison');
        if (!youtubeComparison) {
            youtubeComparison = document.createElement('div');
            youtubeComparison.id = 'youtube-comparison';
            youtubeComparison.className = 'bg-gray-50 p-4 border border-gray-200 rounded-lg mb-4';
            comparisonResult.appendChild(youtubeComparison);
        }

        let whisperComparison = document.getElementById('whisper-comparison');
        if (!whisperComparison) {
            whisperComparison = document.createElement('div');
            whisperComparison.id = 'whisper-comparison';
            whisperComparison.className = 'bg-gray-50 p-4 border border-gray-200 rounded-lg';
            comparisonResult.appendChild(whisperComparison);
        }
    }

    function resetComparisonState() {
        const comparisonResult = document.getElementById('comparison-result');
        const youtubeComparison = document.getElementById('youtube-comparison');
        const whisperComparison = document.getElementById('whisper-comparison');

        if (comparisonResult) comparisonResult.innerHTML = '';
        if (youtubeComparison) youtubeComparison.innerHTML = '';
        if (whisperComparison) whisperComparison.innerHTML = '';

        elements.comparisonResultBox.classList.add('hidden');
        elements.youtubeResultBox.classList.remove('hidden');
        elements.whisperResultBox.classList.remove('hidden');
        elements.inlineCompareButton.classList.remove('hidden');
        elements.sideBySideCompareButton.classList.remove('hidden');
    }

    function handleCompareBack() {
        resetComparisonState();
    }

    return {
        compareTranscripts,
        resetComparisonState,
        handleCompareBack
    };
}