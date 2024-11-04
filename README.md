# JP-Mem-Card: Japanese Vocabulary Flashcard App

## Description
JP-Mem-Card is a web-based application designed to help users learn and manage Japanese vocabulary through a flashcard-style interface. Users can add new vocabulary, customize themes, and store data locally.

## Current Stage of Development
- **Configurable Themes**: Users can select between pre-defined themes, which are saved to a configuration file (`config.json`) and persist across sessions.
- **Vocabulary Addition**: Allows users to input a word, communicate with OpenAI's API, and generate a JSON-formatted vocabulary entry.
- **Data Persistence**: Vocabulary entries are saved in a date-specific JSON file under the `vocab/` folder.

## Setup Instructions

### Prerequisites
1. **Node.js** and **npm** (Node Package Manager) must be installed on the system. These can be installed from [Node.js's official website](https://nodejs.org/).
2. An OpenAI API Key is required to connect with ChatGPT for generating vocabulary explanations.

### Step-by-Step Installation

1. **Clone the Repository**
   ```bash
   git clone <repository_url>
   cd JP-Mem-Card
   ```

2. **Initialize Node.js Project**
   - Run `npm init -y` to generate a `package.json` file if it is not already present. This step will set up a base Node.js project.

3. **Install Dependencies**
   - Run the following command to install the necessary dependencies from `package.json`.
   ```bash
   npm install express body-parser
   ```

4. **Setup Configuration Files**
   - All configurations here can be adjusted in the web app if users do not want to directly change the JSON file. However, users need to change the file name manually from `config/example_config.json` to `config/config.json`.
   - Add the OpenAI API key and theme preference to the `config/config.json` file. Here’s a sample structure:
     ```json
     {
       "settings": {
         "apiKey": "your_openai_api_key",
         "themeName": "default"
       }
     }
     ```
   - Add the themes to be used in `config/themes.json`.

### Running the Application

To start the local server, use:
```bash
node javascript/server.js
```

Access the application by navigating to `http://localhost:5001` in a web browser.

### Development and Testing Notes
- **Vocabulary Fetching**: When users add a new word on the `add.html` page, it connects to the OpenAI API and fetches a structured JSON response. The response is validated and displayed on the page for user review.
- **Confirmation of Vocabulary**: When the "Confirm" button is clicked, the vocabulary entry is saved into a JSON file in the `vocab` directory. Each day’s entries are stored in a single file named `MM-DD-YY.json`.
