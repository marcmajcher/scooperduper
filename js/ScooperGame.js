/* eslint-env browser */

((root) => {
  /* Helper functions */

  function el(id) {
    return document.getElementById(id);
  }

  function format(num, digits) {
    const pow = Math.pow(10, digits); // eslint-disable-line no-magic-numbers
    let out = (Math.round(num * pow) / pow).toString();
    const dot = out.match(/\.(\d*)$/);
    if (dot !== null) {
      digits -= dot[1].length;
    } else {
      out += '.';
    }
    return out + '0'.repeat(digits);
  }

  function setClick(id, fn) {
    el(id).addEventListener('click', fn);
  }

  function setNum(id, value, doFormat = true) {
    if (doFormat) {
      value = format(value, 2); // eslint-disable-line no-magic-numbers
    }
    el(id).innerText = value;
  }

  /* Main game class, exported */

  class ScooperGame {
    constructor() {
      this.init();
    }

    init() {
      this.multiplier = 1.15;

      this.player = {
        money: 0,
      };

      this.generators = {
        scooper: {
          baseCost: 15,
          name: 'Scooper',
          number: 0,
          rate: 0.1,
          unlock: 0,
        },
        super: {
          baseCost: 100,
          name: 'Super Scooper',
          number: 0,
          rate: 1,
          unlock: 50,
        },
        duper: {
          baseCost: 1100,
          name: 'Super Duper Scooper',
          number: 0,
          rate: 8,
          unlock: 800,
        },
        master: {
          baseCost: 12000,
          name: 'Scoop Master',
          number: 0,
          rate: 47,
          unlock: 75000,
        },
        bot: {
          baseCost: 130000,
          name: 'Scoop-Bot',
          number: 0,
          rate: 260,
          unlock: 70000,
        },
        tron: {
          baseCost: 14000000,
          name: 'Scoop-o-tron 3000',
          number: 0,
          rate: 1400,
          unlock: 8000000,
        },
      };

      this.flavors = {
        vanilla: {
          income: 1,
          name: 'Vanilla',
          unlock: 0,
        },
        chocolate: {
          income: 100,
          name: 'Chocolate',
          unlock: 1000,
        },
        strawberry: {
          income: 10000,
          name: 'Strawberry',
          unlock: 100000,
        },
        pistachio: {
          income: 1000000,
          name: 'Pistachio',
          unlock: 10000000,
        }
      };

      this.genKeys = Object.keys(this.generators);
      this.flavorKeys = Object.keys(this.flavors);
    }

    setup() {
      this.genKeys.forEach((gen) => {
        this.addGenerator(gen);
      });
      this.genKeys.forEach((gen) => {
        setClick(`buy-${gen}`, () => {
          this.buy(gen);
        });
      });

      this.flavorKeys.forEach((flavor) => {
        this.addFlavor(flavor);
      });
      this.flavorKeys.forEach((flavor) => {
        setNum(`profit-${flavor}`, this.flavors[flavor].income);
        setClick(`scoop-${flavor}`, () => {
          this.scoop(flavor);
        });
      });
    }

    addFlavor(flavor) {
      const container = el('flavors');
      container.innerHTML += `
        <div class="flavor flavor-locked" id="flavor-${flavor}">
          <div class="flavor-name">${this.flavors[flavor].name}</div>
          <img id="scoop-${flavor}" class="scoop" src="img/scoop-${flavor}.png" alt="Scoop of ${this.flavors[flavor].name}">
          <div>( $<span id="profit-${flavor}">.</span> / scoop )</div>
        </div>
      `;
    }

    addGenerator(gen) {
      const container = el('generators');
      container.innerHTML += `
        <div class="generator generator-locked" id="generator-${gen}">
          <div class="generator-title">${this.generators[gen].name}: <span id="num-${gen}">.</span></div>
          <div>
              <button class="btn-buy" id="buy-${gen}">Buy ${this.generators[gen].name}</button>
              <div>(<span id="rate-${gen}">.</span> scoop / sec)</div>
              <div>Cost: $<span id="cost-${gen}">.</span></div>
          </div>
        </div>
      `;
    }

    buy(type) {
      const cost = this.getCost(type);
      if (cost <= this.player.money) {
        this.generators[type].number++;
        this.player.money -= cost;
      }
    }

    getCost(type) {
      const gen = this.generators[type];
      return gen.baseCost * Math.pow(this.multiplier, gen.number);
    }

    scoop(flavor) {
      this.player.money += this.flavors[flavor].income;
    }

    updateTick(delta) {
      const ms = delta / 1000; // eslint-disable-line no-magic-numbers
      let secIncome = 0;
      Object.values(this.generators).forEach((gen) => {
        secIncome += gen.rate * gen.number;
      });
      this.player.money += (secIncome * ms);
    }

    updateView() {
      setNum('num-money', Math.floor(this.player.money));

      this.genKeys.forEach((gen) => {
        setNum(`num-${gen}`, this.generators[gen].number, false);
        setNum(`rate-${gen}`, this.generators[gen].rate);
        setNum(`cost-${gen}`, this.getCost(gen));
        el(`buy-${gen}`).disabled = (this.getCost(gen) > this.player.money);
        if (el(`generator-${gen}`).classList.contains('generator-locked') &&
          this.player.money >= this.generators[gen].unlock) {
          el(`generator-${gen}`).classList.remove('generator-locked');
        }
      });

      this.flavorKeys.forEach((flavor) => {
        if (el(`flavor-${flavor}`).classList.contains('flavor-locked') &&
          this.player.money >= this.flavors[flavor].unlock) {
          el(`flavor-${flavor}`).classList.remove('flavor-locked');
        }
      });
    }
  }

  root.ScooperGame = ScooperGame;
})(this);
