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
            console.log('Loading poster URL:', concert.posterUrl);
            const poster = document.createElement('img');
            poster.className = 'concert-poster';
            // Use Google Drive's direct download URL with the file ID
            poster.src = `https://www.googleapis.com/drive/v3/files/${concert.posterUrl}?alt=media&key=${CONFIG.API_KEY}`;
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
            
            // Clear existing content
            concertList.innerHTML = '';

            // Filter out past concerts
            const upcomingConcerts = concerts.filter(concert => 
                new Date(`${concert.date} ${concert.time}`) >= new Date()
            );

            // Sort by date
            upcomingConcerts.sort((a, b) => 
                new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`)
            );

            if (upcomingConcerts.length === 0) {
                concertList.innerHTML = `
                    <div class="error-message">
                        <p>No upcoming concerts scheduled at this time.</p>
                    </div>
                `;
                return;
            }

            // Add concert cards
            upcomingConcerts.forEach(concert => {
                concertList.appendChild(createConcertCard(concert));
            });
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
        const thumbnail = document.createElement('div');
        thumbnail.className = 'video-thumbnail';
        thumbnail.setAttribute('data-video-id', video.id);
        
        thumbnail.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="duration">${video.duration}</div>
            <div class="title">${video.title}</div>
        `;
        
        thumbnail.addEventListener('click', () => {
            playVideo(video.id);
            // Update active state
            document.querySelectorAll('.video-thumbnail').forEach(thumb => {
                thumb.classList.remove('active');
            });
            thumbnail.classList.add('active');
        });
        
        return thumbnail;
    };

    // Play video in the player
    const playVideo = (videoId) => {
        if (player && videoId !== currentVideoId) {
            player.loadVideoById(videoId);
            currentVideoId = videoId;
        }
    };

    // Initialize YouTube player
    function onYouTubeIframeAPIReady() {
        // Create player once we have video data
        fetchYouTubeVideos().then(videos => {
            if (videos.length > 0) {
                player = new YT.Player('youtube-player', {
                    height: '100%',
                    width: '100%',
                    videoId: videos[0].id,
                    playerVars: {
                        modestbranding: 1,
                        rel: 0
                    },
                    events: {
                        onReady: (event) => {
                            currentVideoId = videos[0].id;
                            // Mark first video as active
                            const firstThumbnail = document.querySelector('.video-thumbnail');
                            if (firstThumbnail) {
                                firstThumbnail.classList.add('active');
                            }
                        }
                    }
                });
            }
        });
    }

    // Fetch videos from YouTube API
    const fetchYouTubeVideos = async () => {
        try {
            // First, get playlist items
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?` +
                `part=snippet&channelId=${CONFIG.YOUTUBE.CHANNEL_ID}&maxResults=${CONFIG.YOUTUBE.MAX_RESULTS}` +
                `&order=date&type=video&key=${CONFIG.YOUTUBE.API_KEY}`
            );
            
            if (!response.ok) throw new Error('Failed to fetch YouTube videos');
            
            const data = await response.json();
            const videoIds = data.items.map(item => item.id.videoId).join(',');
            
            // Then, get video details including duration
            const detailsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?` +
                `part=contentDetails,snippet&id=${videoIds}&key=${CONFIG.YOUTUBE.API_KEY}`
            );
            
            if (!detailsResponse.ok) throw new Error('Failed to fetch video details');
            
            const detailsData = await detailsResponse.json();
            
            // Process videos
            const videos = detailsData.items.map(item => ({
                id: item.id,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.high.url,
                duration: formatDuration(item.contentDetails.duration)
            }));
            
            // Update playlist
            playlistElement.innerHTML = '';
            videos.forEach(video => {
                playlistElement.appendChild(createVideoThumbnail(video));
            });
            
            return videos;
        } catch (error) {
            console.error('Error fetching YouTube videos:', error);
            playlistElement.innerHTML = `
                <div class="error-message">
                    <p>Unable to load YouTube videos. Please try again later.</p>
                </div>
            `;
            return [];
        }
    };

    // Call initialization after page load
    window.addEventListener('load', initializeSocialFeeds);
});
