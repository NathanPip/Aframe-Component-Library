AFRAME.registerComponent("reduce-vol", {
    schema: {
        sound: {default: "#"},
        newVolume: {default: .5}
    },
    init: function () {

        this.quiet = document.querySelector("#ambient-sound");
        this.origVol = this.quiet.components.sound.data.volume;

        this.collideable = this.el.querySelector(".sound-collideable");
        this.canReduce = false;

        setTimeout(() => {
            this.canReduce = true;
        }, 4500);

        console.log(this.collideable);
        this.collideable.addEventListener("hitstart", () => {
            if(this.canReduce)
                this.quiet.components.sound.pool.children[0].setVolume(this.data.newVolume);
        })

        this.collideable.addEventListener("hitend", () => {
            console.log("end");
            this.quiet.components.sound.pool.children[0].setVolume(this.origVol);
        })
    },
})