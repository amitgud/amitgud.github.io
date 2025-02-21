// Import the configuration template
const fs = require('fs');
const path = require('path');

// Read and evaluate the template file
const templatePath = path.join(__dirname, '../js/config.template.js');
const templateContent = fs.readFileSync(templatePath, 'utf8');
// Extract the object literal from the template
const configMatch = templateContent.match(/const CONFIG = ({[\s\S]*});/);
const CONFIG = configMatch ? eval('(' + configMatch[1] + ')') : {};

describe('Configuration Template Tests', () => {
    test('CONFIG template has required property structure', () => {
        expect(CONFIG).toBeDefined();
        expect(CONFIG).toHaveProperty('SHEET_ID');
        expect(CONFIG).toHaveProperty('API_KEY');
        expect(CONFIG).toHaveProperty('SHEET_RANGE');
        expect(CONFIG).toHaveProperty('REFRESH_INTERVAL');
    });

    test('SHEET_RANGE has correct format', () => {
        expect(CONFIG.SHEET_RANGE).toBe('Concerts!A2:F');
    });

    test('REFRESH_INTERVAL is correctly set to 30 minutes', () => {
        expect(typeof CONFIG.REFRESH_INTERVAL).toBe('number');
        expect(CONFIG.REFRESH_INTERVAL).toBe(1800000);
    });

    test('YouTube configuration has required property structure', () => {
        expect(CONFIG).toHaveProperty('YOUTUBE');
        expect(CONFIG.YOUTUBE).toHaveProperty('CHANNEL_ID');
        expect(CONFIG.YOUTUBE).toHaveProperty('MAX_RESULTS');
        expect(CONFIG.YOUTUBE).toHaveProperty('API_KEY');
    });

    test('YouTube MAX_RESULTS is set to 4', () => {
        expect(typeof CONFIG.YOUTUBE.MAX_RESULTS).toBe('number');
        expect(CONFIG.YOUTUBE.MAX_RESULTS).toBe(4);
    });

    test('Template placeholders are present', () => {
        expect(CONFIG.SHEET_ID).toBe('YOUR_SHEET_ID');
        expect(CONFIG.API_KEY).toBe('YOUR_GOOGLE_SHEETS_API_KEY');
        expect(CONFIG.YOUTUBE.CHANNEL_ID).toBe('YOUR_CHANNEL_ID');
        expect(CONFIG.YOUTUBE.API_KEY).toBe('YOUR_YOUTUBE_API_KEY');
    });
});