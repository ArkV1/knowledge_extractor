export function getElements() {
    return {
        mainContainer: document.getElementById('main-container'),
        youtubeResult: document.getElementById('youtube-result'),
        whisperResult: document.getElementById('whisper-result'),
        downloadSpeed: document.getElementById('download-speed'),
        eta: document.getElementById('eta'),
        whisperModelContainer: document.getElementById('whisper-model-container'),
        inlineCompareButton: document.getElementById('inline-compare-button'),
        sideBySideCompareButton: document.getElementById('side-by-side-compare-button'),
        progressBar: document.getElementById('progress-bar'),
        progressBarContainer: document.getElementById('progress-bar-container'),
        progressText: document.getElementById('progress'),
        resultsSection: document.getElementById('results-section'),
        resultsTitle: document.getElementById('results-title'),
        resultsContainer: document.getElementById('results-container'),
        transcriptionForm: document.getElementById('transcription-form'),
        youtubeResultBox: document.getElementById('youtube-result-box'),
        whisperResultBox: document.getElementById('whisper-result-box'),
        comparisonResultBox: document.getElementById('comparison-result-box'),
        compareBackButton: document.getElementById('compare-back-button'),
    };
}