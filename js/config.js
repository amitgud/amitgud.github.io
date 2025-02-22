// Google Sheets Configuration
const CONFIG = {
    // Replace with environment variables
    SHEET_ID: process.env.GOOGLE_SHEET_ID,
    API_KEY: process.env.GOOGLE_API_KEY,
    SHEET_RANGE: 'Concerts!A2:H', // Assuming headers are in row 1
    // How often to refresh concert data (in milliseconds)
    REFRESH_INTERVAL: 1800000, // 30 minutes

    // YouTube Configuration
    YOUTUBE: {
        CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID, // Your YouTube channel ID
        MAX_RESULTS: 4, // Number of videos to display (reduced from 6)
        API_KEY: process.env.GOOGLE_API_KEY // Your YouTube Data API key
    }
};
