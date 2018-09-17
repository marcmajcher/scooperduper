/* eslint-env browser */
/* eslint-disable no-console, no-magic-numbers */
/* globals MainLoop */

const numberDiv = document.getElementById('number');
const goupDiv = document.getElementById('goup');
// const timeDiv = document.getElementById('time');
const costDiv = document.getElementById('cost');
const startTime = new Date();

const adder = 1;
const multiplier = 1.15;
let number = 0;
let goup = 1; // per sec
let goupCost = 1;

function format(num, digits) {
  const pow = Math.pow(10, digits);
  let out = (Math.round(num * pow) / pow).toString();
  const dot = out.match(/\.(\d*)$/);
  if (dot !== null) {
    digits -= dot[1].length;
  }
  else {
    out += '.';
  }
  return out + '0'.repeat(digits);
}

costDiv.innerText = format(goupCost, 2);

function goUpFaster() {
  if (number >= goupCost * multiplier) {
    goup += adder;
    number -= goupCost;
    goupCost *= multiplier;
    costDiv.innerText = format(goupCost, 2);
  }
}

document.getElementById('faster').addEventListener('click', goUpFaster);

function update(delta) {
  const ms = delta / 1000;
  const toGoUp = goup * ms;
  number += toGoUp;
}

function draw(interpolationPercentage) {
  numberDiv.innerText = format(number, 2);
  goupDiv.innerText = goup;
}

function end(fps, panic) {
  // console.log('END', fps, panic);
}

MainLoop.setUpdate(update).setDraw(draw).setEnd(end).start();