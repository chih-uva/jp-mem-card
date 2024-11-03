// Path to JSON vocabulary file
const vocabFile = '../vocab/example.json';
let vocabData = [];
let currentIndex = 0;

// Fetch vocabulary data from the JSON file
fetch(vocabFile)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        console.log('Fetched vocabulary data:', data); // Debug log to check fetched data
        vocabData = data;
        displayVocab(); // Display the first word after fetching the data
    })
    .catch(error => {
        console.error('Error loading vocabulary:', error);
        document.getElementById('vocabButton').textContent = "No vocabulary available"; // Show error message if fetch fails
    });

// Display the current vocabulary word on the main button
function displayVocab() {
    const vocabButton = document.getElementById('vocabButton');
    const explanationBox = document.getElementById('explanationBox');
    
    // Check if there are vocabulary items available
    if (vocabData.length > 0 && vocabData[currentIndex]) {
        const currentWord = vocabData[currentIndex].word;
        console.log('Displaying word:', currentWord); // Debug log to confirm the word
        vocabButton.textContent = currentWord; // Set button text to the first vocabulary word
    } else {
        console.log('No vocabulary available');
        vocabButton.textContent = "No vocabulary available";
    }

    // Reset the display for the explanation
    vocabButton.style.display = 'block';
    explanationBox.style.display = 'none';
}

function showExplanation() {
    const vocabButton = document.getElementById('vocabButton');
    const explanationBox = document.getElementById('explanationBox');

    // Check if vocabData is available to prevent errors
    if (vocabData.length > 0 && vocabData[currentIndex]) {
        // Hide the main button and show the explanation box
        vocabButton.style.display = 'none';
        explanationBox.style.display = 'block';

        // Set the text content for the explanation box directly
        const currentEntry = vocabData[currentIndex];
        const explanationText = `
            <span style="font-size: 1.5em; font-weight: bold;">${currentEntry.word}</span> (${currentEntry.pronunciation})<br>
            <span style="font-size: 1.2em; font-weight: bold;">Type:</span> ${currentEntry.type}<br><br>
            <span style="font-size: 1.2em; font-weight: bold;">Explanation:</span> ${currentEntry.explanation}<br><br>
            <span style="font-size: 1.2em; font-weight: bold;">Examples:</span><br>
            ${currentEntry.examples.map(ex => `- ${ex.sentence}<br> (${ex.translation})`).join('<br>')}
        `;

        // Set innerHTML instead of textContent for HTML formatting
        explanationBox.innerHTML = explanationText;
// Use textContent for plain text display
    } else {
        console.log('No explanation available');
        explanationBox.textContent = "No explanation available";
    }
}



// Add event listener to explanation box to toggle visibility on click
document.getElementById('explanationBox').addEventListener('click', () => {
    const vocabButton = document.getElementById('vocabButton');
    const explanationBox = document.getElementById('explanationBox');
    
    // Hide the explanation box and show the vocabulary button again
    explanationBox.style.display = 'none';
    vocabButton.style.display = 'block';
});

// Navigation functions
function nextVocab() {
    currentIndex = (currentIndex + 1) % vocabData.length;
    displayVocab();
}

function prevVocab() {
    currentIndex = (currentIndex - 1 + vocabData.length) % vocabData.length;
    displayVocab();
}

function home() {
    window.location.href = 'index.html';
}
