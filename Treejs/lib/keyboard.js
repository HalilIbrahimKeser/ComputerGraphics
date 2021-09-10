function initKeyboard() {
  document.addEventListener('keyup', function (event) {
    Key.onKeyup(event);
  }, {passive: false});
  document.addEventListener('keydown', function (event) {
    Key.onKeydown(event);
  }, {passive: false});
}

let Key = {
  _pressed: {},

  A: 65,
  W: 87,
  D: 68,
  S: 83,
  SPACE: 32,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  }
};

export {Key, initKeyboard};
