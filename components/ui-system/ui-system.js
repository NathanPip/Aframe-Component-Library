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

  init: function () {
    this.initialize = this.initialize.bind(this);
    if (this.data.waitForLoad === false) {
      setTimeout(() => {
        this.initialize();
      }, 10);
    }
  },

  initialize: function () {
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

  update: function () {
    // Do something when component's data is updated.
  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
  },

  createChat: function () {
    this.chatButton = document.createElement("button");
    this.chatButton.setAttribute("class", "ui-btn chat");
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

    this.chatOpen = false;

    this.utilBtnGroup.appendChild(this.chatButton);
    this.uiContainer.appendChild(this.chatBox);

    this.chatButton.addEventListener("click", () => {
      this.hideElement(this.chatBox, this.chatOpen);
      this.chatOpen = !this.chatOpen;
    });
    this.chatClose.addEventListener("click", () => {
      this.hideElement(this.chatBox, this.chatOpen);
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

  createSettings: function () {
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

    this.settingsOpen = false;

    this.supportBtnGroup.appendChild(this.settingsButton);
    this.uiContainer.appendChild(this.settingsBox);

    this.settingsButton.addEventListener("click", () => {
      this.hideElement(this.settingsBox, this.settingsOpen);
      this.settingsOpen = !this.settingsOpen;
    });
    this.settingsClose.addEventListener("click", () => {
      this.hideElement(this.settingsBox, this.settingsOpen);
      this.settingsOpen = !this.settingsOpen;
    });
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
      this.hideElement(this.infoBox, this.infoOpen);
      this.infoOpen = !this.infoOpen;
    });
  },

  hideElement: function (element, isOpen) {
    if (isOpen) {
      element.style = "display: none;";
    } else {
      element.style = "display: flex;";
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
    this.hideElement = this.hideElement.bind(this);
    this.toggleVoice = this.toggleVoice.bind(this);
    this.messageSubscribe = this.messageSubscribe.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  },
});

function onConnect() {
  document.querySelector("a-scene").systems["ui-system"].initialize();
}
