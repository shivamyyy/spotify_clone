console.log("Welcome to JavaScript");

let currentsong = new Audio();
let sp; 
let songply; 
let currFolder; 

async function main(folder) {
    currFolder = folder;
    try {
        const response = await fetch(`http://127.0.0.1:5500/${folder}/`);
        const text = await response.text();

        const div = document.createElement('div');
        div.innerHTML = text;
        const songs = Array.from(div.getElementsByTagName('a'))
            .filter(link => link.href.endsWith(".mp3"))
            .map(link => decodeURIComponent(link.href.split('/').pop()));

        songply = songs; 
        const songUl = document.querySelector(".songlist ul");
        songUl.innerHTML = ""; 

        songs.forEach(song => {
            songUl.innerHTML += `
                <li>
                    <img src="images/music.svg" alt="music" class="invert">
                    <div class="infoo">
                        <div>${song}</div>
                        <div>Shivam YD</div>
                    </div>
                    <div class="i2" style="display: flex; gap: 5px;">
                        <span style="margin-top: 5px;">Play now</span>
                        <img src="images/playbtn.svg" alt="play" style="width: 2vw;">
                    </div>
                </li>`;
        });

        attachSongClickEvents();
    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

function attachSongClickEvents() {
    Array.from(document.querySelectorAll(".songlist li")).forEach(li => {
        const songName = li.querySelector(".infoo div").textContent;
        li.addEventListener("click", () => playmusic(songName));
    });
}

function playmusic(track) {
    currentsong.src = `http://127.0.0.1:5500/${currFolder}/` + track;
    currentsong.play();
    sp.src = "images/pause.svg";
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function songPlayFunction() {
    songply = await main("Audio/cs"); // Initial folder load
    console.log(songply);

    const sbt = document.querySelector(".playbtn");
    sp = sbt;

    // adding event listener for pause, play 
    sbt.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            sbt.src = "images/pause.svg";
        } else {
            currentsong.pause();
            sbt.src = "images/playbtn.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        const currentTime = convertSecondsToMinuteSecond(currentsong.currentTime);
        const duration = convertSecondsToMinuteSecond(currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${currentTime}/${duration}`;
        document.querySelector(".circle").style.left = 
            (currentsong.currentTime / currentsong.duration) * 97.7 + "%";
    });

    // adding event listener on seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = 
            (e.offsetX / e.target.getBoundingClientRect().width) * 97.7 + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    // adding event listener on previous button
    document.querySelector(".previous").addEventListener("click", () => {
        const currentSongFile = decodeURIComponent(currentsong.src.split("/").pop());
        const index = songply.indexOf(currentSongFile);
        if (index > 0) {
            playmusic(songply[index - 1]);
        } 
    });


// adding event listener on next button
document.querySelector(".nxtbtn").addEventListener("click", () => {
    const currentSongFile = decodeURIComponent(currentsong.src.split("/").pop());
    const index = songply.indexOf(currentSongFile);
    if (index >= 0 && index + 1 < songply.length) {
        playmusic(songply[index + 1]);
    } 
});
    // adding event listener or card
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            await main(`Audio/${card.dataset.folder}`);
        });
    });
}

//function to convertSecondsToMinuteSecond
function convertSecondsToMinuteSecond(seconds) {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
}

songPlayFunction();
