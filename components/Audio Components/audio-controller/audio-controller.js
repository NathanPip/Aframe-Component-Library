AFRAME.registerComponent("audio-controller", {
  schema: {
    src: { default: "#play-pause" },
    height: { default: 1 },
    position: {default: ""}
  },
  init: function () {
    this.el.setAttribute("visible", false);
    this.el.setAttribute("gltf-model", this.data.src);
  },

  postLoad: function () {
    const arr = getSceneObjects(this.el.object3D, [], "Mesh");
    const audio = getSceneObjects(this.el.object3D, [], "Audio")[0];
    console.log(audio);
    for (let mesh of arr) {
      mesh.position.y += this.data.height;
      let newEl = document.createElement("a-entity");
      let collider = document.createElement("a-box");
      collider.setAttribute("visible", false);
      collider.classList.add("clickable");
      newEl.appendChild(collider);
      newEl.classList.add(mesh.name);
      newEl.classList.add("clickable");
      newEl.object3D = mesh;
      this.el.appendChild(newEl);
      const el = this.el.querySelector(`.${mesh.name}`);
      if (mesh.name === "play") {
        el.firstChild.addEventListener("click", () => {
          audio.play();
          console.log("play");
        });
      } else {
        el.firstChild.addEventListener("click", () => {
          audio.pause();
          console.log("pause");
        });
      }
    }

    this.el.setAttribute("visible", true);
  },
  tick: function () {},
});

function getSceneObjects(group, meshArr, selector) {
  if (meshArr === undefined) {
    meshArr = [];
  }
  if (group.type === selector) {
    return group;
  }
  if (group.children) {
    for (let child of group.children) {
      console.log(child);
      if (child.type === selector) {
        meshArr.push(child);
      } else if (child.children.length > 0) {
        getSceneObjects(child, meshArr, selector);
      }
    }
  }
  return meshArr;
}
