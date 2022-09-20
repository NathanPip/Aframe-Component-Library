const getAudioElements = () => {
  let audioElements = document.querySelectorAll("audio[autoplay=true]");
  audioElements = [...audioElements];
  audioElements = audioElements.map((el) => {
    return { audio: el, isPlaying: false };
  });
  return audioElements;
}


const getVideoElements = () => {
  let videoElements = document.querySelectorAll("video[autoplay=true]");
  let videoElements2 = document.querySelectorAll("video[autoplays=true]");
  videoElements = [...videoElements, ...videoElements2];
  videoElements = videoElements.map((el) => {
    return { video: el, isPlaying: false };
  });
  return videoElements;
}

let audioElements = getAudioElements();
let videoElements = getVideoElements();

const autoplayEventHandler = () => {
  let audios = [...audioElements];
  let videos = [...videoElements];
  for (let audio of audios) {
    if (audio.audio.readyState === 4 && audio.isPlaying === false) {
      audio.audio.volume = 0.5;
      audio.audio.pause();
      audio.audio.play();
      audio.isPlaying = true;
    } else {
      getAudioElements();
    }
  }
  for (let video of videos) {
    if (video.video.readyState === 4 && video.isPlaying === false) {
      video.video.pause();
      video.video.play();
      video.isPlaying = true;
    } else {
      getVideoElements();
    }
  }
}


document.addEventListener("touchend", autoplayEventHandler);
if (!AFRAME.utils.device.isMobile()) {
  document.addEventListener("mousedown", autoplayEventHandler);
  document.addEventListener("keydown", autoplayEventHandler);
}
