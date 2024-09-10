export function initUIManager(elements) {
    function resetUI() {
        elements.youtubeResult.innerText = '';
        elements.whisperResult.innerText = '';
        elements.comparisonResultBox.classList.add('hidden');
        elements.inlineCompareButton.classList.add('hidden');
        elements.sideBySideCompareButton.classList.add('hidden');
        hideResultsSection();
        document.querySelectorAll('.refresh-button').forEach(button => button.classList.add('hidden'));
    }

    function showProgress(message) {
        elements.progressText.classList.remove('hidden');
        elements.progressBarContainer.classList.remove('hidden');
        elements.progressText.innerText = message;
        elements.progressBar.style.width = '0%';
        elements.downloadSpeed.classList.add('hidden');
        elements.eta.classList.add('hidden');
    }

    function hideProgress() {
        setTimeout(() => {
            elements.progressBarContainer.classList.add('hidden');
            elements.progressText.classList.add('hidden');
        }, 2000);
    }

    function updateUI() {
        const selectedMethod = document.querySelector('input[name="method"]:checked').value;
        
        toggleWhisperModelContainer(selectedMethod);

        elements.youtubeResultBox.classList.toggle('hidden', selectedMethod === 'Whisper');
        elements.whisperResultBox.classList.toggle('hidden', selectedMethod === 'YouTube');
        
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.classList.toggle('md:grid-cols-2', selectedMethod === 'Both');

        if (elements.youtubeResult.innerText || elements.whisperResult.innerText) {
            showResultsSection();
        } else {
            hideResultsSection();
        }
    }

    function showResultsSection() {
        elements.resultsSection.classList.remove('hidden');
        elements.resultsSection.style.maxHeight = elements.resultsSection.scrollHeight + 'px';
        elements.resultsSection.style.opacity = '1';
        elements.mainContainer.style.maxWidth = '800px';
    }

    function hideResultsSection() {
        elements.resultsSection.classList.add('hidden');
        elements.resultsSection.style.maxHeight = '0px';
        elements.resultsSection.style.opacity = '0';
        elements.mainContainer.style.maxWidth = '32rem';
    }

    function toggleWhisperModelContainer(selectedMethod) {
        const container = elements.whisperModelContainer;
        const show = selectedMethod === 'Whisper' || selectedMethod === 'Both';

        if (show) {
            container.classList.remove('hidden');
            container.style.maxHeight = container.scrollHeight + 'px';
            container.style.opacity = '1';
        } else {
            container.classList.add('hidden');
            container.style.maxHeight = '0px';
            container.style.opacity = '0';
        }
    }

    function bindEvents(transcriptionManager, comparisonManager) {
        elements.transcriptionForm.addEventListener('submit', transcriptionManager.handleFormSubmit);
        elements.methodRadios.forEach(radio => radio.addEventListener('change', updateUI));
        elements.inlineCompareButton.addEventListener('click', () => {
            comparisonManager.resetComparisonState();
            comparisonManager.compareTranscripts('inline');
        });
        elements.sideBySideCompareButton.addEventListener('click', () => {
            comparisonManager.resetComparisonState();
            comparisonManager.compareTranscripts('side_by_side');
        });
        elements.compareBackButton.addEventListener('click', comparisonManager.handleCompareBack);
        document.querySelectorAll('.refresh-button').forEach(button => {
            button.addEventListener('click', transcriptionManager.handleRefresh);
        });
    }

    // Call this function when the page loads to hide the results section initially
    hideResultsSection();

    return {
        resetUI,
        showProgress,
        hideProgress,
        updateUI,
        toggleWhisperModelContainer,
        bindEvents,
        showResultsSection,
        hideResultsSection
    };
}