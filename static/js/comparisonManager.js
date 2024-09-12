export function initComparisonManager(elements, managers) {
    const uiManager = managers.uiManager;

    function compareTranscripts(mode) {
        try {
            const youtubeTranscript = elements.youtubeResult?.innerText;
            const whisperTranscript = elements.whisperResult?.innerText;

            if (!youtubeTranscript || !whisperTranscript) {
                throw new Error("One or both transcripts are missing");
            }

            // Store original transcriptions
            elements.youtubeResult.dataset.originalText = youtubeTranscript;
            elements.whisperResult.dataset.originalText = whisperTranscript;

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
                if (mode === 'inline') {
                    const comparisonResult = elements.comparisonResultBox?.querySelector('#comparison-result');
                    if (comparisonResult) {
                        comparisonResult.innerHTML = data.comparison_result;
                    } else {
                        throw new Error("Comparison result element not found");
                    }
                } else if (mode === 'side_by_side') {
                    if (elements.youtubeResult && elements.whisperResult) {
                        elements.youtubeResult.innerHTML = data.youtube_result;
                        elements.whisperResult.innerHTML = data.whisper_result;
                    } else {
                        throw new Error("Result elements not found");
                    }
                }
                uiManager?.showComparisonResult(mode);
            })
            .catch(error => {
                console.error('Error:', error);
                const comparisonResult = elements.comparisonResultBox?.querySelector('#comparison-result');
                if (comparisonResult) {
                    comparisonResult.innerText = 'An error occurred during comparison.';
                }
            });
        } catch (error) {
            console.error("Error in comparison:", error);
            alert("An error occurred while comparing transcripts. Please try again.");
        }
    }

    function handleCompareBack() {
        uiManager?.hideComparisonResult();
    }

    return {
        compareTranscripts,
        handleCompareBack
    };
}