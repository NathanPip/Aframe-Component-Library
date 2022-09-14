function delay(milisec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, milisec);
  });
}

class LoadScreen {
  constructor(enabled, clickToStart) {
    this.enabled = enabled ? enabled : true;
    this.clickToStart = clickToStart ? clickToStart : true;
    this.loaderScene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.0005, 10000);
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.clock = new THREE.Clock();
    this.init = this.init.bind(this);
    setTimeout(this.init, 1);
  }

  init() {
    this.loaded = this.loaded.bind(this);
    this.remove = this.remove.bind(this);
    this.mainScene = document.querySelector("a-scene");
    this.mainScene.style.display = "none";
    this.mainScene.addEventListener("loaded", this.loaded)
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.renderer.domElement.classList.add("loading-scene");
    this.renderer.domElement.style.zIndex = -1;
    this.renderer.domElement.style.position = "fixed";
    this.renderer.domElement.style.top = 0;
    this.renderer.domElement.style.left = 0;
    document.body.appendChild(this.renderer.domElement);
    this.loaderScene.add(this.camera);
    this.loaderScene.background = new THREE.Color(0x000000);
    
    const ambient = new THREE.AmbientLight(0xffffff, .5);
    this.loaderScene.add(ambient);

    const pointLight = new THREE.PointLight(0xfffff, 5, 100);
    pointLight.position.set(-20, 10, -50)
    this.loaderScene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x0000ff, 5, 100);
    pointLight2.position.set(0, 10, -70)
    this.loaderScene.add(pointLight2);

    const pointLight1 = new THREE.PointLight(0xffffff, 5, 100);
    pointLight1.position.set(20, 10, -50)
    this.loaderScene.add(pointLight1);


    const geometry = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
    const material = new THREE.MeshStandardMaterial( { color: 0xfffff, roughness: .15, metalness: 1 } );
    this.torusKnot = new THREE.Mesh( geometry, material );

    this.loaderScene.add(this.torusKnot );
    this.torusKnot.position.z = -60;

    this.createTitle();

    this.render();
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.renderer.setAnimationLoop(() => {
      let time = this.clock.getElapsedTime();
      this.torusKnot.rotation.y = .5 * time;
      this.renderer.render(this.loaderScene, this.camera);
    })
  }

  remove() {
    this.mainScene.style.display = "block";
    removeEventListener("click", this.click);
    removeEventListener("keydown", this.keydown);
    this.titleBackground.classList.add("exit");
    const sceneEl = this.renderer.domElement
    setTimeout(() => {sceneEl.remove()}, 1600)
  }

  loaded() {
    if(this.clickToStart) {
    const clickToStart = document.querySelector(".loading-screen h2");
    clickToStart.style.opacity = 1;
    this.click = addEventListener("click", this.remove);
    this.keydown = addEventListener("keydown", this.remove);
    } else {
      this.remove();
    }
  }

  createTitle() {
    this.titleBackground = document.createElement("div");
    this.titleBackground.classList.add("loading-screen");
    const title = document.createElement("h1");
    title.innerHTML = document.title;
    const clickStart  = document.createElement("h2");
    clickStart.innerText = "Interact to Start";
    this.titleBackground.appendChild(title);
    this.titleBackground.appendChild(clickStart);
    document.body.appendChild(this.titleBackground);
  }
}
const loadScene = new LoadScreen();

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
