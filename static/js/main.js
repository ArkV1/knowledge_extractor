import { getElements } from './elements.js';
import { initUIManager } from './uiManager.js';
import { initTranscriptionManager } from './transcriptionManager.js';
import { initComparisonManager } from './comparisonManager.js';
import { initSocketManager } from './socketManager.js';

const YouTubeTranscriber = (function() {
    function init() {
        // Call getElements after DOM is fully loaded
        const elements = getElements();

        const uiManager = initUIManager(elements);
        const transcriptionManager = initTranscriptionManager(elements, uiManager);
        const comparisonManager = initComparisonManager(elements, uiManager);
        const socketManager = initSocketManager(elements, uiManager);

        uiManager.bindEvents(transcriptionManager, comparisonManager);

        // Initialize with results section hidden
        uiManager.hideResultsSection();
    }

    return {
        init: init
    };
})();

document.addEventListener('DOMContentLoaded', YouTubeTranscriber.init);
