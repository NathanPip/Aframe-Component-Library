AFRAME.registerComponent("follow-player", {
  schema: {
    height: { default: 2.75 },
    active: { default: true },
    playerId: {default: "#player"}
  },
  tock: function () {
    if (this.data.active) {
      let user = document.querySelector(this.data.playerId);
      if (user) {
        this.el.setAttribute(
          "position",
          `${user.object3D.position.x} ${this.data.height} ${user.object3D.position.z}`
        );
      }
    }
  },
});

AFRAME.registerComponent("look-at", {
  schema: {
    target: { default: "user" },
    constrainY: { default: !0 },
  },
  init: function () {
    this.pos = new THREE.Vector3();
  },
  tick: function () {
    if (this.data.target === "user") {
      this.el.sceneEl.camera.getWorldPosition(this.pos);
    } else {
      let obj = document.querySelector(this.data.target);
      obj.object3D.getWorldPosition(this.pos);
    }
    if (this.data.constrainY === !0) {
      this.yPos = this.el.object3D.position.y;
    } else {
      this.yPos = this.pos.y;
    }
    this.el.object3D.lookAt(this.pos.x, this.yPos, this.pos.z);
  },
});
