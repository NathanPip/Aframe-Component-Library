// ----------------------------------------------------------------START OF HELPERS ----------------------------------------------------------------

function delay(milisec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, milisec);
  });
}

function hexStringToHexInt(str) {
  return Number(`0x${str.substring(1)}`);
}

//hides dom elements
const hideElement = (element, isOpen) => {
  if (isOpen) {
    element.style = "display: none;";
  } else {
    element.style = "display: flex;";
  }
};

// ----------------------------------------------------------------END OF HELPERS ----------------------------------------------------------------

// ----------------------------------------------------------------START OF lOAD SYSTEM ----------------------------------------------------------------

// Loading Screen Class
// Creates a new THREE js scene for loading which is displayed over top the AFRAME Scene
class LoadScreen {
  constructor(
    mainScene,
    enabled,
    clickToStart,
    bgColor,
    backlightColor,
    forelightColor,
    ambientColor
  ) {
    this.mainScene = mainScene;
    this.enabled = enabled ? enabled : true;
    this.clickToStart = clickToStart ? clickToStart : true;
    this.loaderScene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.0005,
      10000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.clock = new THREE.Clock();
    this.bgColor = bgColor ? hexStringToHexInt(bgColor) : 0x000000;
    this.backlightColor = backlightColor
      ? hexStringToHexInt(backlightColor)
      : 0x0000ff;
    this.forelightColor = forelightColor
      ? hexStringToHexInt(forelightColor)
      : 0xffffff;
    this.ambientColor = ambientColor
      ? hexStringToHexInt(ambientColor)
      : 0xffffff;
    this.titleCreated;
    this.init();
  }

  // initializes the loading scene
  init() {
    this.loaded = this.loaded.bind(this);
    this.remove = this.remove.bind(this);
    this.resize = this.resize.bind(this);

    this.mainScene.style.display = "none";

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.renderer.domElement.classList.add("loading-scene");
    this.renderer.domElement.style.zIndex = 1;
    this.renderer.domElement.style.position = "fixed";
    this.renderer.domElement.style.top = 0;
    this.renderer.domElement.style.left = 0;
    document.body.appendChild(this.renderer.domElement);

    this.loaderScene.add(this.camera);
    this.loaderScene.background = new THREE.Color(this.bgColor);

    const ambient = new THREE.AmbientLight(this.ambientColor, 0.5);
    this.loaderScene.add(ambient);

    const pointLight = new THREE.PointLight(this.forelightColor, 5, 100);
    pointLight.position.set(-20, 10, -50);
    this.loaderScene.add(pointLight);

    const pointLight2 = new THREE.PointLight(this.backlightColor, 5, 100);
    pointLight2.position.set(0, 10, -70);
    this.loaderScene.add(pointLight2);

    const pointLight1 = new THREE.PointLight(this.forelightColor, 5, 100);
    pointLight1.position.set(20, 10, -50);
    this.loaderScene.add(pointLight1);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xfffff,
      roughness: 0.15,
      metalness: 1,
    });
    this.torusKnot = new THREE.Mesh(geometry, material);

    this.loaderScene.add(this.torusKnot);
    this.torusKnot.position.z = -60;

    this.createTitle();
    this.render();
    window.addEventListener("resize", this.resize);
    window.addEventListener("scene-loaded", this.loaded);
  }

  // when the window is resized
  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // main render loop
  render() {
    this.renderer.setAnimationLoop(() => {
      let time = this.clock.getElapsedTime();
      this.torusKnot.rotation.y = 0.5 * time;
      this.renderer.render(this.loaderScene, this.camera);
    });
  }

  // removes the loading scene and canvas element from the document
  remove() {
    if (this.titleCreated === true) {
      removeEventListener("click", this.remove);
      removeEventListener("keydown", this.remove);
      this.titleBackground.classList.add("exit");
      setTimeout(() => this.titleBackground.remove(), 1500);
    }
    const mainScene = document.querySelector("a-scene");
    mainScene.style = "display: block;";
    console.log("removed");
    const sceneEl = this.renderer.domElement;
    sceneEl.remove();
    const loadingRemoved = new CustomEvent("loadingRemoved");
    window.dispatchEvent(loadingRemoved);
  }

  // called when scene has loaded
  loaded() {
    if (this.clickToStart && this.titleCreated === true) {
      this.clickStartEl.style.opacity = 1;
      addEventListener("click", this.remove);
      addEventListener("keydown", this.remove);
    } else {
      this.remove();
    }
  }

  // creates title and 2d elements for load screen
  createTitle() {
    this.titleBackground = document.createElement("div");
    this.titleBackground.classList.add("loading-screen");
    const title = document.createElement("h1");
    title.innerHTML = document.title;
    this.clickStartEl = document.createElement("h2");
    this.clickStartEl.innerText = "Interact to Start";
    this.titleBackground.appendChild(title);
    this.titleBackground.appendChild(this.clickStartEl);
    document.body.appendChild(this.titleBackground);
    this.titleCreated = true;
  }
}

