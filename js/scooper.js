/* eslint-env browser */
/* eslint-disable no-console, no-magic-numbers */
/* globals ScooperGame, MainLoop */

const game = new ScooperGame();
game.setup();

function end(fps, panic) {
  if (panic) {
    console.log(`PANIC: ${fps}`);
  }
}

MainLoop.setUpdate((delta) => {
  game.updateTick(delta);
}).setDraw(() => {
  game.updateView();
}).setEnd(end).start();
