const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5001;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS) from the project root
app.use(express.static(path.join(__dirname, '..')));

// Endpoint to save settings to config/config.json
app.post('/save-settings', (req, res) => {
    const data = req.body;
    fs.writeFile(path.join(__dirname, '../config/config.json'), JSON.stringify(data, null, 4), (err) => {
        if (err) {
            console.error("Error writing to config.json:", err);
            res.status(500).send("Error saving settings");
        } else {
            res.status(500).send("Settings saved successfully!");
        }
    });
});


// Module for syncing with the vocab history database
const vocabDir = path.join(__dirname, '../vocab');
const vocabHistoryPath = path.join(__dirname, '../config/vocabHistory.json');

function syncVocabHistory() {
    const vocabHistory = [];

    fs.readdir(vocabDir, (err, files) => {
        if (err) {
            console.error("Error reading vocab directory:", err);
            return;
        }

        files.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(vocabDir, file);
                const dateAdded = file.slice(0, -5); // Remove ".json"
                
                const data = fs.readFileSync(filePath, 'utf8');
                const vocabList = JSON.parse(data);

                vocabList.forEach(entry => {
                    vocabHistory.push({
                        word: entry.word,
                        dateAdded: dateAdded
                    });
                });
            }
        });

        fs.writeFileSync(vocabHistoryPath, JSON.stringify(vocabHistory, null, 2));
        console.log("Vocabulary history synced successfully.");
    });
}


// New endpoint to save vocabulary data to a file in the "./vocab" directory
app.post('/save-vocabulary', (req, res) => {
    const newVocabularyData = req.body.vocabulary[0]; // Assuming each save has one word to add

    // Get the current date in the format "mm-dd-yy"
    const date = new Date();
    const fileName = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}-${String(date.getFullYear()).slice(-2)}.json`;
    const filePath = path.join(__dirname, '../vocab', fileName);

    // Read the existing file, if it exists, to append new data
    fs.readFile(filePath, 'utf8', (err, data) => {
        let updatedVocabulary = [];

        if (!err && data) {
            try {
                // Parse existing data to append to it
                updatedVocabulary = JSON.parse(data);
            } catch (parseError) {
                console.error("Error parsing existing file:", parseError);
            }
        }

        // Add the new vocabulary entry
        updatedVocabulary.push(newVocabularyData);

        // Save updated data back to the file
        fs.writeFile(filePath, JSON.stringify(updatedVocabulary, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing to file:", writeErr);
                res.status(500).send("Error saving vocabulary");
            } else {
                console.log(`Vocabulary entry appended successfully to ${fileName}`);
                syncVocabHistory();
                res.status(200).send("Vocabulary saved successfully");
            }
        });
    });
});


// Endpoint to get the JSON file of designated name in the ./vocab directory
app.get('/vocab/:date', (req, res) => {
    const { date } = req.params; // Get the date from the URL
    const vocabDir = path.join(__dirname, '../vocab');
    const fileName = `${date}.json`;
    const filePath = path.join(vocabDir, fileName);
    

    // Log the requested file path
    console.log(`Fetching vocabulary file: ${filePath}`);

    // Check if the requested file exists and read its content
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                console.error("File not found:", filePath);
                return res.status(404).send(`File ${fileName} not found`);
            } else {
                // Other errors
                console.error("Error reading file:", err);
                return res.status(500).send("Error reading file");
            }
        }
        try {
            const jsonData = JSON.parse(data); // Parse JSON data
            res.json({ filename: fileName, content: jsonData });
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            res.status(500).send("Error parsing JSON file");
        }
    });
});



// Endpoint to get the most recent JSON file in the ./vocab directory
app.get('/latest-vocab', (req, res) => {
    const vocabDir = path.join(__dirname, '../vocab');

    fs.readdir(vocabDir, (err, files) => {
        if (err) {
            console.error("Error reading vocab directory:", err);
            return res.status(500).send("Error reading vocab directory");
        }

        const jsonFiles = files
            .filter(file => file.endsWith('.json'))
            .map(file => {
                // Extract and parse date from filename assuming format is MM-DD-YY.json
                const [month, day, year] = file.split('-');
                const date = new Date(`20${year.split('.')[0]}`, month - 1, day); // Parsing as Date object
                console.log(file, date)
                return { file, date };
            })
            .sort((a, b) => b.date - a.date); // Sort by date in descending order

        if (jsonFiles.length === 0) {
            return res.status(404).send("No vocabulary files found.");
        }

        const latestFile = jsonFiles[0].file;
        const filePath = path.join(vocabDir, latestFile);

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error reading file:", err);
                return res.status(500).send("Error reading file");
            }
            res.json({ filename: latestFile, content: JSON.parse(data) });
        });
    });
});




app.get('/vocab-history', (req, res) => {
    const filePath = path.join(__dirname, '../config/vocabHistory.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading vocab history:", err);
            return res.status(500).send("Error reading vocab history");
        }
        res.json(JSON.parse(data));
    });
});



// Syncing the files before starting the server
syncVocabHistory();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.delete('/vocab/:date/:entryId', (req, res) => {
    const { date, entryId } = req.params;
    
    const filePath = path.join(__dirname, '../vocab', `${date}.json`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Vocabulary file not found' });
    }
    const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const index = fileData.findIndex(entry => entry.word === entryId);
    console.log(`index:${index}`);
    if (index === -1) {
        return res.status(404).json({ error: 'Entry not found' });
    }

    fileData.splice(index, 1);
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));

    res.status(200).json({ message: 'Entry deleted successfully' });
});