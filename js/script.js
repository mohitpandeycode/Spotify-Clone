let currentSong = new Audio(); // store currrent song 
let songs;
var lastTouchTime = 0;
let currFolder;
//  function to change song time to minute/seconds formate 
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// function for get all the songs from folder...
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    //get the folder in text form
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")  //get the a tag name items from folder body
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {  //get the songs use this method
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // show all songs in the library section..
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <i class="ri-music-2-fill" style="margin-top: 3%; font-size: 25px;"></i>
        <div class="info">
            <div>${song.replaceAll("%20", " ")} </div>
            <div>Pagalworld.mp3</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <i class="ri-play-circle-fill" style="font-size: 25px;"></i>
        </div>
    </li>`;
    }

    // Attach an event listner to each song for click and play....
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
    return songs
}

//playing current song 
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    //pause the play bar firt song and play when click on play button...
    if (!pause) {
        currentSong.play()
        play.className = "ri-pause-circle-line"
    }
    document.querySelector(".songName").innerHTML = `<em>${decodeURI(track)}</em>`
    document.querySelector(".songTime").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    let a = await fetch("/songs/")
    let response = await a.text();
    //get the folder in text form
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let spotifyplaylist = document.querySelector(".spotifyplaylist")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = (e.href.split("/").slice(-1)[0])
            //get the meta data of these folers
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            spotifyplaylist.innerHTML = spotifyplaylist.innerHTML + `   
            <div data-folder ="${folder}" class="card">
            <div class="img">
                <img class="playlistImg" src="/songs/${folder}/cover.jpeg" alt="img">
                <button><img src="static/play.png" alt="play"></button>
            </div>
            <h4>${response.title}</h4>
            <p style="color: #a7a7a7; font-size: 0.8rem;">${response.description}</p>
        </div>`
        }
    }
    // load the folder in a playlist library when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            document.querySelector(".songList").style.height = "50vh"
            document.querySelector(".plus").className = "ri-arrow-up-s-line icon plus"
            document.querySelectorAll(".first").forEach(element => {
                element.style.display = "none";
            });
        })
    });

    //add event listner in prev and next
    prev.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        else {
            playMusic(songs[songs.length - 1])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0])
        }
    })

}

async function main() {
    // get the list of all songs
    let songs = await getSongs("songs/Ringtunes")
    playMusic(songs[0], true)  //by default the 1st song on playbar...
 
    // display alll the albums of folders on the page...
    displayAlbums()

    // Attach a event listner to play pause buttons
    // using play id give to the play icon in html to perform action with play button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.className = "ri-pause-circle-line"
        }
        else {
            currentSong.pause()
            play.className = "ri-play-circle-line"  //change the icon after pause or play
        }
    })

    //listen the timeupdate of the song...
    currentSong.addEventListener("timeupdate", () => {
        // make the time formate in html ...
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        // run the circle in seekbar of song..
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // eventlistner to seekbar..
    document.querySelector(".seekbar").addEventListener("click", e => {
        let precent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        // chnage the duration on the seekbar movement.... 
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * precent + "%";
        currentSong.currentTime = ((currentSong.duration) * precent) / 100
    })

    //add eventlistner for hamburger..
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // event for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-300px"
    })
    // event for your library arrow button
    document.querySelector(".heading").addEventListener("click", () => {
        document.querySelector(".songList").style.height = "50vh"
        document.querySelector(".plus").className = "ri-arrow-up-s-line icon plus"
        document.querySelectorAll(".first").forEach(element => {
            element.style.display = "none";
        });
    })

    //for up the songs and hide
    document.querySelector(".heading").addEventListener("dblclick", () => {
        toggleSongList();
    });

    document.querySelector(".heading").addEventListener("touchstart", function (event) {
        var now = new Date().getTime();
        var timeDiff = now - lastTouchTime;

        if (timeDiff < 300 && timeDiff > 0) {
            // This is a double-tap for mobile
            event.preventDefault();
            toggleSongList();
        } else {
            // Not a double-tap, reset the timer
            lastTouchTime = now;
        }
    });
    

    function toggleSongList() {
        document.querySelector(".songList").style.height = "0";
        document.querySelector(".plus").className = "ri-arrow-down-s-line icon plus";
        document.querySelectorAll(".first").forEach(element => {
            element.style.display = "flex";
        });
    }


    //add event to volume...
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume").className = document.querySelector(".volume").className.replace("ri-volume-mute-line volume", "ri-volume-up-line volume")
        }
        else {
            document.querySelector(".volume").className = document.querySelector(".volume").className.replace("ri-volume-up-line volume", "ri-volume-mute-line volume")
        }
    })

    // add event listner to mute the volume button
    document.querySelector(".volume").addEventListener("click", e => {
        if (e.target.className == "ri-volume-up-line volume") {
            e.target.className = "ri-volume-mute-line volume"
            currentSong.volume = "0";
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.className = "ri-volume-up-line volume"
            currentSong.volume = "0.5";
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
    
    //disable mouse intractions...
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault(); // Disable right-click context menu
      });
  
      document.addEventListener('selectstart', function (e) {
        e.preventDefault(); // Disable text selection

      });

}

main()
