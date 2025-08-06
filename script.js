// Music Player Application
class MusicPlayer {
    constructor() {
        this.songs = [
            {
                id: '1',
                title: 'Your Song', // Change this to your song's actual title
                artist: 'Your Artist', // Change this to your song's actual artist
                duration: 180,
                src: '/song/song1.mp3' // This should match your file name
            },
            {
                id: '2',
                title: 'Electric Nights',
                artist: 'Digital Echo',
                duration: 240,
                src: '/song/song2.mp3'
            },
            {
                id: '3',
                title: 'Synthetic Soul',
                artist: 'Modern Beats',
                duration: 200,
                src: '/song/song3.mp3'
            },
            {
                id: '4',
                title: 'Neon Pulse',
                artist: 'Cyber Sound',
                duration: 195,
                src: '/song/song4.mp3'
            },
            {
                id: '5',
                title: 'Future Bass',
                artist: 'Audio Architects',
                duration: 225,
                src: '/song/song5.mp3'
            },
            {
                id: '6',
                title: 'Digital Horizon',
                artist: 'Synthetic Dreams',
                duration: 210,
                src: '/song/song6.mp3'
            },
            {
                id: '7',
                title: 'Cosmic Drift',
                artist: 'Space Sounds',
                duration: 190,
                src: '/song/song7.mp3'
            },
            {
                id: '8',
                title: 'Binary Beats',
                artist: 'Code Music',
                duration: 215,
                src: '/song/song8.mp3'
            }
        ];

        this.state = {
            currentView: 'home',
            currentSong: null,
            isPlaying: false,
            currentTime: 0,
            volume: 1,
            shuffle: false,
            repeat: false,
            likedSongs: new Set(),
            recentlyPlayed: [],
            playlists: [],
            selectedPlaylist: null,
            showAddToPlaylist: null,
            previousVolume: 1
        };

        this.audio = document.getElementById('audioPlayer');
        
        // Initialize the app
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Load user data from localStorage
            this.loadUserData();
            
            // Initialize event listeners
            this.initializeEventListeners();
            
            // Render initial content
            this.renderContent();
            this.renderPlaylists();
            this.updateCounts();
            
            console.log('Music player initialized successfully');
        } catch (error) {
            console.error('Failed to initialize music player:', error);
            // Fall back to default data
            this.initializeEventListeners();
            this.renderContent();
            this.renderPlaylists();
            this.updateCounts();
        }
    }

    loadUserData() {
        try {
            const userData = this.getStoredData();
            
            // Update state with loaded data
            this.state.likedSongs = new Set(userData.likedSongs || []);
            this.state.recentlyPlayed = userData.recentlyPlayed || [];
            this.state.playlists = userData.playlists || [];
            
            console.log('User data loaded successfully');
        } catch (error) {
            console.error('Failed to load user data:', error);
            // Use default data
            this.state.playlists = [
                {
                    id: '1',
                    name: 'My Playlist #1',
                    songs: [],
                    createdAt: new Date('2024-01-15')
                },
                {
                    id: '2',
                    name: 'Chill Mix',
                    songs: [],
                    createdAt: new Date('2024-01-10')
                },
                {
                    id: '3',
                    name: 'Workout Beats',
                    songs: [],
                    createdAt: new Date('2024-01-05')
                }
            ];
        }
    }

    getStoredData() {
        const data = localStorage.getItem('musicPlayerData');
        return data ? JSON.parse(data) : {
            likedSongs: [],
            recentlyPlayed: [],
            playlists: [
                {
                    id: '1',
                    name: 'My Playlist #1',
                    songs: [],
                    createdAt: new Date('2024-01-15').toISOString()
                },
                {
                    id: '2',
                    name: 'Chill Mix',
                    songs: [],
                    createdAt: new Date('2024-01-10').toISOString()
                },
                {
                    id: '3',
                    name: 'Workout Beats',
                    songs: [],
                    createdAt: new Date('2024-01-05').toISOString()
                }
            ]
        };
    }

    saveUserData() {
        try {
            const userData = {
                likedSongs: Array.from(this.state.likedSongs),
                recentlyPlayed: this.state.recentlyPlayed,
                playlists: this.state.playlists
            };
            
            localStorage.setItem('musicPlayerData', JSON.stringify(userData));
            console.log('User data saved successfully');
        } catch (error) {
            console.error('Failed to save user data:', error);
            this.showToast('Failed to save data.');
        }
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.setCurrentView(view);
                // Auto-close mobile sidebar
                this.closeMobileSidebar();
            });
        });

        document.querySelectorAll('.quick-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.setCurrentView(view);
                // Auto-close mobile sidebar
                this.closeMobileSidebar();
            });
        });

        // Mobile menu
        document.getElementById('mobileMenu').addEventListener('click', () => {
            document.getElementById('sidebar').classList.add('open');
            document.body.classList.add('sidebar-open');
        });

        document.getElementById('mobileClose').addEventListener('click', () => {
            this.closeMobileSidebar();
        });

        // Player controls
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.playNext();
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            this.playPrevious();
        });

        document.getElementById('shuffleBtn').addEventListener('click', () => {
            this.toggleShuffle();
        });

        document.getElementById('repeatBtn').addEventListener('click', () => {
            this.toggleRepeat();
        });

        // Progress bar
        document.getElementById('progressBar').addEventListener('click', (e) => {
            this.handleProgressClick(e);
        });

        // Volume control
        document.getElementById('volumeBar').addEventListener('click', (e) => {
            this.handleVolumeClick(e);
        });

        // Mute button
        document.getElementById('muteBtn').addEventListener('click', () => {
            this.toggleMute();
        });

        // Volume up/down with keyboard or mouse wheel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' && e.ctrlKey) {
                e.preventDefault();
                this.adjustVolume(0.1);
            } else if (e.key === 'ArrowDown' && e.ctrlKey) {
                e.preventDefault();
                this.adjustVolume(-0.1);
            }
        });

        // Mouse wheel volume control on volume bar
        document.getElementById('volumeBar').addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            this.adjustVolume(delta);
        });

        // Like current song
        document.getElementById('likeCurrentSong').addEventListener('click', () => {
            if (this.state.currentSong) {
                this.toggleLike(this.state.currentSong.id);
            }
        });

        // Playlist creation
        document.getElementById('addPlaylist').addEventListener('click', () => {
            this.showCreatePlaylistModal();
        });

        document.getElementById('modalClose').addEventListener('click', () => {
            this.hideCreatePlaylistModal();
        });

        document.getElementById('cancelPlaylist').addEventListener('click', () => {
            this.hideCreatePlaylistModal();
        });

        document.getElementById('confirmPlaylist').addEventListener('click', () => {
            this.createPlaylist();
        });

        document.getElementById('playlistNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.createPlaylist();
            }
        });

        // Audio events
        this.audio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        this.audio.addEventListener('ended', () => {
            this.handleSongEnd();
        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.updateDuration();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            console.log('Failed to load:', this.audio.src);
            console.log('Make sure your file exists at the correct path');
        });

        this.audio.addEventListener('canplay', () => {
            console.log('Audio can play:', this.audio.src);
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-playlist-dropdown')) {
                this.state.showAddToPlaylist = null;
                this.renderContent();
            }
        });
    }

    closeMobileSidebar() {
        document.getElementById('sidebar').classList.remove('open');
        document.body.classList.remove('sidebar-open');
    }

    setCurrentView(view, playlistId = null) {
        // Update navigation active states
        document.querySelectorAll('.nav-item, .quick-item, .playlist-item').forEach(item => {
            item.classList.remove('active');
        });

        if (view === 'playlist' && playlistId) {
            this.state.selectedPlaylist = playlistId;
            document.querySelector(`[data-playlist="${playlistId}"]`)?.classList.add('active');
        } else {
            document.querySelector(`[data-view="${view}"]`)?.classList.add('active');
        }

        this.state.currentView = view;
        this.renderContent();
        this.updatePageTitle();
    }

    updatePageTitle() {
        const titleElement = document.getElementById('pageTitle');
        let title = this.state.currentView;

        if (this.state.currentView === 'playlist' && this.state.selectedPlaylist) {
            const playlist = this.state.playlists.find(p => p.id === this.state.selectedPlaylist);
            title = playlist ? playlist.name : 'Playlist';
        } else if (this.state.currentView === 'liked') {
            title = 'Liked Songs';
        } else if (this.state.currentView === 'recent') {
            title = 'Recently Played';
        }

        titleElement.textContent = title.charAt(0).toUpperCase() + title.slice(1);
    }

    renderContent() {
        const contentArea = document.getElementById('contentArea');
        
        switch (this.state.currentView) {
            case 'home':
                contentArea.innerHTML = this.renderHome();
                break;
            case 'library':
                contentArea.innerHTML = this.renderLibrary();
                break;
            case 'browse':
                contentArea.innerHTML = this.renderBrowse();
                break;
            case 'liked':
                contentArea.innerHTML = this.renderLikedSongs();
                break;
            case 'recent':
                contentArea.innerHTML = this.renderRecentlyPlayed();
                break;
            case 'playlist':
                contentArea.innerHTML = this.renderPlaylist();
                break;
            default:
                contentArea.innerHTML = this.renderHome();
        }

        this.attachSongListeners();
    }

    renderHome() {
        return `
            <div class="home-content">
                <h2 style="font-size: 32px; font-weight: 700; margin-bottom: 32px;">Good evening</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 48px;">
                    <div class="quick-access-card" onclick="musicPlayer.setCurrentView('liked')" style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(236, 72, 153, 0.2)); border: 1px solid rgba(239, 68, 68, 0.3); padding: 20px; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ef4444, #ec4899); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-heart" style="font-size: 24px; color: white;"></i>
                            </div>
                            <div>
                                <h3 style="font-weight: 600; margin-bottom: 4px;">Liked Songs</h3>
                                <p style="color: #94a3b8; font-size: 14px;">${this.state.likedSongs.size} songs</p>
                            </div>
                        </div>
                    </div>
                    
                    ${this.state.recentlyPlayed.length > 0 ? `
                    <div class="quick-access-card" onclick="musicPlayer.setCurrentView('recent')" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2)); border: 1px solid rgba(34, 197, 94, 0.3); padding: 20px; border-radius: 12px; cursor: pointer; transition: all 0.2s;">
                        <div style="display: flex; align-items: center; gap: 16px;">
                            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #22c55e, #10b981); border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                <i class="fa-solid fa-clock" style="font-size: 24px; color: white;"></i>
                            </div>
                            <div>
                                <h3 style="font-weight: 600; margin-bottom: 4px;">Recently Played</h3>
                                <p style="color: #94a3b8; font-size: 14px;">${this.state.recentlyPlayed.length} songs</p>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>

                <div style="margin-bottom: 48px;">
                    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">Popular Songs</h2>
                    ${this.renderSongList(this.songs.slice(0, 6))}
                </div>

                <div>
                    <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 24px;">Recently Played</h2>
                    ${this.state.recentlyPlayed.length > 0 
                        ? this.renderSongList(this.state.recentlyPlayed.slice(0, 5))
                        : '<p style="color: #94a3b8;">No recently played songs</p>'
                    }
                </div>
            </div>
        `;
    }

    renderLibrary() {
        return `
            <div class="library-content">
                <h2 style="font-size: 32px; font-weight: 700; margin-bottom: 32px;">Your Library</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                    <div style="background: rgba(30, 41, 59, 0.5); padding: 20px; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.1);">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                            <i class="fa-solid fa-heart" style="font-size: 20px; color: #ef4444;"></i>
                            <h3 style="font-weight: 600;">Liked Songs</h3>
                        </div>
                        <p style="color: #94a3b8; font-size: 14px;">${this.state.likedSongs.size} songs</p>
                    </div>
                    
                    ${this.state.playlists.map(playlist => `
                        <div style="background: rgba(30, 41, 59, 0.5); padding: 20px; border-radius: 12px; border: 1px solid rgba(148, 163, 184, 0.1);">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <i class="fa-solid fa-music" style="font-size: 20px; color: #a855f7;"></i>
                                <h3 style="font-weight: 600;">${playlist.name}</h3>
                            </div>
                            <p style="color: #94a3b8; font-size: 14px;">${playlist.songs.length} songs</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderBrowse() {
        return `
            <div class="browse-content">
                <h2 style="font-size: 32px; font-weight: 700; margin-bottom: 32px;">Browse Music</h2>
                <p style="color: #94a3b8; margin-bottom: 24px;">${this.songs.length} songs available</p>
                ${this.renderSongList(this.songs)}
            </div>
        `;
    }

    renderLikedSongs() {
        const likedSongs = this.songs.filter(song => this.state.likedSongs.has(song.id));
        
        return `
            <div class="liked-content">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #ef4444, #ec4899); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-heart" style="font-size: 32px; color: white;"></i>
                    </div>
                    <div>
                        <h2 style="font-size: 32px; font-weight: 700; margin-bottom: 8px;">Liked Songs</h2>
                        <p style="color: #94a3b8;">${likedSongs.length} songs</p>
                    </div>
                </div>
                
                ${likedSongs.length > 0 
                    ? this.renderSongList(likedSongs)
                    : '<p style="color: #94a3b8; text-align: center; padding: 48px 0;">No liked songs yet. Start liking songs to see them here!</p>'
                }
            </div>
        `;
    }

    renderRecentlyPlayed() {
        return `
            <div class="recent-content">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #22c55e, #10b981); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-clock" style="font-size: 32px; color: white;"></i>
                    </div>
                    <div>
                        <h2 style="font-size: 32px; font-weight: 700; margin-bottom: 8px;">Recently Played</h2>
                        <p style="color: #94a3b8;">${this.state.recentlyPlayed.length} songs</p>
                    </div>
                </div>
                
                ${this.state.recentlyPlayed.length > 0 
                    ? this.renderSongList(this.state.recentlyPlayed)
                    : '<p style="color: #94a3b8; text-align: center; padding: 48px 0;">No recently played songs</p>'
                }
            </div>
        `;
    }

    renderPlaylist() {
        const playlist = this.state.playlists.find(p => p.id === this.state.selectedPlaylist);
        if (!playlist) return '<div>Playlist not found</div>';

        return `
            <div class="playlist-content">
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 32px;">
                    <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #a855f7, #3b82f6); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-music" style="font-size: 32px; color: white;"></i>
                    </div>
                    <div>
                        <h2 style="font-size: 32px; font-weight: 700; margin-bottom: 8px;">${playlist.name}</h2>
                        <p style="color: #94a3b8;">${playlist.songs.length} songs</p>
                    </div>
                </div>
                
                ${playlist.songs.length > 0 
                    ? this.renderSongList(playlist.songs, true)
                    : `
                    <div style="text-align: center; padding: 48px 0;">
                        <i class="fa-solid fa-music" style="font-size: 64px; color: #64748b; margin: 0 auto 16px; display: block;"></i>
                        <p style="color: #94a3b8; margin-bottom: 16px;">This playlist is empty</p>
                        <p style="color: #64748b; font-size: 14px;">Add songs from your library to get started</p>
                        <button onclick="musicPlayer.setCurrentView('browse')" style="margin-top: 16px; background: linear-gradient(135deg, #a855f7, #3b82f6); border: none; color: white; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                            Browse Songs
                        </button>
                    </div>
                    `
                }
            </div>
        `;
    }

    renderSongList(songs, showRemoveFromPlaylist = false) {
        return `
            <div class="song-list">
                ${songs.map((song, index) => `
                    <div class="song-item ${this.state.currentSong?.id === song.id ? 'playing' : ''}" data-song-id="${song.id}">
                        <div class="song-number">${index + 1}</div>
                        <button class="song-play-btn" data-song-id="${song.id}">
                            <i class="fa-solid fa-play"></i>
                        </button>
                        <div class="song-cover">
                            <i class="fa-solid fa-music"></i>
                        </div>
                        <div class="song-info">
                            <div class="song-title">${song.title}</div>
                            <div class="song-artist">${song.artist}</div>
                        </div>
                        <div class="song-actions">
                            <button class="song-like ${this.state.likedSongs.has(song.id) ? 'liked' : ''}" data-song-id="${song.id}">
                                <i class="fa-${this.state.likedSongs.has(song.id) ? 'solid' : 'regular'} fa-heart"></i>
                            </button>
                            ${!showRemoveFromPlaylist ? `
                            <div class="add-to-playlist-dropdown">
                                <button class="add-to-playlist-btn" data-song-id="${song.id}">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                                ${this.state.showAddToPlaylist === song.id ? `
                                <div class="playlist-dropdown">
                                    <div class="dropdown-header">Add to playlist</div>
                                    ${this.state.playlists.map(playlist => `
                                        <button class="playlist-option" onclick="musicPlayer.addSongToPlaylist('${song.id}', '${playlist.id}')">
                                            <i class="fa-solid fa-music"></i>
                                            ${playlist.name}
                                        </button>
                                    `).join('')}
                                </div>
                                ` : ''}
                            </div>
                            ` : `
                            <button class="remove-from-playlist-btn" data-song-id="${song.id}">
                                <i class="fa-solid fa-times"></i>
                            </button>
                            `}
                        </div>
                        <div class="song-duration">${this.formatTime(song.duration)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachSongListeners() {
        // Song play buttons
        document.querySelectorAll('.song-play-btn, .song-item').forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = element.dataset.songId || element.querySelector('[data-song-id]')?.dataset.songId;
                if (songId) {
                    const song = this.songs.find(s => s.id === songId);
                    if (song) {
                        this.playSong(song);
                    }
                }
            });
        });

        // Song like buttons
        document.querySelectorAll('.song-like').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = button.dataset.songId;
                this.toggleLike(songId);
            });
        });

        // Add to playlist buttons
        document.querySelectorAll('.add-to-playlist-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = button.dataset.songId;
                this.toggleAddToPlaylistDropdown(songId);
            });
        });

        // Remove from playlist buttons
        document.querySelectorAll('.remove-from-playlist-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const songId = button.dataset.songId;
                this.removeSongFromPlaylist(songId);
            });
        });
    }

    toggleAddToPlaylistDropdown(songId) {
        if (this.state.showAddToPlaylist === songId) {
            this.state.showAddToPlaylist = null;
        } else {
            this.state.showAddToPlaylist = songId;
        }
        this.renderContent();
    }

    async addSongToPlaylist(songId, playlistId) {
        const song = this.songs.find(s => s.id === songId);
        const playlist = this.state.playlists.find(p => p.id === playlistId);
        
        if (song && playlist) {
            // Check if song is already in playlist
            if (!playlist.songs.find(s => s.id === songId)) {
                playlist.songs.push(song);
                this.state.showAddToPlaylist = null;
                
                // Save to localStorage
                this.saveUserData();
                
                this.renderContent();
                
                // Show success message
                this.showToast(`Added "${song.title}" to "${playlist.name}"`);
            } else {
                this.showToast(`"${song.title}" is already in "${playlist.name}"`);
            }
        }
    }

    removeSongFromPlaylist(songId) {
        const playlist = this.state.playlists.find(p => p.id === this.state.selectedPlaylist);
        if (playlist) {
            playlist.songs = playlist.songs.filter(s => s.id !== songId);
            
            // Save to localStorage
            this.saveUserData();
            
            this.renderContent();
        }
    }

    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 120px;
            right: 24px;
            background: #1e293b;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid rgba(148, 163, 184, 0.2);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    async playSong(song) {
        console.log('Attempting to play:', song.title, 'from:', song.src);
        this.state.currentSong = song;
        this.audio.src = song.src;
        this.audio.play().catch(error => {
            console.error('Error playing song:', error);
            alert(`Cannot play "${song.title}". Please check:\n1. File exists at: ${song.src}\n2. File is a valid audio format\n3. File path is correct`);
        });
        this.state.isPlaying = true;
        
        this.addToRecentlyPlayed(song);
        this.updatePlayerUI();
        this.updatePlayPauseButton();
        this.renderContent(); // Re-render to update playing state
    }

    togglePlayPause() {
        if (!this.state.currentSong) {
            // Auto-select first song from popular songs if none is selected
            this.autoSelectPopularSong();
            return;
        }

        if (this.state.isPlaying) {
            this.audio.pause();
            this.state.isPlaying = false;
        } else {
            this.audio.play().catch(error => {
                console.error('Error playing song:', error);
                alert(`Cannot play "${this.state.currentSong.title}". Please make sure the audio file exists.`);
            });
            this.state.isPlaying = true;
        }

        this.updatePlayPauseButton();
        this.renderContent(); // Re-render to update playing state
    }

    autoSelectPopularSong() {
        // Get popular songs (first 6 songs from the main list)
        const popularSongs = this.songs.slice(0, 6);
        
        if (popularSongs.length > 0) {
            // Select a random song from popular songs
            const randomIndex = Math.floor(Math.random() * popularSongs.length);
            const selectedSong = popularSongs[randomIndex];
            
            // Play the selected song
            this.playSong(selectedSong);
            
            // Show a toast notification
            this.showToast(`Auto-selected: "${selectedSong.title}" by ${selectedSong.artist}`);
        }
    }

    playNext() {
        if (!this.state.currentSong) return;

        const currentIndex = this.songs.findIndex(song => song.id === this.state.currentSong.id);
        let nextIndex;

        if (this.state.shuffle) {
            nextIndex = Math.floor(Math.random() * this.songs.length);
        } else {
            nextIndex = (currentIndex + 1) % this.songs.length;
        }

        this.playSong(this.songs[nextIndex]);
    }

    playPrevious() {
        if (!this.state.currentSong) return;

        const currentIndex = this.songs.findIndex(song => song.id === this.state.currentSong.id);
        const prevIndex = currentIndex === 0 ? this.songs.length - 1 : currentIndex - 1;

        this.playSong(this.songs[prevIndex]);
    }

    toggleShuffle() {
        this.state.shuffle = !this.state.shuffle;
        document.getElementById('shuffleBtn').classList.toggle('active', this.state.shuffle);
    }

    toggleRepeat() {
        this.state.repeat = !this.state.repeat;
        document.getElementById('repeatBtn').classList.toggle('active', this.state.repeat);
    }

    toggleLike(songId) {
        if (this.state.likedSongs.has(songId)) {
            this.state.likedSongs.delete(songId);
        } else {
            this.state.likedSongs.add(songId);
        }

        // Save to localStorage
        this.saveUserData();

        this.updateCounts();
        this.updateLikeButtons();
        
        // Re-render if we're on the liked songs page
        if (this.state.currentView === 'liked') {
            this.renderContent();
        }
    }

    addToRecentlyPlayed(song) {
        // Remove if already exists
        this.state.recentlyPlayed = this.state.recentlyPlayed.filter(s => s.id !== song.id);
        // Add to beginning
        this.state.recentlyPlayed.unshift(song);
        // Keep only last 20
        this.state.recentlyPlayed = this.state.recentlyPlayed.slice(0, 20);
        
        // Save to localStorage
        this.saveUserData();
        
        this.updateCounts();
    }

    updateCounts() {
        document.getElementById('likedCount').textContent = this.state.likedSongs.size;
        document.getElementById('recentCount').textContent = this.state.recentlyPlayed.length;
    }

    updateLikeButtons() {
        document.querySelectorAll('.song-like').forEach(button => {
            const songId = button.dataset.songId;
            button.classList.toggle('liked', this.state.likedSongs.has(songId));
        });

        // Update current song like button
        const currentLikeBtn = document.getElementById('likeCurrentSong');
        if (this.state.currentSong) {
            currentLikeBtn.classList.toggle('liked', this.state.likedSongs.has(this.state.currentSong.id));
        }
    }

    updatePlayerUI() {
        if (this.state.currentSong) {
            document.getElementById('currentSongTitle').textContent = this.state.currentSong.title;
            document.getElementById('currentSongArtist').textContent = this.state.currentSong.artist;
        }
    }

    updatePlayPauseButton() {
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        
        if (this.state.isPlaying) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }

    updateProgress() {
        if (!this.state.currentSong) return;

        this.state.currentTime = this.audio.currentTime;
        const progress = (this.state.currentTime / this.state.currentSong.duration) * 100;
        
        document.getElementById('progressFill').style.width = `${progress}%`;
        document.getElementById('currentTime').textContent = this.formatTime(this.state.currentTime);
    }

    updateDuration() {
        if (this.state.currentSong) {
            document.getElementById('totalTime').textContent = this.formatTime(this.state.currentSong.duration);
        }
    }

    handleProgressClick(e) {
        if (!this.state.currentSong) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        const newTime = percentage * this.state.currentSong.duration;
        
        this.audio.currentTime = newTime;
    }

    handleVolumeClick(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        
        this.setVolume(percentage);
    }

    setVolume(volume) {
        this.state.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.state.volume;
        
        document.querySelector('.volume-fill').style.width = `${this.state.volume * 100}%`;
        this.updateVolumeIcon();
    }

    adjustVolume(delta) {
        const newVolume = this.state.volume + delta;
        this.setVolume(newVolume);
    }

    toggleMute() {
        if (this.state.volume > 0) {
            this.state.previousVolume = this.state.volume;
            this.setVolume(0);
        } else {
            const restoreVolume = this.state.previousVolume || 0.5;
            this.setVolume(restoreVolume);
        }
    }

    updateVolumeIcon() {
        const muteBtn = document.getElementById('muteBtn');
        if (this.state.volume === 0) {
            muteBtn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
            muteBtn.title = 'Unmute';
        } else if (this.state.volume < 0.5) {
            muteBtn.innerHTML = `<i class="fa-solid fa-volume-low"></i>`;
            muteBtn.title = 'Mute';
        } else {
            muteBtn.innerHTML = `<i class="fa-solid fa-volume-high"></i>`;
            muteBtn.title = 'Mute';
        }
    }

    handleSongEnd() {
        if (this.state.repeat) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.playNext();
        }
    }

    showCreatePlaylistModal() {
        document.getElementById('createPlaylistModal').classList.remove('hidden');
        document.getElementById('playlistNameInput').focus();
    }

    hideCreatePlaylistModal() {
        document.getElementById('createPlaylistModal').classList.add('hidden');
        document.getElementById('playlistNameInput').value = '';
    }

    createPlaylist() {
        const name = document.getElementById('playlistNameInput').value.trim();
        if (!name) return;

        const newPlaylist = {
            id: Date.now().toString(),
            name,
            songs: [],
            createdAt: new Date()
        };

        this.state.playlists.push(newPlaylist);
        
        // Save to localStorage
        this.saveUserData();
        
        this.renderPlaylists();
        this.hideCreatePlaylistModal();
        
        this.showToast(`Created playlist "${name}"`);
    }

    renderPlaylists() {
        const playlistContainer = document.getElementById('playlistsList');
        playlistContainer.innerHTML = '';

        if (this.state.playlists.length === 0) {
            playlistContainer.innerHTML = '<p class="empty-message">No playlists created yet. Create one!</p>';
            return;
        }

        this.state.playlists.forEach(playlist => {
            const playlistItem = document.createElement('button');
            playlistItem.className = 'playlist-item';
            playlistItem.setAttribute('data-playlist-id', playlist.id);
            playlistItem.style.display = 'flex';
            playlistItem.style.alignItems = 'center';
            playlistItem.style.justifyContent = 'space-between';

            const playlistInfo = document.createElement('div');
            playlistInfo.className = 'playlist-info';
            playlistInfo.style.flexGrow = '1';
            playlistInfo.innerHTML = `
                <i class="fas fa-music"></i>
                <div>
                    <h3>${playlist.name}</h3>
                    <p>${playlist.songs.length} songs</p>
                </div>
            `;
            playlistItem.appendChild(playlistInfo);

            const playlistActions = document.createElement('div');
            playlistActions.className = 'playlist-actions';
            playlistActions.style.display = 'flex';
            playlistActions.style.gap = '10px';

            const editButton = document.createElement('button');
            editButton.className = 'playlist-action icon-button';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.title = 'Edit Playlist';
            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editPlaylist(playlist.id);
            });
            playlistActions.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.className = 'playlist-action delete icon-button';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.title = 'Delete Playlist';
            deleteButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deletePlaylist(playlist.id);
            });
            playlistActions.appendChild(deleteButton);

            playlistItem.appendChild(playlistActions);

            playlistItem.addEventListener('click', () => {
                this.setCurrentView('playlist', playlist.id);
                this.closeMobileSidebar();
            });

            playlistContainer.appendChild(playlistItem);
        });
    }

    editPlaylist(playlistId) {
        const playlist = this.state.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const newName = prompt('Enter new playlist name:', playlist.name);
        if (newName && newName.trim()) {
            playlist.name = newName.trim();
            
            // Save to localStorage
            this.saveUserData();
            
            this.renderPlaylists();
            if (this.state.currentView === 'playlist' && this.state.selectedPlaylist === playlistId) {
                this.renderContent();
                this.updatePageTitle();
            }
            
            this.showToast(`Renamed playlist to "${playlist.name}"`);
        }
    }

    deletePlaylist(playlistId) {
        if (confirm('Are you sure you want to delete this playlist?')) {
            const playlist = this.state.playlists.find(p => p.id === playlistId);
            const playlistName = playlist ? playlist.name : 'playlist';
            
            this.state.playlists = this.state.playlists.filter(p => p.id !== playlistId);
            
            // Save to localStorage
            this.saveUserData();
            
            this.renderPlaylists();
            
            if (this.state.currentView === 'playlist' && this.state.selectedPlaylist === playlistId) {
                this.setCurrentView('home');
            }
            
            this.showToast(`Deleted "${playlistName}"`);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialize the music player when the page loads
let musicPlayer;
document.addEventListener('DOMContentLoaded', () => {
    musicPlayer = new MusicPlayer();
});