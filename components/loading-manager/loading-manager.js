function delay(milisec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, milisec);
  });
}

AFRAME.registerSystem('load-screen', {
  schema: {
    
  },

  init: function () {
    this.loaderScene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.0005, 10000);
    render = function () {
      this.el.renderer.render(this.loaderScene, this.camera);
    };
  
    this.loaderScene.background = new THREE.Color(backgroundColor);
    this.loaderScene.add(this.camera);
    const sceneEl = this.el;
    // Delay 200ms to avoid loader flashes.
    setTimeout(function () {
      if (sceneEl.hasLoaded) { return; }
      this.resize();
      window.addEventListener('resize', this.resize());
      sceneEl.renderer.setAnimationLoop(render);
    }, 200);
  },
  resize: function () {
    
  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
  }
});


AFRAME.registerComponent("loading-manager", {
  schema: {
    loadSelf: { default: true },
  },
  init: async function () {
    this.elPreloadEvents = [];
    this.elPostLoadEvents = [];
    this.elLoadEvents = [];
    this.preLoad();
    callElementPreLoadFunctions(this.el);

    await delay(3000);
    await callElementLoadFunctions(this.el);
    this.el.dispatchEvent(this.loadedEvent);
    this.postLoad();
  },

  preLoad: function () {
    this.loadedEvent = new Event("scene-loaded");
    if (this.data.loadSelf) {
      for (let comp in this.el.components) {
        if (
          this.el.components[comp].preLoad &&
          this.el.components[comp].attrName !== "loading-manager"
        )
          this.el.components[comp].preLoad();
      }
    }
  },

  postLoad: function () {
    if (this.data.loadSelf) {
      for (let comp in this.el.components) {
        if (
          this.el.components[comp].postLoad &&
          this.el.components[comp].attrName !== "loading-manager"
        )
          this.el.components[comp].postLoad();
      }
    }
    callElementPostLoadFunctions(this.el);
  },
});

const callElementLoadFunctions = async function (element) {
  const elements = element.children;
  for (let el of elements) {
    if (el.children) await callElementLoadFunctions(el);
    if (el.components) {
      for (let comp in el.components) {
        if (el.components[comp].load) await el.components[comp].load();
      }
    }
  }
  return;
};

const callElementPreLoadFunctions = function (element) {
  const elements = element.children;
  for (let el of elements) {
    if (el.children) callElementPreLoadFunctions(el);
    if (el.components) {
      for (let comp in el.components) {
        if (el.components[comp].preLoad) el.components[comp].preLoad();
      }
    }
  }
};
const callElementPostLoadFunctions = function (element) {
  const elements = element.children;
  for (let el of elements) {
    if (el.children) callElementPostLoadFunctions(el);
    if (el.components) {
      for (let comp in el.components) {
        if (el.components[comp].postLoad) el.components[comp].postLoad();
      }
    }
  }
};
