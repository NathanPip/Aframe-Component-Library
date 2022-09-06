
AFRAME.registerComponent("autoplay-fix", {
  schema: {},

  init: function () {
    let sounds1 = document.querySelectorAll("[sound]");
    let sounds2 = document.querySelectorAll("a-sound");
    this.sounds = [...sounds1, ...sounds2];
    let audioObjects = [];
    let soundsPlayed = false;
    for (let i = 0; i < this.sounds.length; i++) {
      this.autoplay;
      if (
        this.sounds[i].hasAttribute("sound") ||
        this.sounds[i].hasAttribute("autoplay")
      ) {
        if (this.sounds[i].hasAttribute("sound")) {
          this.autoplay = this.sounds[i].components.sound.data.autoplay;
        } else if(this.sounds[i].tagName === "a-sound") {
          this.autoplay = this.sounds[i].getAttribute("autoplay");
        }
        if (this.autoplay === true) {
          this.getSound(this.sounds[i].object3D);
          audioObjects.push(this.audio);
        }
      }
    }
    addEventListener("mousedown", () => {
      if (soundsPlayed === false) {
        for (let audio of audioObjects) {
            console.log(audio)
          audio.stop();
          audio.play();
        }
      }
      soundsPlayed = true;
    });
  },

  getSound: function (group) {
    if (group.type === "Audio") {
      this.audio = group;
    } else {
      for (let children of group.children) {
        if (children.type === "Audio"){ 
            let child = children;
            this.audio = child;
        }
        this.getSound(children);
      }
    }
  },
});
