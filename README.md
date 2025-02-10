# Classical Musician Website

A modern, responsive website for classical musicians featuring concert listings, social media integration, and a YouTube feed.

## Features
- Responsive design that works on all devices
- Concert updates section
- Contact form for audience engagement
- About section with artist biography
- Gallery section for photos and videos

## Technology Stack
- HTML5
- CSS3 (with modern flexbox and grid layouts)
- JavaScript (vanilla)
- Font Awesome for icons

## Setup Instructions

### 1. Configuration Files

Copy `js/config.template.js` to `js/config.js` and update the following settings:

```javascript
const CONFIG = {
    // Google Sheets Configuration
    SHEET_ID: 'YOUR_SHEET_ID',           // ID from your Google Sheet URL
    API_KEY: 'YOUR_GOOGLE_SHEETS_API_KEY', // Google Sheets API Key
    SHEET_RANGE: 'Concerts!A2:F',        // Sheet range including headers

    // YouTube Configuration
    YOUTUBE: {
        CHANNEL_ID: 'YOUR_CHANNEL_ID',    // Your YouTube channel ID
        MAX_RESULTS: 4,                   // Number of videos to display
        API_KEY: 'YOUR_YOUTUBE_API_KEY'   // YouTube Data API key
    }
};
```

### 2. Google Sheets Setup

1. Create a new Google Sheet with the following columns:
   - Date
   - Title
   - Description
   - Venue
   - TicketLink
   - Image

2. Enable Google Sheets API:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Create API credentials (API Key)
   - Copy the API key to `config.js`

3. Share your Google Sheet:
   - Set sharing permissions to "Anyone with the link can view"
   - Copy the Sheet ID from the URL (the long string between /d/ and /edit)

### 3. YouTube Setup

1. Enable YouTube Data API:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable YouTube Data API v3
   - Create API credentials (API Key)
   - Copy the API key to `config.js`

2. Get Your Channel ID:
   - Go to your YouTube channel
   - Copy the channel ID from the URL
   - If using a custom URL, find your channel ID in YouTube Studio settings

### 4. Images

1. Add your images:
   - Place hero image at `images/hero-bg.jpg`
   - Add concert images to `images/concerts/`
   - Recommended image sizes:
     - Hero: 1920x1080px
     - Concert thumbnails: 800x600px

### 5. Social Media Integration

1. Update social media links in `index.html`:
   ```html
   <div class="social-links">
       <a href="YOUR_INSTAGRAM_URL" class="social-icon">
           <i class="fab fa-instagram"></i>
       </a>
       <!-- Update other social media links -->
   </div>
   ```

2. Update Instagram feed:
   - Replace the Instagram embed code with your own from Instagram

### 6. Content Updates

1. Update website title and meta description in `index.html`
2. Modify header navigation links as needed
3. Update about section content
4. Customize footer information

## Development

### Local Development

1. Use a local server (e.g., Live Server for VS Code)
2. Don't commit `config.js` with real API keys
3. Keep `config.template.js` updated with any new configurations

### Deployment

1. Ensure all API keys are restricted to your domain
2. Update all absolute paths if not deploying to root
3. Enable CORS if hosting API keys on separate domain

## Security Notes

1. Always restrict API keys by:
   - HTTP referrers (your domain)
   - API usage (only needed services)
   - IP addresses if possible

2. Never commit sensitive data:
   - Add `config.js` to `.gitignore`
   - Keep API keys in environment variables for production

## Troubleshooting

Common issues and solutions:

1. Concerts not loading:
   - Check Google Sheets API key and permissions
   - Verify sheet ID and range
   - Check browser console for errors

2. YouTube feed not working:
   - Verify YouTube API key is enabled
   - Check channel ID format
   - Look for quota exceeded errors

3. Images not displaying:
   - Verify file paths and permissions
   - Check image formats and sizes
   - Ensure proper URL encoding

## Support

For additional help:
1. Check the [Google Sheets API documentation](https://developers.google.com/sheets/api)
2. Visit the [YouTube Data API documentation](https://developers.google.com/youtube/v3)
3. Review the [Google Cloud Console](https://console.cloud.google.com) for API quotas and errors
