// Google Sheets Configuration
const CONFIG = {
    // Replace these with your actual values
    SHEET_ID: 'YOUR_SHEET_ID',
    API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY',
    SHEET_RANGE: 'Concerts!A2:F', // Assuming headers are in row 1
    // How often to refresh concert data (in milliseconds)
    REFRESH_INTERVAL: 1800000, // 30 minutes

    // YouTube Configuration
    YOUTUBE: {
        CHANNEL_ID: 'YOUR_CHANNEL_ID', // Your YouTube channel ID
        MAX_RESULTS: 6, // Number of videos to display
        API_KEY: 'YOUR_YOUTUBE_API_KEY' // Your YouTube Data API key
    }
};
