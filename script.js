console.log('here is your javascript');

// Function to fetch songs
async function getsongs() {
    try {
        // Fetch the URL and wait for the promise to resolve
        let response = await fetch("https://codeunique4565.github.io/music/");
        
        // Check if the response is okay (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Extract text from the response
        let text = await response.text();
      
        // Print the actual text
        console.log(text);

        // Create a new div element
        let div = document.createElement("div");
        div.innerHTML = text;  // Use `text` here, not `response`

        // Get all <a> elements within the div
        let as = div.getElementsByTagName("a");
        let songs = [];
        for (let i = 0; i < as.length; i++) {
            const element = as[i];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href);
            }
        }
        return songs;

    } catch (error) {
        // Handle errors (e.g., network issues, invalid URL)
        console.error('Error fetching data:', error);
        return [];  // Return an empty array in case of an error
    }
}

// Function to format time in MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

async function main() {
    try {
        // Fetch all songs
        let songs = await getsongs();
        console.log(songs);

        // Get the <ul> element
        let songUL = document.querySelector(".lists ul");

        // Clear existing items if any
        songUL.innerHTML = '';

        // Append each song as a list item
        for (const song of songs) {
            // Create list item
            const listItem = document.createElement('li');

            // Create an info div for this song
            const infoDiv = document.createElement('div');
            infoDiv.className = 'info';
            infoDiv.innerHTML = `
                <span class="song-name">${song.split('/').pop()}</span>
                <div class="addition">
                    <a href="#" class="play-button" data-song-url="${song}">
                        <img src="addition.svg" height="40px" alt="Play">
                    </a>
                </div>
            `;
            
            // Append the info div to the list item
            listItem.appendChild(infoDiv);
            
            // Append list item to the <ul>
            songUL.appendChild(listItem);
        }

        // Create and add a duration display if not already present
        let durationDisplay = document.getElementById('durationDisplay');
        if (!durationDisplay) {
            durationDisplay = document.createElement('div');
            durationDisplay.id = 'durationDisplay';
            document.body.appendChild(durationDisplay);
        }

        // Create and add control buttons
        let controls = document.createElement('div');
        controls.id = 'controls';
        controls.innerHTML = `
            <button id="prev-button" class="control-button" title="Previous">Prev</button>
            <button id="play-pause-button" class="control-button" title="Play/Pause">Play</button>
            <button id="next-button" class="control-button" title="Next">Next</button>
            <div id="progress-container">
                <input type="range" id="progress-bar" value="0" min="0" step="1" style="width: 300px;">
            </div>
            <div id="volume-container">
                <label for="volume-bar">Volume:</label>
                <input type="range" id="volume-bar" value="1" min="0" max="1" step="0.01" style="width: 150px;">
            </div>
        `;
        document.body.appendChild(controls);

        // Track the currently playing audio
        let currentAudio = null;
        let currentSongIndex = 0;

        // Play a specific song
        function playSong(index) {
            if (index < 0 || index >= songs.length) {
                return; // Index out of range
            }

            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }

            currentAudio = new Audio(songs[index]);
            currentSongIndex = index;

            // Update duration display
            currentAudio.addEventListener('loadedmetadata', () => {
                durationDisplay.textContent = `Duration: ${formatTime(currentAudio.duration)}`;
                document.getElementById('progress-bar').max = currentAudio.duration;
            });

            // Update current time display and progress bar
            currentAudio.addEventListener('timeupdate', () => {
                durationDisplay.textContent = `Current Time: ${formatTime(currentAudio.currentTime)} / Duration: ${formatTime(currentAudio.duration)}`;
                document.getElementById('progress-bar').value = currentAudio.currentTime;
            });

            // Handle play errors
            currentAudio.addEventListener('error', (error) => {
                console.error('Error playing audio:', error);
                durationDisplay.textContent = 'Error playing this song.';
            });

            currentAudio.play().catch(error => {
                console.error('Error playing audio:', error);
                durationDisplay.textContent = 'Error playing this song.';
            });
        }

        // Play/Pause button event
        document.getElementById('play-pause-button').addEventListener('click', (event) => {
            event.preventDefault();
            if (currentAudio) {
                if (currentAudio.paused) {
                    currentAudio.play();
                    event.currentTarget.textContent = 'Pause'; // Update to Pause text
                } else {
                    currentAudio.pause();
                    event.currentTarget.textContent = 'Play'; // Update to Play text
                }
            } else {
                // Play the first song if no song is currently playing
                playSong(0);
                event.currentTarget.textContent = 'Pause'; // Update to Pause text
            }
        });

        // Previous button event
        document.getElementById('prev-button').addEventListener('click', (event) => {
            event.preventDefault();
            if (songs.length > 0) {
                playSong((currentSongIndex - 1 + songs.length) % songs.length);
            }
        });

        // Next button event
        document.getElementById('next-button').addEventListener('click', (event) => {
            event.preventDefault();
            if (songs.length > 0) {
                playSong((currentSongIndex + 1) % songs.length);
            }
        });

        // Add event listeners to play buttons in the list
        document.querySelectorAll('.play-button').forEach(button => {
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                let songUrl = event.currentTarget.getAttribute('data-song-url');
                let index = songs.indexOf(songUrl);

                // Stop the currently playing audio if there is one
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }

                // Create a new audio object for the selected song
                currentAudio = new Audio(songUrl);
                currentSongIndex = index;

                // Update duration display
                currentAudio.addEventListener('loadedmetadata', () => {
                    durationDisplay.textContent = `Duration: ${formatTime(currentAudio.duration)}`;
                    document.getElementById('progress-bar').max = currentAudio.duration;
                });

                // Update current time display and progress bar
                currentAudio.addEventListener('timeupdate', () => {
                    durationDisplay.textContent = `Current Time: ${formatTime(currentAudio.currentTime)} / Duration: ${formatTime(currentAudio.duration)}`;
                    document.getElementById('progress-bar').value = currentAudio.currentTime;
                });

                // Handle play errors
                currentAudio.addEventListener('error', (error) => {
                    console.error('Error playing audio:', error);
                    durationDisplay.textContent = 'Error playing this song.';
                });

                try {
                    await currentAudio.play();
                    document.getElementById('play-pause-button').textContent = 'Pause'; // Update to Pause text
                } catch (error) {
                    console.error('Error playing audio:', error);
                    durationDisplay.textContent = 'Error playing this song.';
                }
            });
        });

        // Update progress bar as user changes it
        document.getElementById('progress-bar').addEventListener('input', (event) => {
            if (currentAudio) {
                currentAudio.currentTime = event.currentTarget.value;
            }
        });

        // Update volume as user changes it
        document.getElementById('volume-bar').addEventListener('input', (event) => {
            if (currentAudio) {
                currentAudio.volume = event.currentTarget.value;
            }
        });

    } catch (error) {
        console.error('Error in main function:', error);
    }
}

// Call main to fetch songs and setup the play prompt
main();
