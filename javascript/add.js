let vocabularyList = []; // Stores confirmed vocabulary entries
let retryCount = 0; // Retry count for regeneration attempts

// Example template for the expected JSON response format
const exampleJson = {
    "word": "手入れ",
    "type": "Noun, Suru-verb",
    "pronunciation": "ていれ",
    "explanation": "手入れ refers to the act of maintaining or taking care of something, such as equipment, plants, or one's appearance. It involves regular upkeep to keep things in good condition.",
    "examples": [
        {
            "sentence": "毎日、庭の手入れをしています。",
            "translation": "I take care of the garden every day."
        },
        {
            "sentence": "彼女は肌の手入れに時間をかけている。",
            "translation": "She spends time taking care of her skin."
        },
        {
            "sentence": "この機械は定期的に手入れが必要だ。",
            "translation": "This machine needs regular maintenance."
        }
    ]
};

// Load the API key from config.json
async function getApiKey() {
    const response = await fetch('/config/config.json');
    const data = await response.json();
    return data.settings.apiKey;
}

// Function to fetch vocabulary JSON from ChatGPT
async function fetchVocabularyJson(word) {
    const apiKey = await getApiKey();
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo", // or "gpt-4-turbo"
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that provides information on Japanese vocabulary in JSON format. Please respond strictly in JSON format without any Markdown or extraneous text."
                },
                {
                    role: "user",
                    content: `Provide information for the word "${word}" in JSON format as per the following template: ${JSON.stringify(exampleJson)}`
                }
            ],
            max_tokens: 500,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    let responseContent = data.choices[0].message.content;

    // Remove any Markdown formatting or extraneous text from the response
    responseContent = responseContent.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(responseContent); // Parse the cleaned JSON response
    } catch (error) {
        console.error("Error parsing JSON response:", error);
        throw new Error("The response from ChatGPT was not in valid JSON format.");
    }
}


// Function to display the fetched JSON in a formatted explanation
function displayExplanation(entry) {
    const explanationBox = document.getElementById('explanationBox');
    const explanationText = `
        <span style="font-size: 1.5em; font-weight: bold;">${entry.word}</span> (${entry.pronunciation})<br>
        <span style="font-size: 1.2em; font-weight: bold;">Type:</span> ${entry.type}<br><br>
        <span style="font-size: 1.2em; font-weight: bold;">Explanation:</span><br> ${entry.explanation}<br><br>
        <span style="font-size: 1.2em; font-weight: bold;">Examples:</span><br>
        ${entry.examples.map(ex => `${ex.sentence}<br> ${ex.translation}`).join('<br>------<br>')}
    `;
    explanationBox.innerHTML = explanationText;
}

// Function to validate if the JSON response has the required structure
function isValidJsonFormat(jsonResponse) {
    // Check if jsonResponse has the expected properties
    return jsonResponse && 
           typeof jsonResponse.word === "string" &&
           typeof jsonResponse.pronunciation === "string" &&
           typeof jsonResponse.type === "string" &&
           typeof jsonResponse.explanation === "string" &&
           Array.isArray(jsonResponse.examples) &&
           jsonResponse.examples.every(example => 
               typeof example.sentence === "string" && 
               typeof example.translation === "string"
           );
}


// Function to add new vocabulary entry
async function addVocabulary() {
    const vocabInput = document.getElementById('vocabInput');
    const word = vocabInput.value.trim();

    if (!word) {
        displayTemporaryMessage("Please enter a vocabulary word.", "error");
        return;
    }

    try {
        const jsonResponse = await fetchVocabularyJson(word);

        // Verify and display JSON response
        if (isValidJsonFormat(jsonResponse)) {
            displayExplanation(jsonResponse);
            vocabularyList = [jsonResponse]; // Store the single fetched entry
            retryCount = 0; // Reset retry count on successful fetch
        } else {
            retryCount++;
            if (retryCount < 3) {
                displayTemporaryMessage(`Invalid format. Retrying... (${retryCount}/3)`, "error");
                await addVocabulary(); // Retry fetch
            } else {
                displayTemporaryMessage("Failed to fetch valid format after 3 attempts.", "error");
                retryCount = 0;
            }
        }
    } catch (error) {
        console.error("Error fetching data from ChatGPT:", error);
    }
}

// Function to confirm and save the vocabulary entry
function confirmVocabulary() {
    const vocabularyData = vocabularyList[0] || null; // Get the latest entry

    if (!vocabularyData) {
        displayTemporaryMessage("No vocabulary data to save.", "error");
        return;
    }

    const date = new Date();
    const fileName = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${date.getFullYear()}_${Date.now()}.json`;

    const dataToSave = {
        vocabulary: [vocabularyData] // Save the single entry in an array as required
    };

    fetch('/save-vocabulary', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
    })
    .then(response => {
        if (response.ok) {
            displayTemporaryMessage("Vocabulary saved successfully!", "success");
            vocabularyList = []; // Clear the list after saving
        } else {
            displayTemporaryMessage("Failed to save vocabulary.", "error");
        }
    })
    .catch(error => {
        console.error("Error saving vocabulary:", error);
        displayTemporaryMessage("Error saving vocabulary.", "error");
    });
}

// Function to display a temporary message on the screen
function displayTemporaryMessage(message, type) {
    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`; // Add CSS classes for styling

    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.remove();
    }, 500); // Display the message for 0.5 seconds
}

// Function to redirect to the home page
function goToHome() {
    window.location.href = 'index.html';
}
