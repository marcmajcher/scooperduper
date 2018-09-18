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

      this.generators = {
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
        },
        duper: {
          baseCost: 1100,
          name: 'Super Duper Scooper',
          number: 0,
          rate: 8,
        },
        master: {
          baseCost: 12000,
          name: 'Scoop Master',
          number: 0,
          rate: 47,
        },
        bot: {
          baseCost: 130000,
          name: 'Scoop-Bot',
          number: 0,
          rate: 260,
        },
        tron: {
          baseCost: 14000000,
          name: 'Scoop-o-tron 3000',
          number: 0,
          rate: 1400,
        },
      };

      this.player = {
        money: 0,
      };

      this.flavors = {
        vanilla: {
          income: 1
        }
      };
    }

    setup() {
      Object.keys(this.generators).forEach((gen) => {
        this.addGenerator(gen);
      });
      Object.keys(this.generators).forEach((gen) => {
        setClick(`buy-${gen}`, () => {
          this.buy(gen);
        });
      }); // WAT
      Object.keys(this.flavors).forEach((flavor) => {
        setNum(`profit-${flavor}`, this.flavors[flavor].income);
        setClick(`scoop-${flavor}`, () => {
          this.scoop(flavor);
        });
      });
    }

    addGenerator(gen) {
      const container = el('generators');
      container.innerHTML += `
        <div class="generator generator-locked" id="generator-${gen}">
          <div class="generator-title">${this.generators[gen].name}: <span id="num-${gen}">.</span></div>
          <div>
              <button class="btn-buy" id="buy-${gen}">Buy ${this.generators[gen].name}</button>
              <div>(<span id="rate-${gen}">.</span> scoop / sec)</div>
              <div>Cost: $ <span id="cost-${gen}">.</span></div>
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

      Object.keys(this.generators).forEach((gen) => {
        setNum(`num-${gen}`, this.generators[gen].number, false);
        setNum(`rate-${gen}`, this.generators[gen].rate);
        setNum(`cost-${gen}`, this.getCost(gen));
        el(`buy-${gen}`).disabled = (this.getCost(gen) > this.player.money);
        if (this.player.money > this.generators[gen].baseCost &&
          el(`generator-${gen}`).classList.contains('generator-locked')) {
          el(`generator-${gen}`).classList.remove('generator-locked');
        }
      });
    }
  }

  root.ScooperGame = ScooperGame;
})(this);