AFRAME.registerSystem("loading-manager", {
  schema: {
    enabled: { default: true },
    loadScreenEnabled: { default: true },
    clickToStart: { default: true },
    loadSelf: { default: true },
    bgColor: { default: null },
    ambientColor: { default: null },
    backlightColor: { default: null },
    forelightColor: { default: null },
  },

  init: function () {
    if (!this.data.enabled) {
      return;
    }
    this.loaded = this.loaded.bind(this);
    if (this.data.loadScreenEnabled)
      this.Load = new LoadScreen(
        this.el,
        this.data.loadScreenEnabled,
        this.data.clickToStart,
        this.data.bgColor,
        this.data.backlightColor,
        this.data.forelightColor,
        this.data.ambientColor
      );
    this.el.addEventListener("loaded", this.loaded);
  },

  loaded: function () {
    console.log("loaded");
    setTimeout(() => {
      this.loadStart();
    }, 10);
  },

  loadStart: async function () {
    this.elPreloadEvents = [];
    this.elPostLoadEvents = [];
    this.elLoadEvents = [];
    this.preLoad();
    try {
      await callElementLoadFunctions(this.el);
      await delay(2000);
    } catch (err) {
      console.log("async load failed");
      console.log(err);
    }
    this.postLoad();
    console.log("load emmitted");
    window.dispatchEvent(this.loadedEvent);
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
    callElementPreLoadFunctions(this.el);
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
        if (el.components[comp].postLoad) {
          el.components[comp].postLoad();
          console.log(el.components[comp]);
        }
      }
    }
  }
};

// ----------------------------------------------------------------END OF lOAD SYSTEM ----------------------------------------------------------------

// ---------------------------------------------------------------- THE VOID BETWEEN ----------------------------------------------------------------

// ----------------------------------------------------------------START OF UI AND SETTINGS SYSTEM ----------------------------------------------------------------

// returns a new settings item elements with a label and element attatched
const createSettingsItem = (settingsName, element) => {
  const settingsItem = document.createElement("div");
  settingsItem.setAttribute("class", `settings-item ${settingsName}-item`);
  const itemTitle = document.createElement("label");
  itemTitle.setAttribute(
    "class",
    `settings-item-title ${settingsName}-item-title}`
  );
  itemTitle.innerText = settingsName;
  settingsItem.appendChild(itemTitle);
  settingsItem.appendChild(element);
  return settingsItem;
};

