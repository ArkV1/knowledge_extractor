import { getElements } from './elements.js';
import { initUIManager } from './uiManager.js';
import { initTranscriptionManager } from './transcriptionManager.js';
import { initComparisonManager } from './comparisonManager.js';
import { initSocketManager } from './socketManager.js';
import { initExtensionManager } from './extensionManager.js';

const YouTubeTranscriber = (function () {
    function init() {
        document.addEventListener('DOMContentLoaded', function () {
            try {
                const elements = getElements();
                if (!elements) {
                    throw new Error("Failed to get elements");
                }

                const managers = [
                    { name: 'uiManager', init: initUIManager, args: [elements] },
                    { name: 'transcriptionManager', init: initTranscriptionManager, args: [elements] },
                    { name: 'comparisonManager', init: initComparisonManager, args: [elements] },
                    { name: 'socketManager', init: initSocketManager, args: [elements] },
                    { name: 'extensionManager', init: initExtensionManager, args: [] }
                ];

                const initializedManagers = {};

                for (const manager of managers) {
                    try {
                        const args = [...manager.args, initializedManagers];
                        initializedManagers[manager.name] = manager.init(...args);
                        console.log(`${manager.name} initialized successfully`);
                    } catch (error) {
                        console.error(`Failed to initialize ${manager.name}:`, error);
                    }
                }

                if (initializedManagers.uiManager) {
                    initializedManagers.uiManager.bindEvents(
                        initializedManagers.transcriptionManager,
                        initializedManagers.comparisonManager
                    );
                    initializedManagers.uiManager.hideResultsSection();
                    initializedManagers.uiManager.updateUI();
                } else {
                    console.error("UI Manager failed to initialize. Some features may not work.");
                }
            } catch (error) {
                console.error("Critical error during initialization:", error);
                // Display a user-friendly error message on the page
                const errorDiv = document.createElement('div');
                errorDiv.textContent = "An error occurred while loading the application. Please try refreshing the page.";
                errorDiv.style.color = 'red';
                document.body.prepend(errorDiv);
            }
        });
    }

    return {
        init: init
    };
})();

YouTubeTranscriber.init();