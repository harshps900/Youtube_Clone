// Constants
const API_KEY = 'AIzaSyBsa7P68CHDT2hY31PWsjM8y2hTt38D67c'; // Replace with your key
const DEFAULT_SEARCH_TERM = 'trending';
const VIDEO_CONTAINER = document.getElementById('videoContainer');
const LOADER = document.getElementById('loader');
const ERROR_MSG = document.getElementById('errorMessage');
const LOADING_OVERLAY = document.createElement('div');
LOADING_OVERLAY.className = 'loading-overlay';
document.body.appendChild(LOADING_OVERLAY);

// UI Interactions
document.querySelector('.menu-icon').addEventListener('click', function() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
    document.querySelector('.content').classList.toggle('expanded');
});

// Search Integration
document.querySelector('.search-button').addEventListener('click', searchVideos);
document.querySelector('.search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') searchVideos();
});

// Video Player Modal
const modal = document.getElementById('videoModal');
const videoPlayer = document.getElementById('videoPlayer');
const span = document.getElementsByClassName("close")[0];

span.onclick = function() {
    modal.style.display = "none";
    videoPlayer.src = '';
};

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        videoPlayer.src = '';
    }
};

// YouTube API Integration
async function loadInitialVideos() {
    try {
        showLoader();
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=12&key=${API_KEY}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error.message}`);
        }
        
        const data = await response.json();
        if (!data.items?.length) throw new Error('No videos found');
        
        displayVideos(data.items.map(item => ({
            id: { videoId: item.id },
            snippet: item.snippet
        })));
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoader();
    }
}

async function searchVideos() {
    const searchQuery = document.querySelector('.search-input').value.trim() || DEFAULT_SEARCH_TERM;
    
    try {
        showLoader();
        clearResults();
        
        const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(searchQuery)}&key=${API_KEY}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error.message}`);
        }
        
        const data = await response.json();
        if (!data.items?.length) throw new Error('No videos found');
        
        displayVideos(data.items);
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoader();
    }
}

function displayVideos(videos) {
    VIDEO_CONTAINER.innerHTML = videos.map(video => `
        <div class="video-card" data-video-id="${video.id.videoId}">
            <div class="thumbnail-container">
                <img src="${video.snippet.thumbnails.medium.url}" 
                     alt="${video.snippet.title}" 
                     class="video-thumbnail">
                <div class="play-icon">▶</div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.snippet.title}</h3>
                <p class="channel-name">${video.snippet.channelTitle}</p>
                <p class="video-description">
                    ${video.snippet.description.substring(0, 100)}...
                </p>
            </div>
        </div>
    `).join('');

    // Add click handlers to new video cards
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('click', () => {
            const videoId = card.dataset.videoId;
            videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            modal.style.display = "block";
        });
    });
}

// Helper Functions
function showLoader() {
    LOADER.style.display = 'block';
    LOADING_OVERLAY.style.display = 'block';
    ERROR_MSG.style.display = 'none';
    document.querySelector('.content').classList.add('loading');
}

function hideLoader() {
    LOADER.style.display = 'none';
    LOADING_OVERLAY.style.display = 'none';
    document.querySelector('.content').classList.remove('loading');
}

function clearResults() {
    VIDEO_CONTAINER.innerHTML = '';
    ERROR_MSG.style.display = 'none';
}

function showError(message) {
    ERROR_MSG.textContent = message;
    ERROR_MSG.style.display = 'block';
}

// Responsive Layout
function handleResponsiveLayout() {
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        content.classList.add('expanded');
    } else {
        sidebar.classList.remove('collapsed');
        content.classList.remove('expanded');
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadInitialVideos();
    handleResponsiveLayout();
});

window.addEventListener('resize', handleResponsiveLayout);



