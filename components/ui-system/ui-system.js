AFRAME.registerSystem("ui-system", {
  schema: {
    enabled: { default: true },
    chatEnabled: { default: true },
    voiceEnabled: { default: true },
    infoIcon: { default: null },
    settingsIcon: { default: null },
    isNetworked: { default: false },
  },

  firstInit: function () {
    this.bindHandlers();

    this.uiContainer = document.createElement("div");
    this.uiContainer.setAttribute("class", "ui-container");

    this.uiBar = document.createElement("div");
    this.uiBar.setAttribute("class", "bar");

    this.infoBtnGroup = document.createElement("div");
    this.infoBtnGroup.setAttribute("class", "info-btn-group");

    const infoBtn = document.createElement("button");
    infoBtn.setAttribute("class", "info-btn");

    this.utilBtnGroup = document.createElement("div");
    this.utilBtnGroup.setAttribute("class", "util-btn-group");

    this.supportBtnGroup = document.createElement("div");
    this.supportBtnGroup.setAttribute("class", "support-btn-group");

    this.createSettings();

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
    this.utilBtnGroup.appendChild(this.chatButton);

    this.chatBox = document.createElement("div");
    this.chatBox.setAttribute("class", "box chat-box");

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

    this.chatInput.addEventListener("keydown", (e) => {
      if (e.code === "Enter") {
        if(!e.shiftKey){
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

    NAF.connection.adapter.easyrtc.enableMicrophone(true);

    this.utilBtnGroup.appendChild(this.voiceBtn);

    this.voiceBtn.addEventListener("click", this.toggleVoice);
  },

  createSettings: function () {
    this.settingsButton = document.createElement("button");
    this.settingsButton.setAttribute("class", "ui-btn settings");

    this.settingsBox = document.createElement("div");
    this.settingsBox.setAttribute("class", "box settings-box");

    this.settingsOpen = false;

    this.supportBtnGroup.appendChild(this.settingsButton);
    this.uiContainer.appendChild(this.settingsBox);

    this.settingsButton.addEventListener("click", () => {
      this.hideElement(this.settingsBox, this.settingsOpen);
      this.settingsOpen = !this.settingsOpen;
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