class UISystem {
  constructor() {
    // get element to initalize ui screen
    this.el = document.querySelector("artfx-systems");
    if (!this.el) return;

    //Aframe scene element
    this.sceneEl = document.querySelector("a-scene");
    //object of settings for initialization of ui system
    this.systemSettings = {};
    //parsed object of preference settings the user can adjust
    this.enabledPreferences = {};

    //inital settings for the scene
    this.el.settings = {
      mute: false,
      volume: 0.8,
    };

    //initialize function after load or wait after 10 millisecond timeout
    this.Init = this.Init.bind(this);
    const waitForLoad = this.el.getAttribute("wait-for-load");
    if (waitForLoad !== "false") {
      this.sceneEl = document.querySelector("a-scene");
      addEventListener("loadingRemoved", this.Init);
    } else {
      setTimeout(this.Init, 10);
    }
  }
  Init() {
    // intial system settings
    const initalSettings = {
      enabled: true,
      settingsEnabled: true,
      isNetworked: false,
      chatEnabled: true,
      voiceEnabled: true,
    };

    //initiate system settings object
    this.systemSettings = this.parseSystemSettings(
      this.el.getAttribute("settings"),
      initalSettings
    );
    this.enabledPreferences = this.parsePreferences(
      this.el.getAttribute("preferences")
    );

    console.log(this.systemSettings.isNetworked);

    this.bindHandlers();
    if (!window.NAF) {
      console.log("scene is not networked");
      this.isNetworked = false;
    } else if (this.systemSettings.isNetworked === true) {
      this.isNetworked = true;
    }

    this.uiContainer = document.createElement("div");
    this.uiContainer.setAttribute("class", "ui-container");

    this.uiBar = document.createElement("div");
    this.uiBar.setAttribute("class", "bar");

    this.infoBtnGroup = document.createElement("div");
    this.infoBtnGroup.setAttribute("class", "info-btn-group");

    this.utilBtnGroup = document.createElement("div");
    this.utilBtnGroup.setAttribute("class", "util-btn-group");

    this.supportBtnGroup = document.createElement("div");
    this.supportBtnGroup.setAttribute("class", "support-btn-group");

    if (this.enabledPreferences !== null) {
      this.createSettings();
    } 
    if(this.systemSettings.settingsEnabled){
      this.checkSettingsChange();
    }

    this.createInfo();
    if (this.isNetworked) {
      if (NAF.connection.adapter.easyrtc) {
        this.adapter = NAF.connection.adapter.easyrtc;
      } else {
        console.log(NAF.connection);
        this.adapter = NAF.connection.adapter;
      }
      if (this.systemSettings.voiceEnabled) {
        this.createVoice();
      }
      if (this.systemSettings.chatEnabled) {
        this.createChat();
      }
    }

    this.uiBar.appendChild(this.infoBtnGroup);
    this.uiBar.appendChild(this.utilBtnGroup);
    this.uiBar.appendChild(this.supportBtnGroup);

    this.uiContainer.appendChild(this.uiBar);
    if (this.systemSettings !== false)
      this.sceneEl.appendChild(this.uiContainer);
  }

