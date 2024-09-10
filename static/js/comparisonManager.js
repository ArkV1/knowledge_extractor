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
                const comparisonResult = document.getElementById('comparison-result');
                comparisonResult.innerHTML = ''; // Clear previous results

                if (mode === 'inline') {
                    comparisonResult.innerHTML = `<div class="w-full">${data.comparison_result}</div>`;
                } else if (mode === 'side_by_side') {
                    comparisonResult.innerHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                            <h5 class="font-bold text-gray-800 mb-2">YouTube Transcript:</h5>
                            <div>${data.youtube_result}</div>
                        </div>
                        <div class="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                            <h5 class="font-bold text-gray-800 mb-2">Whisper Transcript:</h5>
                            <div>${data.whisper_result}</div>
                        </div>
                    </div>
                `;
                }

                uiManager.showComparisonResult();
            })
            .catch(error => {
                console.error('Error:', error);
                elements.progressText.innerText = 'An error occurred during comparison: ' + error.message;
            })
            .finally(uiManager.hideProgress);
    }
    function resetComparisonState() {
        const comparisonResult = document.getElementById('comparison-result');
        if (comparisonResult) comparisonResult.innerHTML = '';
    }

    function handleCompareBack() {
        uiManager.hideComparisonResult();
    }

    return {
        compareTranscripts,
        resetComparisonState,
        handleCompareBack
    };
}