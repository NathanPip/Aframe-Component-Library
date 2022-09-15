let streamElement = document.querySelector("#streaming-payments-container");
if(!streamElement){
  streamElement = document.createElement("div");
  streamElement.classList.add("streaming-payments-container");
  document.body.appendChild(streamElement);
}


function paymentsStartHandler(e) {
  let streamElement = document.querySelector("#streaming-payments-container");
  let txt = streamElement.querySelector("#streaming-txt");
  txt.innerText = "payments streaming";
  streamElement.style.animation = "fadeIn .5s forwards";
  streamElement.style.display = "flex";
}

function paymentsEndHandler(e) {
  let streamElement = document.querySelector("#streaming-payments-container");
  let txt = streamElement.querySelector("#streaming-txt");
  txt.innerText = "payments streaming stopped";
  streamElement.style.animation = "fadeIn .5s reverse forwards";
  setTimeout(() => {
    streamElement.style.display = "none";
  }, 500);
}

if (document.monetization) {
  document.monetization.addEventListener("monetizationstart", paymentsStartHandler);

  document.monetization.addEventListener("monetizationstop", paymentsEndHandler);
}

AFRAME.registerComponent("streaming-animation", {
  init: function () {
    if(!document.monetization) return;
    this.el.setAttribute("visible", true);
    document.monetization.addEventListener("monetizationstart", () => {
      this.el.setAttribute("visible", true);
    });
    document.monetization.addEventListener("monetizationstop", () => {
      this.el.setAttribute("visible", false);
    });
  },
});


