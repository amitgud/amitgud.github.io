// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                navLinks.classList.remove('active');
            }
        });
    });

    // Concert management
    const concertList = document.getElementById('concert-list');
    let lastFetchTime = 0;
    let fetchPromise = null;

    // Format date for display
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format time for display
    const formatTime = (timeStr) => {
        return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    // Create concert card element
    const createConcertCard = (concert) => {
        const card = document.createElement('div');
        card.className = 'concert-card';

        // Create poster element
        if (concert.posterUrl) {
            // console.log('Loading poster URL:', concert.posterUrl);
            const poster = document.createElement('img');
            poster.className = 'concert-poster';
            // Use Google Drive's direct download URL with the file ID
            poster.src = `https://www.googleapis.com/drive/v3/files/${concert.posterUrl}?alt=media&key=${CONFIG.API_KEY}`;
            console.log(poster.src);
            poster.alt = `${concert.title} Concert Poster`;
            poster.onerror = () => {
                console.error('Failed to load image:', concert.posterUrl);
                // Replace with placeholder on error
                const placeholder = document.createElement('div');
                placeholder.className = 'concert-poster placeholder';
                placeholder.innerHTML = '<i class="fas fa-music"></i>';
                card.replaceChild(placeholder, poster);
            };
            card.appendChild(poster);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'concert-poster placeholder';
            placeholder.innerHTML = '<i class="fas fa-music"></i>';
            card.appendChild(placeholder);
        }

        const details = document.createElement('div');
        details.className = 'concert-details';
        details.innerHTML = `
            <div class="concert-date">${formatDate(concert.date)} ${concert.time}</div>
            <h3 class="concert-title">${concert.title}</h3>
            <div class="concert-description">${concert.description}</div>
            <div class="concert-venue">${concert.venue}</div>
            <div class="concert-location">${concert.city}</div>
            <div class="concert-time">${concert.time}</div>
            ${concert.ticketLink ? `<a href="${concert.ticketLink}" class="ticket-link" target="_blank">Get Tickets</a>` : ''}
        `;
        card.appendChild(details);

        return card;
    };

    // Fetch concerts from Google Sheets
    const fetchConcerts = async () => {
        const now = Date.now();
        
        // Return existing promise if we're already fetching
        if (fetchPromise && now - lastFetchTime < 5000) {
            return fetchPromise;
        }

        // Show loading state
        concertList.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading upcoming concerts...</p>
            </div>
        `;

        fetchPromise = fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/1cjXskehYNuX7zhEij-6MuMLZZji8k9-VUTR1a_5UJTE/values/${CONFIG.SHEET_RANGE}?key=${CONFIG.API_KEY}`
        )
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch concert data');
                }
                return response.json();
            })
            .then(data => {
                lastFetchTime = now;
                // console.log('Raw data from sheets:', data);
                if (!data.values || !Array.isArray(data.values)) {
                    console.error('Invalid data format. Expected array of values:', data);
                    throw new Error('Invalid data format');
                }
                return data.values.map((row, index) => {
                    return {
                        date: row[0],
                        time: row[1],
                        title: row[2],
                        description: row[3],
                        venue: row[4],
                        city: row[5],
                        ticketLink: row[6],
                        posterUrl: row[7]
                    };
                });
            })
            .catch(error => {
                console.error('Error fetching concert data:', error);
                concertList.innerHTML = `
                    <div class="error-message">
                        <p>Unable to load concert data. Please try again later.</p>
                    </div>
                `;
                throw error;
            });

        return fetchPromise;
    };

    // Update concert list
    const updateConcerts = async () => {
        try {
            const concerts = await fetchConcerts();
            
            // Sort concerts by date
            const now = new Date();
            const upcomingConcerts = [];
            const pastConcerts = [];
            
            concerts.forEach(concert => {
                const concertDate = new Date(`${concert.date} ${concert.time}`);
                if (concertDate >= now) {
                    upcomingConcerts.push(concert);
                } else {
                    pastConcerts.push(concert);
                }
            });

            // Sort upcoming concerts by date (nearest first)
            upcomingConcerts.sort((a, b) =>
                new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)
            );

            // Sort past concerts by date (most recent first)
            pastConcerts.sort((a, b) =>
                new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`)
            );

            // Clear existing content
            concertList.innerHTML = '';

            // Create sections container
            const sectionsContainer = document.createElement('div');
            sectionsContainer.className = 'concert-sections';

            // Add upcoming concerts section
            const upcomingSection = document.createElement('div');
            upcomingSection.className = 'concert-section upcoming-concerts';
            upcomingSection.innerHTML = '<h3>Upcoming Concerts</h3>';

            if (upcomingConcerts.length === 0) {
                upcomingSection.innerHTML += `
                    <div class="error-message">
                        <p>No upcoming concerts scheduled at this time.</p>
                    </div>
                `;
            } else {
                const upcomingGrid = document.createElement('div');
                upcomingGrid.className = 'concert-grid';
                upcomingConcerts.forEach(concert => {
                    upcomingGrid.appendChild(createConcertCard(concert));
                });
                upcomingSection.appendChild(upcomingGrid);
            }

            // Add past concerts section
            const pastSection = document.createElement('div');
            pastSection.className = 'concert-section past-concerts';
            pastSection.innerHTML = '<h3>Past Concerts</h3>';

            if (pastConcerts.length === 0) {
                pastSection.innerHTML += `
                    <div class="error-message">
                        <p>No past concerts to display.</p>
                    </div>
                `;
            } else {
                const pastGrid = document.createElement('div');
                pastGrid.className = 'concert-grid';
                pastConcerts.forEach(concert => {
                    pastGrid.appendChild(createConcertCard(concert));
                });
                pastSection.appendChild(pastGrid);
            }

            // Add sections to container
            sectionsContainer.appendChild(upcomingSection);
            sectionsContainer.appendChild(pastSection);
            concertList.appendChild(sectionsContainer);
        } catch (error) {
            console.error('Error updating concerts:', error);
        }
    };

    // Initial load
    updateConcerts();

    // Refresh periodically
    setInterval(updateConcerts, CONFIG.REFRESH_INTERVAL);

    // Initialize social media feeds
    const initializeSocialFeeds = () => {
        // Initialize YouTube feed
        initializeYouTubeFeed();

        // Refresh Instagram embed
        if (window.instgrm) {
            window.instgrm.Embeds.process();
        }

        // TikTok embed might need manual refresh
        if (document.querySelector('.tiktok-embed')) {
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            document.body.appendChild(script);
        }
    };

    const initializeYouTubeFeed = () => {
        // Load YouTube IFrame API
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // Initial fetch of videos
        fetchYouTubeVideos();
    };

    // YouTube functionality
    let player;
    let currentVideoId;
    const playlistElement = document.getElementById('youtube-playlist');

    // Format duration from ISO 8601 format
    const formatDuration = (duration) => {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '').replace('M', '');
        const seconds = (match[3] || '').replace('S', '');
        
        let formatted = '';
        if (hours) formatted += `${hours}:`;
        formatted += `${minutes.padStart(2, '0')}:`;
        formatted += seconds.padStart(2, '0');
        
        return formatted;
    };

    // Create video thumbnail element
    const createVideoThumbnail = (video) => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';
        
        const link = document.createElement('a');
        link.href = `https://www.youtube.com/watch?v=${video.id}`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        const thumbnail = document.createElement('img');
        thumbnail.className = 'video-thumbnail';
        thumbnail.src = video.thumbnail;
        thumbnail.alt = video.title;
        
        const info = document.createElement('div');
        info.className = 'video-info';
        info.innerHTML = `
            <div class="video-title">${video.title}</div>
            <div class="video-date">${new Date(video.publishedAt).toLocaleDateString()}</div>
        `;
        
        link.appendChild(thumbnail);
        link.appendChild(info);
        videoItem.appendChild(link);
        
        return videoItem;
    };

    // Fetch videos from YouTube API
    const fetchYouTubeVideos = async () => {
        const playlistElement = document.getElementById('youtube-playlist');
        
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?key=${CONFIG.YOUTUBE.API_KEY}&channelId=${CONFIG.YOUTUBE.CHANNEL_ID}&part=snippet,id&order=date&maxResults=${CONFIG.YOUTUBE.MAX_RESULTS}`
            );
            
            const data = await response.json();
            playlistElement.innerHTML = ''; // Clear loading spinner
            
            data.items.forEach(item => {
                if (item.id.videoId) {
                    const video = {
                        id: item.id.videoId,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.medium.url,
                        publishedAt: item.snippet.publishedAt
                    };
                    playlistElement.appendChild(createVideoThumbnail(video));
                }
            });
        } catch (error) {
            console.error('Error fetching YouTube videos:', error);
            playlistElement.innerHTML = `
                <div class="error-message">
                    <p>Unable to load YouTube videos. Please try again later.</p>
                </div>
            `;
        }
    };


    // Call initialization after page load
    window.addEventListener('load', initializeSocialFeeds);
});
