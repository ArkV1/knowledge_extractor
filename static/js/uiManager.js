export function initUIManager(elements) {
    const INITIAL_WIDTH = '672px';
    const FULL_WIDTH = '100%';

    function safelyToggleClass(element, className, force) {
        if (element && element.classList) {
            element.classList.toggle(className, force);
        } else {
            console.warn(`Unable to toggle class ${className} on element`, element);
        }
    }

    function safelySetStyle(element, property, value) {
        if (element && element.style) {
            element.style[property] = value;
        } else {
            console.warn(`Unable to set style ${property} on element`, element);
        }
    }

    function resetUI() {
        if (elements.youtubeResult) elements.youtubeResult.innerText = '';
        if (elements.whisperResult) elements.whisperResult.innerText = '';
        safelyToggleClass(elements.comparisonResultBox, 'hidden', true);
        safelyToggleClass(elements.inlineCompareButton, 'hidden', true);
        safelyToggleClass(elements.sideBySideCompareButton, 'hidden', true);
        resetContainerWidth();
    }

    function showProgress(message) {
        safelyToggleClass(elements.progressText, 'hidden', false);
        safelyToggleClass(elements.progressBarContainer, 'hidden', false);
        if (elements.progressText) elements.progressText.innerText = message;
        safelySetStyle(elements.progressBar, 'width', '0%');
    }

    function hideProgress() {
        setTimeout(() => {
            safelyToggleClass(elements.progressBarContainer, 'hidden', true);
            safelyToggleClass(elements.progressText, 'hidden', true);
        }, 2000);
    }

    function updateUI() {
        const selectedMethod = document.querySelector('input[name="method"]:checked');
        if (!selectedMethod) {
            console.warn("No transcription method selected");
            return;
        }

        toggleWhisperModelContainer(selectedMethod.value);
        updateResultBoxesVisibility(selectedMethod.value);

        // Update the results based on the selected method
        if (selectedMethod.value === 'YouTube' && elements.transcriptionCache?.youtube) {
            elements.youtubeResult.innerText = elements.transcriptionCache.youtube;
        } else if (selectedMethod.value === 'Whisper' && elements.transcriptionCache?.whisper) {
            elements.whisperResult.innerText = elements.transcriptionCache.whisper;
        } else if (selectedMethod.value === 'Both') {
            if (elements.transcriptionCache?.youtube) {
                elements.youtubeResult.innerText = elements.transcriptionCache.youtube;
            }
            if (elements.transcriptionCache?.whisper) {
                elements.whisperResult.innerText = elements.transcriptionCache.whisper;
            }
        }

        updateComparisonButtons();
    }

    function toggleWhisperModelContainer(selectedMethod) {
        safelyToggleClass(elements.whisperModelContainer, 'hidden', !(selectedMethod === 'Whisper' || selectedMethod === 'Both'));
    }

    function updateResultBoxesVisibility(selectedMethod) {
        const youtubeHasContent = elements.youtubeResult && elements.youtubeResult.innerText.trim() !== '';
        const whisperHasContent = elements.whisperResult && elements.whisperResult.innerText.trim() !== '';

        safelyToggleClass(elements.youtubeResultBox, 'hidden', selectedMethod === 'Whisper' || !youtubeHasContent);
        safelyToggleClass(elements.whisperResultBox, 'hidden', selectedMethod === 'YouTube' || !whisperHasContent);

        // Remove mt-4 class from both result boxes
        safelyToggleClass(elements.youtubeResultBox, 'mt-4', false);
        safelyToggleClass(elements.whisperResultBox, 'mt-4', false);

        const resultsContainer = document.getElementById('results-container');
        if (resultsContainer) {
            if (selectedMethod === 'Both' && youtubeHasContent && whisperHasContent) {
                resultsContainer.classList.remove('flex', 'flex-col');
                resultsContainer.classList.add('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-4');
                // Add consistent top margin to both result boxes
                elements.youtubeResultBox.style.marginTop = '0';
                elements.whisperResultBox.style.marginTop = '0';
            } else {
                resultsContainer.classList.remove('grid', 'grid-cols-1', 'lg:grid-cols-2', 'gap-4');
                resultsContainer.classList.add('flex', 'flex-col', 'space-y-4');
                // Reset top margin for individual result boxes
                elements.youtubeResultBox.style.marginTop = '';
                elements.whisperResultBox.style.marginTop = '';
            }
        }

        const hasVisibleResults = (selectedMethod === 'YouTube' && youtubeHasContent) ||
            (selectedMethod === 'Whisper' && whisperHasContent) ||
            (selectedMethod === 'Both' && (youtubeHasContent || whisperHasContent));

        if (hasVisibleResults) {
            showResultsSection();
        } else {
            hideResultsSection();
        }

        const youtubeRefreshButton = elements.youtubeResultBox?.querySelector('.refresh-button');
        const whisperRefreshButton = elements.whisperResultBox?.querySelector('.refresh-button');

        if (selectedMethod === 'Both' && youtubeHasContent && whisperHasContent) {
            safelyToggleClass(youtubeRefreshButton, 'hidden', false);
            safelyToggleClass(whisperRefreshButton, 'hidden', false);
        } else {
            safelyToggleClass(youtubeRefreshButton, 'hidden', true);
            safelyToggleClass(whisperRefreshButton, 'hidden', true);
        }
    }

    function updateComparisonButtons() {
        const showButtons = elements.youtubeResult && elements.whisperResult &&
            elements.youtubeResult.innerText.trim() && elements.whisperResult.innerText.trim();
        safelyToggleClass(elements.inlineCompareButton, 'hidden', !showButtons);
        safelyToggleClass(elements.sideBySideCompareButton, 'hidden', !showButtons);
    }

    function showResultsSection() {
        safelyToggleClass(elements.resultsSection, 'hidden', false);
        safelyToggleClass(elements.resultsTitle, 'hidden', false);
        safelySetStyle(elements.mainContainer, 'maxWidth', FULL_WIDTH);
        safelySetStyle(elements.resultsSection, 'width', FULL_WIDTH);
        safelySetStyle(elements.resultsContainer, 'width', FULL_WIDTH);
    }

    function hideResultsSection() {
        safelyToggleClass(elements.resultsSection, 'hidden', true);
        safelyToggleClass(elements.resultsTitle, 'hidden', true);
        resetContainerWidth();
    }

    function resetContainerWidth() {
        safelySetStyle(elements.mainContainer, 'maxWidth', INITIAL_WIDTH);
        safelySetStyle(elements.resultsSection, 'width', '100%');
        safelySetStyle(elements.resultsContainer, 'width', '100%');
    }

    function showComparisonResult(mode) {
        if (elements.compareBackButton) {
            elements.compareBackButton.classList.remove('hidden');
        }
        if (mode === 'inline') {
            elements.comparisonResultBox.classList.remove('hidden');
            elements.youtubeResultBox.classList.add('hidden');
            elements.whisperResultBox.classList.add('hidden');
            elements.mainContainer.style.maxWidth = '100%';
            elements.comparisonResultBox.style.width = '100%';
            elements.resultsContainer.style.display = 'block';
            elements.resultsContainer.style.width = '100%';
        } else if (mode === 'side_by_side') {
            elements.comparisonResultBox.classList.add('hidden');
            elements.youtubeResultBox.classList.remove('hidden');
            elements.whisperResultBox.classList.remove('hidden');
            elements.mainContainer.style.maxWidth = '100%';
            elements.youtubeResultBox.style.width = '50%';
            elements.whisperResultBox.style.width = '50%';
            elements.resultsContainer.style.display = 'flex';
            elements.resultsContainer.style.justifyContent = 'space-between';
            elements.resultsContainer.style.width = '100%';
            const sideBySideBackButton = document.getElementById('compare-back-button-side-by-side');
            if (sideBySideBackButton) {
                sideBySideBackButton.classList.remove('hidden');
            }
        }

        // Hide refresh buttons in comparison mode
        const refreshButtons = document.querySelectorAll('.refresh-button');
        refreshButtons.forEach(button => button.classList.add('hidden'));
    }

    function hideComparisonResult() {
        const selectedMethod = document.querySelector('input[name="method"]:checked').value;
        updateResultBoxesVisibility(selectedMethod);
        elements.compareBackButton.classList.add('hidden');
        const sideBySideBackButton = document.getElementById('compare-back-button-side-by-side');
        if (sideBySideBackButton) {
            sideBySideBackButton.classList.add('hidden');
        }
        elements.mainContainer.style.maxWidth = FULL_WIDTH;
        elements.resultsContainer.style.display = 'flex';
        elements.resultsContainer.style.flexDirection = 'row';
        elements.resultsContainer.style.justifyContent = 'space-between';
        elements.resultsContainer.style.width = '100%';
        elements.comparisonResultBox.classList.add('hidden');

        // Restore original transcriptions
        if (elements.youtubeResult && elements.youtubeResult.dataset.originalText) {
            elements.youtubeResult.innerText = elements.youtubeResult.dataset.originalText;
        }
        if (elements.whisperResult && elements.whisperResult.dataset.originalText) {
            elements.whisperResult.innerText = elements.whisperResult.dataset.originalText;
        }

        // Ensure both transcripts are visible if they have content
        if (elements.youtubeResult && elements.youtubeResult.innerText.trim()) {
            elements.youtubeResultBox.classList.remove('hidden');
            elements.youtubeResultBox.style.width = '50%';
        }
        if (elements.whisperResult && elements.whisperResult.innerText.trim()) {
            elements.whisperResultBox.classList.remove('hidden');
            elements.whisperResultBox.style.width = '50%';
        }

        updateComparisonButtons();

        // Show refresh buttons again
        const refreshButtons = document.querySelectorAll('.refresh-button');
        refreshButtons.forEach(button => button.classList.remove('hidden'));
    }

    function bindEvents(transcriptionManager, comparisonManager) {
        if (elements.transcriptionForm) {
            elements.transcriptionForm.addEventListener('submit', function (event) {
                event.preventDefault();
                if (transcriptionManager && typeof transcriptionManager.handleFormSubmit === 'function') {
                    transcriptionManager.handleFormSubmit(event);
                } else {
                    console.error("Transcription manager or handleFormSubmit function is not available");
                }
            });
        }

        document.querySelectorAll('input[name="method"]').forEach(radio => {
            radio.addEventListener('change', updateUI);
        });

        if (elements.inlineCompareButton && comparisonManager) {
            elements.inlineCompareButton.addEventListener('click', () => {
                comparisonManager.compareTranscripts('inline');
            });
        }

        if (elements.sideBySideCompareButton && comparisonManager) {
            elements.sideBySideCompareButton.addEventListener('click', () => {
                comparisonManager.compareTranscripts('side_by_side');
            });
        }

        if (elements.compareBackButton && comparisonManager) {
            elements.compareBackButton.addEventListener('click', () => {
                comparisonManager.handleCompareBack();
            });
        }

        const sideBySideBackButton = document.getElementById('compare-back-button-side-by-side');
        if (sideBySideBackButton && comparisonManager) {
            sideBySideBackButton.addEventListener('click', () => {
                comparisonManager.handleCompareBack();
            });
        }
    }

    // Initialize
    hideResultsSection();
    console.log('Initializing UI');
    updateUI();

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
