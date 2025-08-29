// Replace with ESP32 local IP
let ESP32_IP = 'http://192.168.1.100';
let connected = false;

const statusText = document.getElementById("status");
const connectBtn = document.getElementById("connectBtn");
const stick = document.getElementById("stick");
const joystick = document.getElementById("joystick");
const speedSlider = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");

let offsetX = 0, offsetY = 0;

function sendCommand(cmd, speed){
  if(!connected) return;
  fetch(ESP32_IP + "/" + cmd + "?speed=" + speed)
    .then(res => console.log(cmd + " at speed " + speed))
    .catch(err => console.error(err));
}

connectBtn.addEventListener("click", () => {
  // Test connection by sending a simple request
  fetch(ESP32_IP + "/S")
    .then(() => {
      connected = true;
      statusText.innerText = "Status: Connected";
    })
    .catch(() => {
      connected = false;
      statusText.innerText = "Status: Connection Failed";
    });
});

speedSlider.addEventListener("input", () => {
  speedValue.innerText = speedSlider.value;
});

joystick.addEventListener("pointerdown", startDrag);
joystick.addEventListener("pointermove", drag);
joystick.addEventListener("pointerup", endDrag);
joystick.addEventListener("pointerleave", endDrag);

function startDrag(e){
  e.preventDefault();
  offsetX = e.offsetX - stick.offsetLeft;
  offsetY = e.offsetY - stick.offsetTop;
}

function drag(e){
  if(!connected || e.buttons !== 1) return;

  let x = e.offsetX - offsetX;
  let y = e.offsetY - offsetY;

  const radius = 70;
  const dx = x - radius;
  const dy = y - radius;
  const distance = Math.sqrt(dx*dx + dy*dy);
  if(distance > radius){
    x = radius + dx/distance*radius;
    y = radius + dy/distance*radius;
  }

  stick.style.left = x + "px";
  stick.style.top = y + "px";

  const threshold = 20;
  const speed = speedSlider.value;

  if(Math.abs(dx) < threshold && dy < -threshold) sendCommand('F', speed);
  else if(Math.abs(dx) < threshold && dy > threshold) sendCommand('B', speed);
  else if(dx < -threshold && Math.abs(dy) < threshold) sendCommand('L', speed);
  else if(dx > threshold && Math.abs(dy) < threshold) sendCommand('R', speed);
  else sendCommand('S', 0);
}

function endDrag(e){
  stick.style.left = "70px";
  stick.style.top = "70px";
  sendCommand('S', 0);
}
