/* globals AFRAME */
if (typeof AFRAME === "undefined") {
  throw new Error(
    "Component attempted to register before AFRAME" + " was available."
  );
}

/**
 * Hyper Link component for A-Frame.
 */
/* globals AFRAME */
if (typeof AFRAME === "undefined") {
  throw new Error(
    "Component attempted to register before AFRAME" + " was available."
  );
}

/**
 * Hyper Link component for A-Frame.
 */
AFRAME.registerComponent("href", {
  schema: {
    url: { default: "" },
    shrinkAvatars: { default: false },
    shrinkDelay: { default: 2000 },
  },

  boundClickHandler: undefined,

  clickHandler: function hrefClickHandler() {
    var url = this.data.url;
    var target = this.el.getAttribute("target");
    console.log("link to " + url);
    if (url && url[0] === "#") {
      // in-page anchor
      var ele = document.querySelector(url);
      var cams = document.querySelectorAll("a-camera");
      if (ele && cams) {
        var targetPosition = ele.getAttribute("position");
        console.log(
          "focus camera to position:" + JSON.stringify(targetPosition)
        );
        cams[0].setAttribute("position", targetPosition);
        window.location.hash = url;
      } else {
        console.log("#id or a-camera is not defined");
      }
    } else {
      // normal hyper link
      if (target) {
        var animation = "";
        var exitAnimation = null;
        console.log("target to " + target);
        if (target.indexOf("#") >= 0) {
          var li = target.split("#");
          target = li[0];
          animation = li[1];
          console.log("target to " + target + " & animate " + animation);
        }
        switch (target) {
          case "_blank":
            if (animation) {
              exitAnimation = document.getElementById(animation);
              exitAnimation.addEventListener(
                "animationend",
                function animationendHandler() {
                  exitAnimation.removeEventListener(
                    "animationend",
                    animationendHandler
                  );
                  window.open(url);
                }
              );
              this.el.emit("href");
            } else {
              window.open(url);
            }
            break;
          case "window":
          default:
            if (animation) {
              exitAnimation = document.getElementById(animation);
              exitAnimation.addEventListener(
                "animationend",
                function animationendHandler() {
                  exitAnimation.removeEventListener(
                    "animationend",
                    animationendHandler
                  );
                  window.location.href = url;
                }
              );
              this.el.emit("href");
            } else {
              window.location.href = url;
            }
            break;
        }
      } else {
        window.location.href = url;
      }
    }
  },

  /**
   * Called once when component is attached. Generally for initial setup.
   */
  init: function () {
    this.boundClickHandler = this.clickHandler.bind(this);

    this.pointer = new THREE.Vector2();
    this.prevMousePos = { x: this.pointer.x, y: this.pointer.y };

    this.el.addEventListener("mousedown", () => {
      this.prevMousePos = { x: this.pointer.x, y: this.pointer.y };
    });

    document.addEventListener("pointermove", (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    this.el.addEventListener("mouseup", () => {
      if (
        this.prevMousePos.x === this.pointer.x &&
        this.prevMousePos.y === this.pointer.y
      ) {
        this.boundClickHandler();
      }
    });

    if (this.data.shrinkAvatars === !0) {
      this.pos = new THREE.Vector3();
      this.dir = new THREE.Vector3();
      this.withinDis = !1;
      let manager = document.querySelector("#avatar-manager");
      if (!manager) {
        manager = document.createElement("a-entity");
        manager.id = "avatar-manager";
        manager.setAttribute("avatar-manager", "");
        this.el.sceneEl.appendChild(manager);
      }
    }
  },

  update: function () {
    if (this.data.shrinkAvatars === !0) {
      this.el.object3D.getWorldPosition(this.pos);
      this.el.object3D.getWorldDirection(this.dir);
      this.front = this.pos.sub(this.dir);
    }
  },

  tick: function () {
    if (this.data.shrinkAvatars === !0) {
      this.el.object3D.getWorldPosition(this.pos);
      this.el.object3D.getWorldDirection(this.dir);
      this.front = this.pos.sub(this.dir);
      let manager = document.querySelector("#avatar-manager");
      let pos = new THREE.Vector3();
      manager.objects.forEach((user, index) => {
        let obj = manager.userObjects[index].object3D;
        obj.getWorldPosition(pos);
        let dis = pos.distanceTo(this.front);
        if (dis < 4) {
          if (this.withinDis === !1) {
            this.shrinkTimeout = setTimeout(() => {
              obj.visible = false;
              if (manager.objects[index]) {
                manager.objects[index].visible = true;
              }
            }, this.data.shrinkDelay);
            if (manager.objects[index])
              manager.objects[index].position.set(pos.x, pos.y, pos.z);
            this.withinDis = !0;
          }
        } else {
          manager.objects[index].visible = false;
          obj.visible = true;
          clearTimeout(this.shrinkTimeout);
          this.withinDis = !1;
        }
      });
    }
  },

  /**
   * Called when a component is removed (e.g., via removeAttribute).
   * Generally undoes all modifications to the entity.
   */
  remove: function () {
    this.el.removeEventListener("click", this.boundClickHandler);
  },
});

AFRAME.registerComponent("avatar-manager", {
  init: function () {
    this.el.objects = [];
    this.el.userObjects = [];
  },
  tick: function () {
    this.objects = this.el.objects;
    let users = document.querySelectorAll("#player-body");
    this.el.userObjects = users;
    if (this.objects.length < users.length) {
      for (let i = this.objects.length; i < users.length; i++) {
        let geo = new THREE.SphereGeometry(0.05, 5, 5);
        users[i].object3D.children.length < 2
          ? (this.color = users[i].object3D.children[0].material.color)
          : (this.color =
              users[i].object3D.children[0].children[0].material.color);
        users[i].color = this.color;
        let mat = new THREE.MeshBasicMaterial({ color: this.color });
        let mesh = new THREE.Mesh(geo, mat);
        mesh.visible = false;
        this.objects.push(mesh);
        this.el.sceneEl.object3D.add(this.objects[this.objects.length - 1]);
        this.el.objects = this.objects;
      }
    }
    if (this.objects.length > users.length) {
      for (let i = 0; i < this.objects.length; i++) {
        users[i].object3D.children.length < 2
          ? (this.userColor = users[i].object3D.children[0].material.color)
          : (this.userColor =
              users[i].object3D.children[0].children[0].material.color);
        if (
          this.userColor.r !== this.objects[i].r &&
          this.userColor.g !== this.objects[i].g &&
          this.userColor.b !== this.objects[i].b
        ) {
          this.objects.splice(i, 1);
        }
      }
    }
  },
});
