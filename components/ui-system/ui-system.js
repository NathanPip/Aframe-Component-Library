AFRAME.registerSystem('ui-system', {
    schema: {
        chatEnabled: {default: true},
        voiceEnabled: {default: true},
        iconPath: {default: '/'},
        chatIcon: {default: 'chat-svg'},
        voiceIcon: {default: 'microphone-svg'},
        infoIcon: {default: null},
        settingsIcon: {default: null}
    },

    init: function () {
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

      if(this.data.voiceEnabled) {
        this.createVoice();
      }   

      if(this.data.chatEnabled) {
        this.createChat();
      }

      this.uiBar.appendChild(this.infoBtnGroup);
      this.uiBar.appendChild(this.utilBtnGroup);
      this.uiBar.appendChild(this.supportBtnGroup);

      this.uiContainer.appendChild(this.uiBar);

      document.body.appendChild(this.uiContainer);

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

    createChat: function() {
      this.chatButton = document.createElement("button");
      this.chatButton.setAttribute("class", "ui-btn chat");
      this.utilBtnGroup.appendChild(this.chatButton);

      this.chatBox = document.createElement("div");
      this.chatBox.setAttribute("class", "box chat-box");

      const chat = document.createElement("div");
      chat.setAttribute("class", "chat");

      const inputGroup = document.createElement("div");
      inputGroup.setAttribute("class", "input-group");

      const input = document.createElement("textarea");
      input.setAttribute("class", "chat-input");
      input.placeholder = "send chat";

      const sendBtn = document.createElement("button");
      sendBtn.setAttribute("class", "send-chat");
      sendBtn.innerText = "Send";

      this.chatBox.appendChild(chat);
      this.chatBox.appendChild(inputGroup);
      inputGroup.appendChild(input)
      inputGroup.appendChild(sendBtn);

      this.chatOpen = false;

      
      this.utilBtnGroup.appendChild(this.chatButton);
      this.uiContainer.appendChild(this.chatBox);

      this.chatButton.addEventListener("click", () => {
        this.hideElement(this.chatBox, this.chatOpen)
        this.chatOpen = !this.chatOpen;
      });
    },

    createVoice: function() {
      this.voiceBtn = document.createElement("button");
      this.voiceBtn.setAttribute("class", "ui-btn mic");

      this.utilBtnGroup.appendChild(this.voiceBtn);
    },

    createSettings: function() {
      this.settingsButton = document.createElement("button");
      this.settingsButton.setAttribute("class", "ui-btn settings");

      this.settingsBox = document.createElement("div");
      this.settingsBox.setAttribute("class", "box settings-box");

      this.settingsOpen = false;

      
      this.supportBtnGroup.appendChild(this.settingsButton);
      this.uiContainer.appendChild(this.settingsBox);

      this.settingsButton.addEventListener("click", () => {
        this.hideElement(this.settingsBox, this.settingsOpen)
        this.settingsOpen = !this.settingsOpen;
      });
    },

    hideElement: function(element, isOpen) {
      if(isOpen) {
        element.style = "display: none;"
      } else {
        element.style = "display: flex;"
      }
    },

    bindHandlers: function () {
      this.hideElement = this.hideElement.bind(this);
    }
});
