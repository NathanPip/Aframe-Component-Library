AFRAME.registerComponent('twoway-movement', {
    schema: {
        speed: { type: "number", default: 40 },
        threshold: { type: "number", default: -40 },
        nonMobileLoad: { type: "boolean", default: false },
        removeCheckpoints: {type: "boolean", default: true },
        chatty: {type: "boolean", default: true }
    },
    init: function () {
        var twowaymotion = document.querySelector("[camera]").components["twoway-movement"];
        twowaymotion.componentName = "twoway-motion";
        let report = function(text) {
            if (twowaymotion.data.chatty) {
                // console.log(twowaymotion.componentName, ":", text); 
            }
        }

        report("init."); 
        // report("asked to load with speed=", this.data.speed);

        if (!AFRAME.utils.device.isMobile() && this.data.nonMobileLoad === false) {
            // this is only for mobile devices.
            //document.querySelector("[camera]").removeAttribute("twoway-motion");
            report("Retired. Will only work on mobile.");
            return;
        } else {
            if (this.data.nonMobileLoad === true) {
                report("Loading on non-mobile platform.");
            }
        }

        if (this.el.components["wasd-controls"] === undefined) {
            this.el.setAttribute("wasd-controls", "true");
            report("Installing wasd-controls.");
        }
        this.el.components["wasd-controls"].data.acceleration = this.data.speed;

        // two-way hides checkpoint-controls by default.
        if (this.data.removeCheckpoints) {
            if (this.el.components["checkpoint-controls"] !== undefined) {
                var checkpoints = document.querySelectorAll("[checkpoint]");
                for (var cp = 0; cp < checkpoints.length; cp++) {
                    checkpoints[cp].setAttribute("visible", false);
                }
            }
        }

        this.el.removeAttribute("universal-controls");
        if (this.el.components["look-controls"] === undefined) {
            this.el.setAttribute("look-controls", "true");
        }

        var cur = document.querySelector("[cursor]");
        if (cur !== null) {
            // console.log(this.componentName, ": found a cursor.");
            this.cur = cur;
            //this.curcolor = cur.getAttribute("material").color;
            this.curcolor = cur.getAttribute("color");
        } else {
            // console.log(this.componentName, ": didn't find a cursor.");
        }

        var canvas = document.querySelector(".a-canvas");

        canvas.addEventListener("mousedown", function (e) {
            report("mousedown", e);
            twowaymotion.touching = true;
            this.touchTime = new Date().getTime();
        });
        canvas.addEventListener("mouseup", function (e) {
            report("mouseup", e);
            twowaymotion.touching = false;
        });

        canvas.addEventListener("touchstart", function (e) {
            this.touch = e;
            report("touches.length: ", e.touches.length);
            if (e.touches.length > 1 || twowaymotion.touching === true) {
                twowaymotion.doubleTouching = true;
                twowaymotion.touching = false;
            } else {
                report("touchstart", e);
                twowaymotion.touching = true;
            }
        });
        canvas.addEventListener("touchend", function () {
            // console.log(this.componentName, " touchend");
            if(!twowaymotion.touching)
                twowaymotion.doubleTouching = false;
            twowaymotion.touching = false;
        });
    },
    update: function() { 
        if (this.el.components["twoway-controls"] !== undefined) {
            this.el.components["wasd-controls"].data.acceleration = this.el.components["wasd-controls"].data.speed;
        }
    },
    tick: function () {
        if (!AFRAME.utils.device.isMobile() && this.data.nonMobileLoad === false) {
            // this is only for mobile devices, unless you ask for it.
            return;
        }
        if (!this.isPlaying) {
            return;
        }
        var cam = this.el;
        if (this.cur !== null && this.cur !== undefined) {
            this.cur.setAttribute("material", "color", this.curcolor);
        }
        if (this.touching === true) {
            cam.components["wasd-controls"].keys["ArrowUp"] = true;
        } else if(this.doubleTouching === true) {
            cam.components["wasd-controls"].keys["ArrowUp"] = false;
            cam.components["wasd-controls"].keys["ArrowDown"] = true;
        } else {
            cam.components["wasd-controls"].keys["ArrowDown"] = false;
            cam.components["wasd-controls"].keys["ArrowUp"] = false;
        }
    },
    pause: function () {
        // we get isPlaying automatically from A-Frame
    },
    play: function () {
        // we get isPlaying automatically from A-Frame
    },
    remove: function () {
        if (this.el.components["wasd-controls"] === undefined) {
            this.el.removeAttribute("wasd-controls");
        }
    }
});

AFRAME.registerComponent('tilt-turn', {
    schema: {
        criticalAngle: { type: "number", default: 14 },
        turnScale: { type: "number", default: 0.0025 },
        maxTurn: { type: "number", default: 16 }
    },
    init: function () {
        var tiltturn = document.querySelector("[camera]").components["tilt-turn"];
        if (!AFRAME.utils.device.isMobile()) {
            return;
        }
        // console.log("tilt-turn: init.");
        // if there is no look-controls, put it in.
        if (this.el.components["look-controls"] === undefined) {
            this.el.setAttribute("look-controls", "true");
        }
    },
    update: function() {
    },
    tick: function () {
        //console.log("tt"); 
        if (!AFRAME.utils.device.isMobile()) {
            return;
        }
        var tiltturn = document.querySelector("[camera]").components["tilt-turn"];
        if (!tiltturn.isPlaying) {
            return;
            // console.log("tilt-turn isn't playing.")
        }
        var cam = this.el;
        var camrot = cam.getAttribute("rotation");
        var x = camrot.x;
        var y = camrot.y;
        //var z = camrot.z;
        if (x < -75 || x > 75) {
            // the headset is looking down or up - don't spin
            //console.log("headset out of range. x:", x);
            return;
        }
        var lc = this.el.components["look-controls"];
        var z = THREE.Math.radToDeg(lc.hmdQuaternion._z);
        var turnScale = this.data.turnScale; // .003;
        var maxTurn = this.data.maxTurn; // 16;
        var criticalAngle = this.data.criticalAngle; // 14;
        var thisTurn = 0;
        var yo = lc.yawObject;
        //console.log("z:", z);
        if (z < (criticalAngle * -1)) {
            //console.log("turning right");
            // z is less than -25, e.g. -30
            thisTurn = z + criticalAngle;
            if (thisTurn < (maxTurn * -1)) {
                thisTurn = (maxTurn * -1);
            }
            thisTurn *= turnScale;
            yo.rotation._y += thisTurn;
            yo.rotation.y += thisTurn;
        } else if (z > criticalAngle) {
            //console.log("turning left");
            // z is more than 25, e.g. 30
            thisTurn = z - criticalAngle;
            if (thisTurn > maxTurn) {
                thisTurn = maxTurn;
            }
            thisTurn *= turnScale;
            yo.rotation._y += thisTurn;
            yo.rotation.y += thisTurn;
        }

    },
    pause: function () {
        // we get isPlaying automatically from A-Frame
    },
    play: function () {
        // we get isPlaying automatically from A-Frame
    },
    remove: function () {
        this.el.setAttribute("look-controls", "false");
    }
});