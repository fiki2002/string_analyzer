const crypto = require('crypto');


function analyzeString(value) {
        const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");

        return {
                length: value.length,
                is_palindrome: cleaned === cleaned.split("").reverse().join(""),
                unique_characters: new Set(value.toLowerCase().replace(/\s+/g, "")).size,
                word_count: value.trim().split(/\s+/).length,
                sha256_hash: _generateHash(value),
                character_frequency_map: _characterFrequency(value),
        };
}

function _characterFrequency(value) {
        const freq = {};
        for (const char of value.toLowerCase()) {
                if (char === " ") continue;
                freq[char] = (freq[char] || 0) + 1;
        }
        return freq;
}


function _generateHash(value) {
        return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = { analyzeString };