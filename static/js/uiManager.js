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
        updateResultBoxesVisibility(selectedMethod);

        if (elements.youtubeResult.innerText || elements.whisperResult.innerText) {
            showResultsSection();
        } else {
            hideResultsSection();
        }

        updateComparisonButtons();
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
        elements.resultsSection.style.maxHeight = elements.resultsSection.scrollHeight + 'px';
        elements.resultsSection.style.opacity = '1';
        elements.mainContainer.style.maxWidth = '90%'; // Adjust to 90% of the viewport width
        elements.mainContainer.style.width = '1200px'; // Set a maximum width
    }

    function hideResultsSection() {
        elements.resultsSection.classList.add('hidden');
        elements.resultsSection.style.maxHeight = '0px';
        elements.resultsSection.style.opacity = '0';
        elements.mainContainer.style.maxWidth = '100%';
        elements.mainContainer.style.width = '672px'; // 2xl in Tailwind (same as max-w-2xl)
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

    function showComparisonResult() {
        elements.youtubeResultBox.classList.add('hidden');
        elements.whisperResultBox.classList.add('hidden');
        elements.comparisonResultBox.classList.remove('hidden');
        elements.inlineCompareButton.classList.add('hidden');
        elements.sideBySideCompareButton.classList.add('hidden');
        elements.mainContainer.style.maxWidth = '90%'; // Adjust to 90% of the viewport width
        elements.mainContainer.style.width = '1200px'; // Set a maximum width
    }

    function hideComparisonResult() {
        elements.comparisonResultBox.classList.add('hidden');
        updateResultBoxesVisibility(document.querySelector('input[name="method"]:checked').value);
        updateComparisonButtons();
        elements.mainContainer.style.maxWidth = '100%';
        elements.mainContainer.style.width = '672px'; // 2xl in Tailwind (same as max-w-2xl)
    }

    function initUI() {
        const selectedMethod = document.querySelector('input[name="method"]:checked').value;
        toggleWhisperModelContainer(selectedMethod);
        updateResultBoxesVisibility(selectedMethod);
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

    // Call these functions when the page loads
    hideResultsSection();
    initUI();

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