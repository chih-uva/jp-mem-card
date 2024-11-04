// Load settings from localStorage when the page loads
document.addEventListener("DOMContentLoaded", function() {
    loadSettings();
});

// Function to load settings from localStorage
function loadSettings() {
    fetch('/config/config.json')
        .then(response => response.json())
        .then(data => {
            const settings = data.settings;
            if (settings) {
                // Set the API key and theme dropdown to saved values
                document.getElementById('apiKey').value = settings.apiKey;
                document.getElementById('themeSelect').value = settings.themeName;

                // Apply the saved theme
                applyTheme(settings.themeName);
            }
        })
        .catch(error => console.error("Error loading settings:", error));
}

// Function to apply a theme by updating CSS variables
function applyTheme(themeName) {
    fetch('../config/themes.json')
        .then(response => response.json())
        .then(data => {
            const theme = data.themes[themeName];
            if (theme) {
                document.documentElement.style.setProperty('--background-color', theme.backgroundColor);
                document.documentElement.style.setProperty('--text-color', theme.textColor);
                document.documentElement.style.setProperty('--button-background-color', theme.buttonBackgroundColor);
                document.documentElement.style.setProperty('--button-border-color', theme.buttonBorderColor);
                document.documentElement.style.setProperty('--button-text-color', theme.buttonTextColor);

                console.log(`Theme applied: ${themeName}`);
            } else {
                console.error("Theme not found in themes.json");
            }
        })
        .catch(error => console.error("Error loading theme:", error));
}

// Function to save settings to localStorage and go back to index page
function confirmSettings() {
    const apiKey = document.getElementById('apiKey').value;
    const themeName = document.getElementById('themeSelect').value;

    // New settings object
    const newSettings = {
        settings: {
            apiKey: apiKey,
            themeName: themeName
        }
    };

    // Send the data to the server to write to config.json
    fetch('/save-settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
    })
    .then(response => response.text())
    .then(message => {
        console.log(message);
        window.location.href = 'index.html'; // Redirect to index.html
    })
    .catch(error => console.error("Error saving settings:", error));
}



// Function to redirect to index.html when "Cancel" is clicked
function goToHome() {
    window.location.href = 'index.html';
}