  createChat() {
    this.chatButton = document.createElement("button");
    this.chatButton.setAttribute("class", "ui-btn chat");

    // hard coded icon
    this.chatButton.style.backgroundImage = "url(/assets/chat-svg.svg)";

    this.utilBtnGroup.appendChild(this.chatButton);

    this.chatBox = document.createElement("div");
    this.chatBox.setAttribute("class", "box chat-box");

    this.chatClose = document.createElement("button");
    this.chatClose.setAttribute("class", "close-btn");
    this.chatClose.innerText = "X";
    this.chatBox.appendChild(this.chatClose);

    this.chat = document.createElement("div");
    this.chat.setAttribute("class", "chat");

    const inputGroup = document.createElement("div");
    inputGroup.setAttribute("class", "input-group");

    this.chatInput = document.createElement("textarea");
    this.chatInput.setAttribute("class", "chat-input");
    this.chatInput.placeholder = "send chat";

    const sendBtn = document.createElement("button");
    sendBtn.setAttribute("class", "btn send-chat");
    sendBtn.innerText = "Send";

    this.chatBox.appendChild(this.chat);
    this.chatBox.appendChild(inputGroup);
    inputGroup.appendChild(this.chatInput);
    inputGroup.appendChild(sendBtn);

    // whether chat is open or closed
    this.chatOpen = false;

    this.utilBtnGroup.appendChild(this.chatButton);
    this.uiContainer.appendChild(this.chatBox);

    this.chatButton.addEventListener("click", () => {
      hideElement(this.chatBox, this.chatOpen);
      this.chatOpen = !this.chatOpen;
    });
    this.chatClose.addEventListener("click", () => {
      hideElement(this.chatBox, this.chatOpen);
      this.chatOpen = !this.chatOpen;
    });

    this.chatInput.addEventListener("keydown", (e) => {
      if (e.code === "Enter") {
        if (!e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      }
    });

    sendBtn.addEventListener("click", this.sendMessage);

    NAF.connection.subscribeToDataChannel("chat", this.messageSubscribe);
  }
  createVoice() {
    this.voiceBtn = document.createElement("button");
    this.voiceBtn.setAttribute("class", "ui-btn mic on");
    this.voiceBtn.style.backgroundImage = "url(/assets/microphone-svg.svg)";

    this.adapter.enableMicrophone(true);

    this.utilBtnGroup.appendChild(this.voiceBtn);

    this.voiceBtn.addEventListener("click", this.toggleVoice);
  }
  createInfo() {
    this.infoBtn = document.createElement("button");
    this.infoBtn.setAttribute("class", "ui-btn info");
    this.infoBtn.style.backgroundImage = "url(/assets/Artfx_ICON_Square.png)";

    this.infoBtnGroup.appendChild(this.infoBtn);

    this.infoBox = document.createElement("div");
    this.infoBox.setAttribute("class", "box info-box");

    this.uiContainer.appendChild(this.infoBox);

    this.infoOpen = false;

    this.infoList = document.createElement("ul");
    this.infoList.setAttribute("class", "info-list");

    const customButtons = this.el.getAttribute("info-buttons");
    if (customButtons) {
      let buttonsArr = customButtons.split(";");
      buttonsArr = buttonsArr.map((button) => {
        if (button.length) {
          button = button.split(",");
          for (let i = 0; i < button.length; i++) {
            button[i] = button[i].trim();
          }
          const listItem = document.createElement("li");
          listItem.classList.add("info-item");
          if (button[1] && button[1] !== "null") {
            listItem.classList.add(button[1]);
          }
          if (button[2]) {
            const link = document.createElement("a");
            link.href = button[2];
            link.target = "_blank";
            link.innerText = button[0];
            link.classList.add("info-link");
            listItem.appendChild(link);
          } else {
            const btn = document.createElement("button");
            btn.innerText = button[0];
            listItem.appendChild(btn);
          }
          return listItem;
        }
        return null;
      });
      for (let item of buttonsArr) {
        if (item !== null) {
          this.infoList.appendChild(item);
        }
      }
    }

    this.tosItem = document.createElement("li");
    this.tosLink = document.createElement("a");
    this.tosItem.setAttribute("class", "info-item");
    this.tosLink.setAttribute("href", "https://artfx.info/tos.html");
    this.tosLink.setAttribute("class", "item-link");
    this.tosLink.setAttribute("target", "_blank");
    this.tosLink.innerText = "Terms of Service";
    this.tosItem.appendChild(this.tosLink);

    this.privacyItem = document.createElement("li");
    this.privacyLink = document.createElement("a");
    this.privacyItem.setAttribute("class", "info-item");
    this.privacyLink.setAttribute(
      "href",
      "https://www.termsfeed.com/live/dee69382-bfa3-403e-b74f-d0b681915514"
    );
    this.privacyLink.setAttribute("class", "item-link");
    this.privacyLink.setAttribute("target", "_blank");
    this.privacyLink.innerText = "Privacy";
    this.privacyItem.appendChild(this.privacyLink);

    this.infoList.appendChild(this.tosItem);
    this.infoList.appendChild(this.privacyItem);
    this.infoBox.appendChild(this.infoList);

    this.infoBtn.addEventListener("click", () => {
      hideElement(this.infoBox, this.infoOpen);
      this.infoOpen = !this.infoOpen;
    });
  }
  createSettings() {
    this.settingsButton = document.createElement("button");
    this.settingsButton.setAttribute("class", "ui-btn settings");
    this.settingsButton.style.backgroundImage =
      "url(/assets/settings-cogwheel-svgrepo-com.svg)";

    this.settingsBox = document.createElement("div");
    this.settingsBox.setAttribute("class", "box settings-box");

    this.settingsClose = document.createElement("button");
    this.settingsClose.setAttribute("class", "close-btn settings-close");
    this.settingsClose.innerText = "X";
    this.settingsBox.appendChild(this.settingsClose);

    this.settingsTitle = document.createElement("h2");
    this.settingsTitle.setAttribute("class", "settings-title");
    this.settingsTitle.innerText = "Preferences";
    this.settingsBox.appendChild(this.settingsTitle);

    this.settingsList = document.createElement("div");
    this.settingsList.setAttribute("class", "settings-list");
    this.settingsBox.appendChild(this.settingsList);

    this.settingsOpen = false;

    this.uiContainer.appendChild(this.settingsButton);
    this.uiContainer.appendChild(this.settingsBox);

    this.settingsButton.addEventListener("click", () => {
      hideElement(this.settingsBox, this.settingsOpen);
      this.settingsOpen = !this.settingsOpen;
    });
    this.settingsClose.addEventListener("click", () => {
      hideElement(this.settingsBox, this.settingsOpen);
      this.settingsOpen = !this.settingsOpen;
    });
    this.setupSettings();
  }
  setupSettings() {
    if (this.enabledPreferences.includes("sound")) {
      // settings slider for volume slider
      this.volumeSlider = document.createElement("input");
      this.volumeSlider.setAttribute(
        "class",
        "settings-input slider settings-volume-input"
      );
      this.volumeSlider.type = "range";
      this.volumeSlider.value = 80;
      const volumeItem = createSettingsItem("volume", this.volumeSlider);
      let volumeToggleHandler = () => {
        this.el.settings.volume = this.volumeSlider.value / 100;
      };
      volumeToggleHandler = volumeToggleHandler.bind(this);
      this.settingsList.appendChild(volumeItem);
      this.volumeSlider.addEventListener("input", volumeToggleHandler);

      // settings item for Mute toggle
      this.muteToggle = document.createElement("input");
      this.muteToggle.setAttribute(
        "class",
        "settings-input check settings-mute-input"
      );
      this.muteToggle.type = "checkbox";
      const muteItem = createSettingsItem("mute", this.muteToggle);
      let muteToggleHandler = () => {
        this.el.settings.mute = !this.el.settings.mute;
      };
      muteToggleHandler = muteToggleHandler.bind(this);
      this.settingsList.appendChild(muteItem);
      this.muteToggle.addEventListener("click", muteToggleHandler);
    }

  }
  checkSettingsChange() {
    if (!this.el.settings) return;
    const settingsEvent = new CustomEvent("settings-change");
    //initialize settings
    this.setSceneVolume(this.el.settings.volume);

    //check for settings changes
    let oldSettings = { ...this.el.settings };
    setInterval(() => {
      //copy settings into new object
      const settings = { ...this.el.settings };
      for (let key in settings) {
        if (settings[key] !== oldSettings[key]) {
          window.dispatchEvent(settingsEvent);
        }
      }
      //Compare settings values between old settings and new settings
      //mute seperated from volume logic as to not disable mute without adjusting the setting value
      if (settings.mute !== oldSettings.mute) {
        this.toggleSceneMute();
      }
      //volume logic only runs if mute is disabled
      if (!settings.mute) {
        if (settings.volume !== oldSettings.volume) {
          this.setSceneVolume(settings.volume);
        }
      }
      oldSettings = { ...settings };
    }, 25);
  }

  parsePreferences(string) {
    if (!string) return null;
    string = string.split(",");
    let settings = [];
    for (let item of string) {
      item = item.trim();
      settings.push(item);
    }
    return settings;
  }

  // gets settings from attribute on element and replaces default settings
  parseSystemSettings(string, initial) {
    const customSettings = this.createAttributeObjects(string);
    if (!customSettings) return null;
    for (let item in customSettings) {
      if (customSettings[item] === "true" || customSettings[item] === "false") {
        customSettings[item] = customSettings[item] === "true";
      }
      customSettings[item] =
        customSettings[item] === "null" ? null : customSettings[item];
      if (initial[item] !== undefined) {
        if (initial[item] !== customSettings[item]) {
          initial[item] = customSettings[item];
        }
      }
    }
    return initial;
  }

  setSceneVolume(volume) {
    let audios = document.querySelectorAll("audio");
    let videos = document.querySelectorAll("video");
    const audioListener = this.sceneEl.camera.children[0];
    if (audioListener) {
      audioListener.setMasterVolume(volume);
    }
    let sounds = [...audios, ...videos];
    for (let sound of sounds) {
      sound.volume = volume;
    }
  }

  toggleSceneMute() {
    if (this.el.settings.mute === true) {
      this.muteToggle.checked = true;
      this.setSceneVolume(0);
    } else {
      this.muteToggle.checked = false;
      this.setSceneVolume(this.el.settings.volume);
    }
  }

  toggleVoice() {
    const isOn = this.voiceBtn.classList.contains("on");
    console.log(isOn);
    if (isOn) {
      this.voiceBtn.classList.remove("on");
      this.voiceBtn.classList.add("off");
      this.adapter.enableMicrophone(false);
    } else {
      this.voiceBtn.classList.remove("off");
      this.voiceBtn.classList.add("on");
      this.adapter.enableMicrophone(true);
    }
  }

  messageSubscribe(senderId, dataType, data) {
    const message = document.createElement("p");
    const sender = document.createElement("span");
    message.classList.add("message");
    sender.classList.add("message-sender");

    sender.innerText = `${data.sender}:`;
    message.innerText += data.txt;
    message.appendChild(sender);
    this.chat.appendChild(message);
  }

  sendMessage() {
    const value = this.chatInput.value;
    if (value.length > 0) {
      const message = document.createElement("p");
      const sender = document.createElement("span");
      message.classList.add("message");
      sender.classList.add("message-sender");
      sender.innerText = `${NAF.clientId}:` || "me:";
      message.innerText += value;
      message.insertBefore(sender, message.firstChild);
      this.chat.appendChild(message);
      this.chatInput.value = "";
      NAF.connection.broadcastData("chat", {
        txt: value,
        sender: NAF.clientId || "NA",
      });
    }
  }

  createAttributeObjects(string) {
    if (!string) return null;
    console.log(string);
    string = string.split(";");
    let object = {};
    for (let item of string) {
      let values = item.split(":");
      if (!values) continue;
      values[0] = values[0].trim();
      if (!values[1]) continue;
      values[1] = values[1].trim();
      object[values[0]] = values[1];
    }
    console.log(object);
    return object;
  }

  bindHandlers() {
    this.toggleSceneMute = this.toggleSceneMute.bind(this);
    this.toggleVoice = this.toggleVoice.bind(this);
    this.messageSubscribe = this.messageSubscribe.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }
}


addEventListener("DOMContentLoaded", () => {
  const systemEl = document.querySelector("artfx-systems");
  if (systemEl) {
    systemEl["artfx-system"] = new UISystem();
  }
});
// ----------------------------------------------------------------END OF UI AND SETTINGS SYSTEM ----------------------------------------------------------------
