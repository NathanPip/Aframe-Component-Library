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
      const uiContainer = document.createElement("div");
      uiContainer.setAttribute("class", "ui-container");

      const infoBtnGroup = document.createElement("div");
      infoBtnGroup.setAttribute("class", "info-btn-group");

      const infoBtn = document.createElement("button");
      infoBtn.setAttribute("class", "info-btn");
      infoBtn.style.backgroundImage = iconPath

      const utilBtnGroup = document.createElement("div");
      utilBtnGroup.setAttribute("class", "util-btn-group");
      
      const supportBtnGroup = document.createElement("div");
      supportBtnGroup.setAttribute("class", "support-btn-group");
    },

    update: function () {
      // Do something when component's data is updated.
    },

    remove: function () {
      // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
    }
});
