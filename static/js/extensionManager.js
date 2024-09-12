export function initExtensionManager() {
    const updateButton = document.getElementById('update-extensions');
    const versionDisplay = document.getElementById('extension-version');

    if (!updateButton) {
        console.error("Update button not found in the DOM");
        return; // Exit the function if the button is not found
    }

    if (!versionDisplay) {
        console.error("Version display element not found in the DOM");
        // Continue execution, as this is not critical
    }

    function updateVersionDisplay() {
        if (!versionDisplay) return; // Skip if element is not found

        fetch('/api/extension-version')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                versionDisplay.textContent = `Extension version: ${data.version}`;
            })
            .catch(error => {
                console.error('Error fetching extension version:', error);
                versionDisplay.textContent = 'Extension version: Error';
            });
    }

    updateButton.addEventListener('click', () => {
        updateButton.disabled = true;
        updateButton.textContent = 'Updating...';

        fetch('/update-extensions', { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (versionDisplay) {
                        versionDisplay.textContent = `Extension version: ${data.version}`;
                    }
                    alert('Extension updated successfully!');
                } else {
                    alert('Failed to update extension: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error updating extension:', error);
                alert('An error occurred while updating the extension.');
            })
            .finally(() => {
                updateButton.disabled = false;
                updateButton.textContent = 'Update Extensions';
            });
    });

    updateVersionDisplay();
}
