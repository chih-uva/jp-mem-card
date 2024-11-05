async function searchVocabulary() {
    const word = document.getElementById('vocabSearchInput').value.trim();
    const response = await fetch('/vocab-history');
    const vocabHistory = await response.json();

    const matchedEntries = vocabHistory.filter(vocab => vocab.word === word);
    const resultBox = document.getElementById('searchResult');
    
    if (matchedEntries.length > 0) {
        resultBox.innerHTML = `Found: "${word}" was added in the following files:<ul>`;
        matchedEntries.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.textContent = entry.dateAdded;
            resultBox.appendChild(listItem);
        });
        resultBox.innerHTML += '</ul>';
    } else {
        resultBox.textContent = `No record of "${word}" in history.`;
    }
}

// Function to return to the homepage
function goToHome() {
    window.location.href = 'index.html';
}
