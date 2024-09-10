import { elements } from './elements.js';
import { initUIManager } from './uiManager.js';
import { initTranscriptionManager } from './transcriptionManager.js';
import { initComparisonManager } from './comparisonManager.js';
import { initSocketManager } from './socketManager.js';

const YouTubeTranscriber = (function() {
    function init() {
        const uiManager = initUIManager(elements);
        const transcriptionManager = initTranscriptionManager(elements, uiManager);
        const comparisonManager = initComparisonManager(elements, uiManager);
        const socketManager = initSocketManager(elements, uiManager);

        uiManager.bindEvents(transcriptionManager, comparisonManager);

        // Hide results section on initial load
        uiManager.hideResultsSection();
    }

    return {
        init: init
    };
})();

document.addEventListener('DOMContentLoaded', YouTubeTranscriber.init);