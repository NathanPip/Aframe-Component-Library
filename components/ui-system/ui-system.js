// returns a new settings item elements with a label and element attatched
const createSettingsItem = (settingsName, element) => {
  const settingsItem = document.createElement("div");
  settingsItem.setAttribute("class", `settings-item ${settingsName}-item`);
  const itemTitle = document.createElement("label");
  itemTitle.setAttribute("class", `settings-item-title ${settingsName}-item-title}`);
  itemTitle.innerText = settingsName;
  settingsItem.appendChild(itemTitle);
  settingsItem.appendChild(element);
  return settingsItem;
};

//hides dom elements
const hideElement = (element, isOpen) => {
  if (isOpen) {
    element.style = "display: none;";
  } else {
    element.style = "display: flex;";
  }
};

AFRAME.registerComponent("ui-system", {
  schema: {
    enabled: { default: true },
    waitForLoad: { default: true },
    chatEnabled: { default: true },
    voiceEnabled: { default: true },
    settingsEnabled: { default: true },
    infoIcon: { default: null },
    settingsIcon: { default: null },
    isNetworked: { default: false },
  },

  //runs when component is intitialized
  //if there is no loading screen run initialize() after timeout
  init: function () {
    this.initialize = this.initialize.bind(this);
    if (this.data.waitForLoad === false) {
      setTimeout(() => {
        this.initialize();
      }, 10);
    }
  },

  //initializes UI system and settings
  initialize: function () {
    /////////////////////////////////// VARIABLES

    this.bindHandlers();
    if (!window.NAF) {
      console.log("scene is not networked");
      this.data.isNetworked = false;
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

    if (this.data.settingsEnabled) {
      this.createSettings();
    }

    this.createInfo();

    if (this.data.isNetworked && this.data.voiceEnabled) {
      this.createVoice();
    }

    if (this.data.isNetworked && this.data.chatEnabled) {
      this.createChat();
    }

    this.uiBar.appendChild(this.infoBtnGroup);
    this.uiBar.appendChild(this.utilBtnGroup);
    this.uiBar.appendChild(this.supportBtnGroup);

    this.uiContainer.appendChild(this.uiBar);
    if (this.data.enabled) document.body.appendChild(this.uiContainer);
  },

  ////////////////////////// START OF UI COMPONENT CREATION //

  // creates the chat component if the scene is networked
  createChat: function () {
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
  },

  createVoice: function () {
    this.voiceBtn = document.createElement("button");
    this.voiceBtn.setAttribute("class", "ui-btn mic on");
    this.voiceBtn.style.backgroundImage = "url(/assets/microphone-svg.svg)";

    NAF.connection.adapter.easyrtc.enableMicrophone(true);

    this.utilBtnGroup.appendChild(this.voiceBtn);

    this.voiceBtn.addEventListener("click", this.toggleVoice);
  },

  createInfo: function () {
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
    this.privacyLink.setAttribute("href", "https://www.termsfeed.com/live/dee69382-bfa3-403e-b74f-d0b681915514");
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
  },

  createSettings: function () {
    this.settingsButton = document.createElement("button");
    this.settingsButton.setAttribute("class", "ui-btn settings");
    this.settingsButton.style.backgroundImage = "url(/assets/settings-cogwheel-svgrepo-com.svg)";

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

    this.supportBtnGroup.appendChild(this.settingsButton);
    this.uiContainer.appendChild(this.settingsBox);

    this.settingsButton.addEventListener("click", () => {
      hideElement(this.settingsBox, this.settingsOpen);
      this.settingsOpen = !this.settingsOpen;
    });
    this.settingsClose.addEventListener("click", () => {
      hideElement(this.settingsBox, this.settingsOpen);
      this.settingsOpen = !this.settingsOpen;
    });
    this.settingsSetup();
  },

  settingsSetup: function () {
    let settings = this.el.getAttribute("settings");
    if (!settings) {
      return;
    }

    settings = settings.split(",");

    for (let i = 0; i < settings.length; i++) {
      settings[i] = settings[i].trim();
    }

    this.el.settings = {
      mute: false,
      volume: 0.8,
    };

    if (settings.includes("sound")) {
      this.muteToggle = document.createElement("input");
      this.muteToggle.setAttribute("class", "settings-input check settings-mute-input");
      this.muteToggle.type = "checkbox";
      const muteItem = createSettingsItem("mute", this.muteToggle);
      let toggleHandler = () => {
        this.el.settings.mute = !this.el.settings.mute;
      };
      toggleHandler = toggleHandler.bind(this);
      this.settingsList.appendChild(muteItem);
      this.muteToggle.addEventListener("click", toggleHandler);
    }

    if (settings.includes("sound")) {
      this.volumeSlider = document.createElement("input");
      this.volumeSlider.setAttribute("class", "settings-input slider settings-volume-input");
      this.volumeSlider.type = "range";
      this.volumeSlider.value = 80;
      const volumeItem = createSettingsItem("volume", this.volumeSlider);
      let toggleHandler = () => {
        this.el.settings.volume = this.volumeSlider.value / 100;
      };
      toggleHandler = toggleHandler.bind(this);
      this.settingsList.appendChild(volumeItem);
      this.volumeSlider.addEventListener("input", toggleHandler);
    }

    this.checkSettingsChange();
  },

  checkSettingsChange: function () {
    if (!this.el.settings) return;
    //initialize settings
    this.setSceneVolume(this.el.settings.volume);

    //check for settings changes
    let oldSettings = { ...this.el.settings };
    setInterval(() => {
      //copy settings into new object
      const settings = { ...this.el.settings };

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
  },

  toggleSceneMute: function () {
    if (this.el.settings.mute === true) {
      this.muteToggle.checked = true;
      this.setSceneVolume(0);
    } else {
      this.muteToggle.checked = false;
      this.setSceneVolume(this.el.settings.volume);
    }
  },

  setSceneVolume: function (volume) {
    let audios = document.querySelectorAll("audio");
    let videos = document.querySelectorAll("video");
    const audioListener = this.el.sceneEl.camera.children[0];
    if (audioListener) {
      audioListener.setMasterVolume(volume);
    }
    let sounds = [...audios, ...videos];
    for (let sound of sounds) {
      sound.volume = volume;
    }
  },

  toggleVoice: function () {
    const isOn = this.voiceBtn.classList.contains("on");
    console.log(isOn);
    if (isOn) {
      this.voiceBtn.classList.remove("on");
      this.voiceBtn.classList.add("off");
      NAF.connection.adapter.easyrtc.enableMicrophone(false);
    } else {
      this.voiceBtn.classList.remove("off");
      this.voiceBtn.classList.add("on");
      NAF.connection.adapter.easyrtc.enableMicrophone(true);
    }
  },

  sendMessage: function () {
    const value = this.chatInput.value;
    if (value.length > 0) {
      const message = document.createElement("p");
      message.innerText = value;
      this.chat.appendChild(message);
      this.chatInput.value = "";
      NAF.connection.broadcastData("chat", { txt: value });
    }
  },

  messageSubscribe: function (senderId, dataType, data, targetId) {
    const message = document.createElement("p");
    message.innerText = data.txt;
    this.chat.appendChild(message);
  },

  bindHandlers: function () {
    this.toggleSceneMute = this.toggleSceneMute.bind(this);
    this.toggleVoice = this.toggleVoice.bind(this);
    this.messageSubscribe = this.messageSubscribe.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  },
});

function onConnect() {
  document.querySelector("a-scene").systems["ui-system"].initialize();
}
