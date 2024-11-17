// Get the date parameter from the URL
const urlParams = new URLSearchParams(window.location.search);
var dateParam = urlParams.get('date');
console.log("URL date parameter:", dateParam);


// Set the vocabulary file path based on the date
const vocabFile = dateParam !== 'example' ? `../vocab/${dateParam}.json` : '../vocab/example.json';
console.log("File to Fetch:", vocabFile);

let vocabData = [];
let currentIndex = 0;

// Fetch the most recent vocabulary JSON file from the server
if (dateParam){
    fetch(`/vocab/${dateParam}`)
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        console.log('Fetched vocabulary data:', data); // Debug log to check fetched data

        // Display the filename in the top left corner with the prefix "Now on:"
        document.getElementById('listName').textContent = `Now on: ${data.filename}`;

        // Set the vocabulary data and display the first entry
        vocabData = data.content;
        displayVocab();
    })
    .catch(error => {
        console.error('Error loading vocabulary:', error);
        document.getElementById('vocabButton').textContent = "No vocabulary available";
    });
}   
else{   
    fetch('/latest-vocab')
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        console.log('Fetched vocabulary data:', data); // Debug log to check fetched data

        // Display the filename in the top left corner with the prefix "Now on:"
        document.getElementById('listName').textContent = `Now on: ${data.filename}`;
        dateParam=data.filename.slice(0, -5)
        console.log(dateParam)
        // Set the vocabulary data and display the first entry
        vocabData = data.content;
        displayVocab();
    })
    .catch(error => {
        console.error('Error loading vocabulary:', error);
        document.getElementById('vocabButton').textContent = "No vocabulary available";
    });
}

// Display the list name (JSON file name) at the top
document.addEventListener("DOMContentLoaded", function() {
    const listNameElement = document.getElementById("listName");
    if (listNameElement) {
        const fileName = vocabFile.split('/').pop(); // Extracts the file name from the path
        listNameElement.textContent = `displaying: ${fileName}`;
    }
});

// Display the current vocabulary word and update progress
function displayVocab() {
    if (vocabData.length === 0) {
        document.getElementById('vocabButton').textContent = "No vocabulary available";
        document.getElementById('progressIndicator').textContent = "";
        return;
    }

    // Display the current word
    const currentEntry = vocabData[currentIndex];
    document.getElementById('vocabButton').textContent = currentEntry.word;

    // Update the progress indicator
    document.getElementById('progressIndicator').textContent = `${currentIndex + 1} / ${vocabData.length}`;

    // Update the explanation box content, even if it's not displayed
    updateExplanationBox();
}

// Function to update the explanation box with the current entry details
function updateExplanationBox() {
    const explanationBox = document.getElementById('explanationBox');

    if (vocabData.length > 0 && vocabData[currentIndex]) {
        const currentEntry = vocabData[currentIndex];
        const explanationText = `
        <span style="font-size: 1.5em; font-weight: bold;">${currentEntry.word}</span> (${currentEntry.pronunciation})<br>
        <span style="font-size: 1.2em; font-weight: bold;">Type:</span> ${currentEntry.type}<br><br>
        <span style="font-size: 1.2em; font-weight: bold;">Explanation:</span><br> ${currentEntry.explanation}<br><br>
        <span style="font-size: 1.2em; font-weight: bold;">Examples:</span><br>
        ${currentEntry.examples.map(ex => `${ex.sentence}<br> ${ex.translation}`).join('<br>------<br>')}
        `;

        // Set innerHTML to allow formatted display
        explanationBox.innerHTML = explanationText;
    } else {
        explanationBox.textContent = "No explanation available";
    }
}

// Show the explanation box and hide the main vocabulary button
function showExplanation() {
    const vocabButton = document.getElementById('vocabButton');
    const explanationBox = document.getElementById('explanationBox');

    // Hide the main button and show the explanation box
    vocabButton.style.display = 'none';
    explanationBox.style.display = 'block';
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

function deleteEntry() {
    const wordToDelete = vocabData[currentIndex].word;
    const old_Index = currentIndex;
    const url = dateParam ? `/vocab/${dateParam}/${wordToDelete}` : `/latest-vocab/${wordToDelete}`;
    fetch(url, {method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete the entry');
            return response.json();
        })
        .then(data => {
            currentIndex=old_Index;
            vocabData.splice(currentIndex, 1); // Update the local data
            displayVocab(); // Re-render the vocabulary list
        })
        .catch(error => {
            console.error('Error deleting entry:', error);
        });
    prevVocab();
}