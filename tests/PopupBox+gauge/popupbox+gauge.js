/*-------------- POPUP -----------------*/
function createPopup(id) {
    let popupNode = document.querySelector(id);

    let overlay = popupNode.querySelector(".overlay");
    let closeBtn = popupNode.querySelector(".close-btn");

    function openPopup() {
        popupNode.classList.add("active");
    }
    function closePopup() {
        popupNode.classList.remove("active");
    }
    overlay.addEventListener("click", closePopup);
    closeBtn.addEventListener("click", closePopup);
    return openPopup;
}

let popup = createPopup ("#popup");
document.querySelector("#open-popup").addEventListener("click",popup);

/*--------------   GAUGES CSS ------------*/
const gaugeVoltage = document.querySelector("#voltage");
const gaugeCurrent = document.querySelector("#current");

function setGauge(gauge, value, max_value, reading_type) {
  if (value < 0 || value > max_value) {
    return;
  }

  gauge.querySelector(".gauge__fill").style.transform = `rotate(${
    value / (max_value * 2)
  }turn)`;
  gauge.querySelector(".gauge__cover").textContent = `${Math.round(
    value * 1
  )} ${reading_type}`;
}


setGauge(gaugeVoltage, 100, 150, "V");
setGauge(gaugeCurrent, 10, 20, "A");