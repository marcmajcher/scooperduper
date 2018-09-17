/* eslint-env browser */
/* eslint-disable no-console, no-magic-numbers */
/* globals ScooperGame, MainLoop */

const multiplier = 1.15;
const game = new ScooperGame();

function format(num, digits) {
  const pow = Math.pow(10, digits);
  let out = (Math.round(num * pow) / pow).toString();
  const dot = out.match(/\.(\d*)$/);
  if (dot !== null) {
    digits -= dot[1].length;
  } else {
    out += '.';
  }
  return out + '0'.repeat(digits);
}

function el(id) {
  return document.getElementById(id);
}

function setNum(id, value, doFormat = true) {
  if (doFormat) {
    value = format(value, 2);
  }
  el(id).innerText = value;
}

function setClick(id, fn) {
  el(id).addEventListener('click', fn);
}

const generators = {
  scooper: {
    baseCost: 15,
    name: 'Scooper',
    number: 0,
    rate: 0.1,
  },
  super: {
    baseCost: 100,
    name: 'Super Scooper',
    number: 0,
    rate: 1,
  }
};

const player = {
  money: 0,
};

const flavors = {
  vanilla: {
    income: 1
  }
};

function getCost(type) {
  return generators[type].baseCost * Math.pow(multiplier, generators[type].number);
}

function buy(type) {
  const cost = getCost(type);
  if (cost <= player.money) {
    generators[type].number++;
    player.money -= cost;
  }
}

function scoop(flavor) {
  player.money += flavors[flavor].income;
}

Object.keys(flavors).forEach((flavor) => {
  setClick(`scoop-${flavor}`, () => {
    scoop(flavor);
  });
});

Object.keys(generators).forEach((gen) => {
  setClick(`buy-${gen}`, () => {
    buy(gen);
  });
});

setNum('profit-vanilla', flavors.vanilla.income);

function update(delta) {
  const scooper = generators.scooper;
  const superScooper = generators.super;

  const ms = delta / 1000;
  let secIncome = 0;
  secIncome += scooper.rate * scooper.number;
  secIncome += superScooper.rate * superScooper.number;
  player.money += (secIncome * ms);
}

function draw() {
  setNum('num-money', Math.floor(player.money));

  Object.keys(generators).forEach((gen) => {
    setNum(`num-${gen}`, generators[gen].number, false);
    setNum(`rate-${gen}`, generators[gen].rate);
    setNum(`cost-${gen}`, getCost(gen));
    el(`buy-${gen}`).disabled = (getCost(gen) > player.money);
  });
}

function end(fps, panic) {
  if (panic) {
    console.log(`PANIC: ${fps}`);
  }
}

MainLoop.setUpdate(update).setDraw(draw).setEnd(end).start();