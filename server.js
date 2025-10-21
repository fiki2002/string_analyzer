const express = require('express')
const { analyzeString } = require('./stringAnalyzer')

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());


const stringsDatabase = {};

app.get('/', (req, res) => {

})

app.post('/strings', (req, res) => {
        const { value } = req.body;


        if (value === undefined || value === null) {
                return res.status(400).json({ error: 'Invalid request body or missing "value" field' });
        }

        if (typeof value !== "string") {
                return res.status(422).json({ error: 'Invalid data type for "value" (must be string)' });
        }


        const analyzedString = analyzeString(value)
        const id = analyzedString.sha256_hash;


        if (stringsDatabase[id]) {
                return res.status(409).json({ error: 'String already exists in the system' });
        }

        stringsDatabase[id] = {
                id: id,
                value: value,
                properties: analyzedString,
                created_at: new Date().toISOString(),
        }


        return res.status(201).json(stringsDatabase[id]);
})

app.get('/strings', (req, res) => {

        const queries = req.query

        const validParams = ['is_palindrome', 'min_length', 'max_length', 'word_count', 'contains_character'];

        const providedParams = Object.keys(queries);
        for (const param of providedParams) {
                if (!validParams.includes(param)) {
                        return res.status(400).json({ error: `Invalid query parameter: ${param}` });
                }
        }


        if (queries.is_palindrome && queries.is_palindrome !== 'true' && queries.is_palindrome !== 'false') {
                return res.status(400).json({ error: 'Invalid query parameter: is_palindrome must be true or false' });
        }

        if (queries.min_length && isNaN(parseInt(queries.min_length))) {
                return res.status(400).json({ error: 'Invalid query parameter: min_length must be a number' });
        }

        if (queries.max_length && isNaN(parseInt(queries.max_length))) {
                return res.status(400).json({ error: 'Invalid query parameter: max_length must be a number' });
        }

        if (queries.word_count && isNaN(parseInt(queries.word_count))) {
                return res.status(400).json({ error: 'Invalid query parameter: word_count must be a number' });
        }

        if (queries.contains_character && queries.contains_character.length !== 1) {
                return res.status(400).json({ error: 'Invalid query parameter: contains_character must be a single character' });
        }

        const availableProperties = Object.values(stringsDatabase)

        let filteredStrings = availableProperties;

        if (queries.is_palindrome === 'true') {
                filteredStrings = filteredStrings.filter(item => {
                        return item.properties.is_palindrome
                })
        }

        if (queries.is_palindrome === 'false') {
                filteredStrings = filteredStrings.filter(item => {
                        return !item.properties.is_palindrome
                })
        }


        if (queries.min_length) {
                filteredStrings = filteredStrings.filter(item => {
                        return item.properties.length >= parseInt(queries.min_length)
                })
        }

        if (queries.max_length) {
                filteredStrings = filteredStrings.filter(item => {
                        return item.properties.length <= parseInt(queries.max_length)
                })
        }

        if (queries.word_count) {
                filteredStrings = filteredStrings.filter(item => {
                        return item.properties.word_count === parseInt(queries.word_count)
                })
        }

        if (queries.contains_character) {
                filteredStrings = filteredStrings.filter(item => {
                        return item.value.toLowerCase().includes(queries.contains_character.toLowerCase())
                })
        }

        return res.status(200).json({
                data: filteredStrings,
                count: filteredStrings.length,
                filters_applied: queries
        })
});


app.get('/strings/filter-by-natural-language', (req, res) => {
        const query = req.query.query;

        if (!query) {
                return res.status(400).json({ error: 'Query parameter "query" is required' });
        }

        const lowerQuery = query.toLowerCase();

        const parsedFilters = {};

        if (lowerQuery.includes('palindrome') || lowerQuery.includes('palindromic')) {
                parsedFilters.is_palindrome = true;
        }

        if (lowerQuery.includes('single word') || lowerQuery.includes('one word')) {
                parsedFilters.word_count = 1;
        } else if (lowerQuery.includes('two word')) {
                parsedFilters.word_count = 2;
        } else if (lowerQuery.includes('three word')) {
                parsedFilters.word_count = 3;
        }

        const longerThanMatch = lowerQuery.match(/longer than (\d+)/);
        if (longerThanMatch) {
                parsedFilters.min_length = parseInt(longerThanMatch[1]) + 1;
        }

        const shorterThanMatch = lowerQuery.match(/shorter than (\d+)/);
        if (shorterThanMatch) {
                parsedFilters.max_length = parseInt(shorterThanMatch[1]) - 1;
        }

        const containsLetterMatch = lowerQuery.match(/contain(?:ing|s)? (?:the )?letter ([a-z])/);
        if (containsLetterMatch) {
                parsedFilters.contains_character = containsLetterMatch[1];
        }

        if (lowerQuery.includes('first vowel')) {
                parsedFilters.contains_character = 'a';
        }

        if (Object.keys(parsedFilters).length === 0) {
                return res.status(400).json({ error: 'Unable to parse natural language query' });
        }


        if (parsedFilters.min_length && parsedFilters.max_length &&
                parsedFilters.min_length > parsedFilters.max_length) {
                return res.status(422).json({
                        error: 'Query parsed but resulted in conflicting filters: min_length cannot be greater than max_length'
                });
        }

        let filteredStrings = Object.values(stringsDatabase);

        if (parsedFilters.is_palindrome !== undefined) {
                filteredStrings = filteredStrings.filter(item => {
                        return item.properties.is_palindrome === parsedFilters.is_palindrome;
                });
        }

        if (parsedFilters.min_length) {
                filteredStrings = filteredStrings.filter(item => {
                        return item.properties.length >= parsedFilters.min_length;
                });
        }

        if (parsedFilters.max_length) {
                filteredStrings = filteredStrings.filter(item => {
                        return item.properties.length <= parsedFilters.max_length;
                });
        }

        if (parsedFilters.word_count) {
                filteredStrings = filteredStrings.filter(item => {
                        return item.properties.word_count === parsedFilters.word_count;
                });
        }

        if (parsedFilters.contains_character) {
                filteredStrings = filteredStrings.filter(item => {
                        return item.value.toLowerCase().includes(parsedFilters.contains_character.toLowerCase());
                });
        }

        return res.status(200).json({
                data: filteredStrings,
                count: filteredStrings.length,
                interpreted_query: {
                        original: query,
                        parsed_filters: parsedFilters
                }
        });
});

app.get('/strings/:stringValue', (req, res) => {
        const stringValue = req.params.stringValue;
        const analyzedString = analyzeString(stringValue);
        const hash = analyzedString.sha256_hash;

        const foundString = stringsDatabase[hash];

        if (!foundString) {
                return res.status(404).json({ error: 'String does not exist in the system' });
        }


        return res.status(200).json(foundString);
});


app.delete('/strings/:stringValue', (req, res) => {
        const stringValue = req.params.stringValue;

        const analyzedString = analyzeString(stringValue);
        const hash = analyzedString.sha256_hash;

        if (!stringsDatabase[hash]) {
                return res.status(404).json({ error: 'String does not exist in the system' });
        }

        delete stringsDatabase[hash];

        return res.status(204).send();
});


const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
});

function shutdown() {
        console.log('Shutting down server gracefully...');
        server.close(() => {
                console.log('Server closed');
                process.exit(0);
        });

        setTimeout(() => {
                console.error('Forcing shutdown...');
                process.exit(1);
        }, 5000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);