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
            const poster = document.createElement('img');
            poster.className = 'concert-poster';
            poster.src = concert.posterUrl;
            poster.alt = `${concert.venue} Concert Poster`;
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
            <div class="concert-date">${formatDate(concert.date)}</div>
            <div class="concert-venue">${concert.venue}</div>
            <div class="concert-location">${concert.city}</div>
            <div class="concert-time">${formatTime(concert.time)}</div>
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
            `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/${CONFIG.SHEET_RANGE}?key=${CONFIG.API_KEY}`
        )
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch concert data');
                }
                return response.json();
            })
            .then(data => {
                lastFetchTime = now;
                return data.values.map(row => ({
                    date: row[0],
                    time: row[1],
                    venue: row[2],
                    city: row[3],
                    ticketLink: row[4],
                    posterUrl: row[5]
                }));
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

    // Call initialization after page load
    window.addEventListener('load', initializeSocialFeeds);
});
