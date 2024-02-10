const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const volumeRange = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const playbackScroll = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoController = document.getElementById("videoControls");

let volumValue = 0.5;

const handlePlay = (e) => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
};

const handleMute = (e) => {
    if (video.muted) {
        video.muted = false;
    } else {
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted
        ? "fas fa-volume-mute"
        : "fas fa-volume-up";
    volumeRange.value = video.muted ? 0 : volumValue;
    // console.log(volumeRange.value);
};

const handleVolumeChange = (event) => {
    // console.log(event);
    const {
        target: { value },
    } = event; // same as const value = event.target.value;
    video.volume = value;
    volumValue = value;
};
const handleTimeChange = (event) => {
    const {
        target: { value },
    } = event;
    video.currentTime = value * video.duration;
};

const formatDate = (seconds) => {
    const secondsNumber = parseInt(seconds, 10);
    let hours = Math.floor(secondsNumber / 3600);
    let minutes = Math.floor((secondsNumber - hours * 3600) / 60);
    let totalSeconds = secondsNumber - hours * 3600 - minutes * 60;

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    totalSeconds = String(totalSeconds).padStart(2, "0");
    if (hours === "00") {
        return `${minutes}:${totalSeconds}`;
    }

    return `${hours}:${minutes}:${totalSeconds}`;
};

const handleloadedmetadata = () => {
    totalTime.innerText = formatDate(video.duration);
};

const handleTimeUpdate = () => {
    // console.log(video.currentTime);
    currentTime.innerText = formatDate(Math.floor(video.currentTime));
    playbackScroll.value = video.currentTime / video.duration;
};

const handleFullscreenControl = () => {
    const fullscreen = document.fullscreenElement;
    if (fullscreen) {
        document.exitFullscreen();
        fullScreenBtnIcon.classList = "fas fa-expand";
    } else {
        videoContainer.requestFullscreen();
        fullScreenBtn.classList = "fas fa-compress";
    }
};

let controllerTimeout = null;

const hideController = () => {
    videoController.classList.remove("showing");
    // console.log("hiding", videoController.classList);
};

const handleMouseMove = () => {
    if (controllerTimeout) {
        // console.log("before clear", controllerTimeout);
        clearTimeout(controllerTimeout);
        controllerTimeout = null;
        // console.log("after clear", controllerTimeout);
    }
    controllerTimeout = setTimeout(() => {
        hideController();
    }, 5000);
    videoController.classList.add("showing");
};

const handleMouseLeave = () => {
    // console.log("before settimeout", controllerTimeout);
    controllerTimeout = setTimeout(() => {
        hideController();
    }, 3000);
    // console.log("after settimeout", controllerTimeout);
};

//spacebar pause/play
document.body.onkeyup = function (e) {
    if (e.code === "Space") {
        handlePlay();
    }
};

//mute/unmute
document.body.onkeyup = function (e) {
    if (e.code === "KeyM") {
        handleMute();
    }
};

const handleVideoEnded = () => {
    const { id } = videoContainer.dataset;
    // console.log(videoContainer.dataset);
    fetch(`/api/videos/${id}/view`, {
        method: "POST",
    });
    // console.log("video ended");
};
// apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);

//click video pause/play
video.addEventListener("click", handlePlay);

playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
playbackScroll.addEventListener("input", handleTimeChange);
video.addEventListener("loadeddata", handleloadedmetadata);
// when video is loaded, this event is fired
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleVideoEnded);
fullScreenBtn.addEventListener("click", handleFullscreenControl);
videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
// videoController.classList.add("showing");
//for testing
