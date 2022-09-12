function delay(milisec) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("");
    }, milisec);
  });
}

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
