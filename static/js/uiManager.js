export function initUIManager(elements) {
    function resetUI() {
        elements.youtubeResult.innerText = '';
        elements.whisperResult.innerText = '';
        elements.comparisonResultBox.classList.add('hidden');
        elements.inlineCompareButton.classList.add('hidden');
        elements.sideBySideCompareButton.classList.add('hidden');
    }

    function showProgress(message) {
        elements.progressText.classList.remove('hidden');
        elements.progressBarContainer.classList.remove('hidden');
        elements.progressText.innerText = message;
        elements.progressBar.style.width = '0%';
    }

    function hideProgress() {
        setTimeout(() => {
            elements.progressBarContainer.classList.add('hidden');
            elements.progressText.classList.add('hidden');
        }, 2000);
    }

    function updateUI() {
        const selectedMethod = document.querySelector('input[name="method"]:checked').value;

        // Toggle Whisper model container based on selected method
        toggleWhisperModelContainer(selectedMethod);

        // Update the result boxes visibility based on the selected method
        updateResultBoxesVisibility(selectedMethod);

        if (elements.youtubeResult.innerText || elements.whisperResult.innerText) {
            showResultsSection();
        }

        updateComparisonButtons();
    }

    function toggleWhisperModelContainer(selectedMethod) {
        const container = elements.whisperModelContainer;
        const show = selectedMethod === 'Whisper' || selectedMethod === 'Both';

        if (show) {
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    }

    function updateResultBoxesVisibility(selectedMethod) {
        elements.youtubeResultBox.classList.toggle('hidden', selectedMethod === 'Whisper');
        elements.whisperResultBox.classList.toggle('hidden', selectedMethod === 'YouTube');

        const resultsContainer = document.getElementById('results-container');
        resultsContainer.classList.toggle('md:grid-cols-2', selectedMethod === 'Both');
    }

    function updateComparisonButtons() {
        const showButtons = elements.youtubeResult.innerText && elements.whisperResult.innerText;
        elements.inlineCompareButton.classList.toggle('hidden', !showButtons);
        elements.sideBySideCompareButton.classList.toggle('hidden', !showButtons);
    }

    function showResultsSection() {
        elements.resultsSection.classList.remove('hidden');
        elements.mainContainer.style.maxWidth = '1200px';  // Expand container width when results are shown
    }

    function hideResultsSection() {
        elements.resultsSection.classList.add('hidden');
        elements.mainContainer.style.maxWidth = '672px';  // Reset to initial width
    }

    function showComparisonResult() {
        elements.youtubeResultBox.classList.add('hidden');
        elements.whisperResultBox.classList.add('hidden');
        elements.comparisonResultBox.classList.remove('hidden');
        elements.inlineCompareButton.classList.add('hidden');
        elements.sideBySideCompareButton.classList.add('hidden');
    }

    function hideComparisonResult() {
        elements.comparisonResultBox.classList.add('hidden');
        updateResultBoxesVisibility(document.querySelector('input[name="method"]:checked').value);
        updateComparisonButtons();
    }

    function bindEvents(transcriptionManager, comparisonManager) {
        elements.transcriptionForm.addEventListener('submit', transcriptionManager.handleFormSubmit);

        // Bind the radio buttons to update UI when selected
        elements.methodRadios.forEach(radio => radio.addEventListener('change', updateUI));

        elements.inlineCompareButton.addEventListener('click', () => {
            comparisonManager.compareTranscripts('inline');
        });

        elements.sideBySideCompareButton.addEventListener('click', () => {
            comparisonManager.compareTranscripts('side_by_side');
        });

        elements.compareBackButton.addEventListener('click', comparisonManager.handleCompareBack);
    }

    hideResultsSection();  // Initialize with the results section hidden

    return {
        resetUI,
        showProgress,
        hideProgress,
        updateUI,
        toggleWhisperModelContainer,
        bindEvents,
        showResultsSection,
        hideResultsSection,
        updateResultBoxesVisibility,
        updateComparisonButtons,
        showComparisonResult,
        hideComparisonResult
    };
}
