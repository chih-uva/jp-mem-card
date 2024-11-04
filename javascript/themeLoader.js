// Function to load and apply the theme from config.json
document.addEventListener("DOMContentLoaded", function() {
    fetch('/config/config.json')
        .then(response => response.json())
        .then(data => {
            const themeName = data.settings?.themeName || "default"; // Use "default" if no theme is saved
            applyTheme(themeName);
        })
        .catch(error => console.error("Error loading theme from config.json:", error));
});

// Function to apply a theme by updating CSS variables
function applyTheme(themeName) {
    fetch('/config/themes.json')
        .then(response => response.json())
        .then(data => {
            const theme = data.themes[themeName];
            if (theme) {
                // Update CSS variables to apply the theme
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
