# String Analyzer Service

A RESTful API service that analyzes strings and stores their computed properties including length, palindrome detection, character frequency, word count, and SHA-256 hash.

## Features

- ✨ Analyze strings and compute multiple properties
- 💾 Store and retrieve analyzed strings
- 🔍 Filter strings by various criteria (palindrome, length, word count, character)
- 🗣️ Natural language query support
- 🗑️ Delete strings from the system
- ⚡ Fast in-memory storage

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript
- **Hashing:** Node.js Crypto module

## API Endpoints

### 1. Create/Analyze String
```http
POST /strings
Content-Type: application/json

{
  "value": "string to analyze"
}
```

**Success Response (201 Created):**
```json
{
  "id": "sha256_hash_value",
  "value": "string to analyze",
  "properties": {
    "length": 17,
    "is_palindrome": false,
    "unique_characters": 12,
    "word_count": 3,
    "sha256_hash": "abc123...",
    "character_frequency_map": {
      "s": 2,
      "t": 3,
      "r": 2
    }
  },
  "created_at": "2025-08-27T10:00:00Z"
}
```

### 2. Get Specific String
```http
GET /strings/{string_value}
```

**Success Response (200 OK):** Same format as create response

### 3. Get All Strings with Filtering
```http
GET /strings?is_palindrome=true&min_length=5&max_length=20&word_count=2&contains_character=a
```

**Query Parameters:**
- `is_palindrome`: boolean (true/false)
- `min_length`: integer (minimum string length)
- `max_length`: integer (maximum string length)
- `word_count`: integer (exact word count)
- `contains_character`: string (single character to search for)

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "hash1",
      "value": "string1",
      "properties": { },
      "created_at": "2025-08-27T10:00:00Z"
    }
  ],
  "count": 15,
  "filters_applied": {
    "is_palindrome": true,
    "min_length": 5
  }
}
```

### 4. Natural Language Filtering
```http
GET /strings/filter-by-natural-language?query=all%20single%20word%20palindromic%20strings
```

**Example Queries:**
- "all single word palindromic strings"
- "strings longer than 10 characters"
- "palindromic strings that contain the first vowel"
- "strings containing the letter z"

**Success Response (200 OK):**
```json
{
  "data": [],
  "count": 3,
  "interpreted_query": {
    "original": "all single word palindromic strings",
    "parsed_filters": {
      "word_count": 1,
      "is_palindrome": true
    }
  }
}
```

### 5. Delete String
```http
DELETE /strings/{string_value}
```

**Success Response:** 204 No Content (empty response body)

## Error Responses

- `400 Bad Request`: Invalid request body or query parameters
- `404 Not Found`: String does not exist in the system
- `409 Conflict`: String already exists in the system
- `422 Unprocessable Entity`: Invalid data type or conflicting filters

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <project-folder>
```

2. Install dependencies:
```bash
npm install
```

## Dependencies

```json
{
  "express": "^4.18.2"
}
```

No additional dependencies required! The project uses Node.js built-in `crypto` module for SHA-256 hashing.

## Running Locally

1. Start the server:
```bash
node index.js
```

Or if you want to use nodemon for development:
```bash
npm install -g nodemon
nodemon index.js
```

2. The server will start on `http://localhost:3000`

3. Test the API using tools like:
   - Postman
   - cURL
   - Thunder Client (VS Code extension)
   - Any HTTP client

## Environment Variables

- `PORT` (optional): Port number for the server (default: 3000)

To set a custom port:
```bash
PORT=8080 node index.js
```

Or create a `.env` file:
```
PORT=8080
```

## Project Structure

```
.
├── index.js              # Main application file with routes
├── stringAnalyzer.js     # String analysis logic
├── package.json          # Project dependencies
└── README.md            # This file
```

## Example Usage

### Using cURL

**Create a string:**
```bash
curl -X POST http://localhost:3000/strings \
  -H "Content-Type: application/json" \
  -d '{"value": "racecar"}'
```

**Get a specific string:**
```bash
curl http://localhost:3000/strings/racecar
```

**Filter palindromes:**
```bash
curl "http://localhost:3000/strings?is_palindrome=true"
```

**Natural language query:**
```bash
curl "http://localhost:3000/strings/filter-by-natural-language?query=single%20word%20palindromic%20strings"
```

**Delete a string:**
```bash
curl -X DELETE http://localhost:3000/strings/racecar
```

## Deployment

This API can be deployed to:
- Railway
- Heroku
- AWS (EC2, Elastic Beanstalk, Lambda)
- DigitalOcean
- Any Node.js hosting platform

**Note:** Vercel and Render are not allowed for this project.

### Deployment Steps (Example: Railway)

1. Push your code to GitHub
2. Connect your GitHub repo to Railway
3. Railway will auto-detect Node.js and deploy
4. Set environment variables if needed
5. Your API will be live at `https://your-app.up.railway.app`

## Testing

Test all endpoints before deployment:

1. ✅ POST /strings - Create strings
2. ✅ GET /strings/:stringValue - Retrieve specific string
3. ✅ GET /strings - Filter strings
4. ✅ GET /strings/filter-by-natural-language - Natural language queries
5. ✅ DELETE /strings/:stringValue - Delete strings

Test error cases:
- Invalid data types
- Missing fields
- Non-existent strings
- Invalid query parameters
- Conflicting filters

## Known Limitations

- Data is stored in-memory (lost on server restart)
- Single character filtering only (contains_character)
- Basic natural language parsing (limited query patterns)

## Future Improvements

- Add persistent database (MongoDB, PostgreSQL)
- Add authentication/authorization
- Add rate limiting
- Expand natural language processing capabilities
- Add pagination for large result sets
- Add sorting options

## Author

Adepitan Oluwatosin

## License

This project is part of the HNG Backend Wizards Stage 1 Task.

## Submission

- **API URL:** [Your deployed URL]
- **Date:** October 2025