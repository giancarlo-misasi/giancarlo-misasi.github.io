// Callback to request next draw (using best supported mechanism)
window.requestDraw = (function () {
  return window.requestAnimationFrame
    || window.webkitRequestAnimationFrame
    || window.mozRequestAnimationFrame
    || window.oRequestAnimationFrame
    || window.msRequestAnimationFrame
    || function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

// Cancel next draw (using best supported mechanism)
window.cancelDraw = (function () {
  return window.cancelAnimationFrame
    || window.webkitCancelRequestAnimationFrame
    || window.mozCancelRequestAnimationFrame
    || window.oCancelRequestAnimationFrame
    || window.msCancelRequestAnimationFrame
    || clearTimeout
})();

// Convert hext code to rgb value
window.hexToRgb = function (hex) {
  // By Tim Down - http://stackoverflow.com/a/5624139/3493650
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

// Compute elapsed time since date
window.getElapsedMs = function (since) {
  return new Date() - since;
}

// Get random between [min inclusive and max exclusive)
window.random = function (min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

// Get random between [range.min inclusive and range.max exclusive)
window.randomIn = function (range) {
  return random(range.min, range.max);
}

// Remove and return random element from array
window.randomRemove = function (array) {
  if (array.length > 0) {
    return array.splice(random(0, array.length), 1)[0]
  } else {
    return null;
  }
}

window.sentenceScroller = function (params) {
  var that = this;

  // defaults
  // styling
  that.canvasId = "#sentence-scroller";
  that.backgroundColor = "#000000";
  that.fontFamily = 'arial';
  that.fontSizeVmin = 2; // %, smaller of vw and vh
  that.color = "#FFFFFF";
  // animations
  that.addSentenceEvery = 100;
  that.speedVw = { min: 1, max: 5 };          // move % of vw per second
  that.speedAlphaIn = { min: 25, max: 50 };   // fade % of alpha in per second
  that.alphaWait = { min: 2000, max: 4000 };  // ms to wait before fade out
  that.speedAlphaOut = { min: 25, max: 50 };  // fade % of alpha in per second
  // data
  that.sentences = ["Hello", "World!", "How", "are", "you?"];

  // allow parameter override
  if (params) {
    Object.assign(that, params);
  }

  // internal state
  that.activeSentences = [];
  that.canvas = document.getElementById(that.canvasId);
  that.width = that.canvas.width;
  that.height = that.canvas.height;
  that.ctx = that.canvas.getContext("2d");
  that.time = {
    sinceLastUpdate: new Date(),
    sinceAddSentence: new Date()
  };

  // Remove a sentence from the active list, put it back into the stack
  function removeSentence(sentence) {
    var idx = that.activeSentences.indexOf(sentence);
    if (idx !== -1) {
      that.activeSentences.splice(idx, 1);
      that.sentences.push(sentence.sentence);
    }
  }

  // Take a sentence from the stack and add to the active list
  function addSentence() {
    var pad = Math.min(that.width, that.height) * that.fontSizeVmin / 100;

    var s = {
      sentence: randomRemove(that.sentences),
      speedVw: randomIn(that.speedVw),
      speedAlphaIn: randomIn(that.speedAlphaIn),
      alphaWait: randomIn(that.alphaWait),
      speedAlphaOut: randomIn(that.speedAlphaOut),
      x: random(pad, 0.8 * that.width),
      y: random(pad, 0.9 * that.height),
      a: 0,
      fadeIn: true,
      created: new Date()
    };

    s.speedAlpha = function () {
      return this.fadeIn ? this.speedAlphaIn : this.speedAlphaOut;
    };

    that.activeSentences.push(s);
  }

  // Updates the state of a sentence after elapsed time
  function updateSentence(sentence, elapsedMs) {
    // speed is % per second of width/alpha
    var xSpeed = that.width * sentence.speedVw / 100;
    var xDelta = xSpeed * elapsedMs / 1000;
    var aSpeed = 255 * sentence.speedAlpha() / 100;
    var aDelta = aSpeed * elapsedMs / 1000;

    sentence.x += xDelta;
    if (sentence.fadeIn) {
      sentence.a += aDelta;
      if (sentence.a > 255) {
        sentence.fadeIn = false;
      }
    } else {
      if (getElapsedMs(sentence.created) > sentence.alphaWait) {
        sentence.a -= aDelta;
      }
    }

    if (sentence.x > that.width
      || (!sentence.fadeIn && sentence.a <= 0)) {
      removeSentence(sentence);
    }
  }

  // Removes all sentences (useful when resizing)
  that.clearSentences = function () {
    while (that.activeSentences.length > 0) {
      var s = that.activeSentences.pop();
      that.sentences.push(s.sentence);
    }
  }

  // Main animation loop
  that.draw = function () {
    var ctx = that.ctx;

    // Set context settings
    ctx.font = that.fontSizeVmin + "vmin " + that.fontFamily;

    // Draw background
    ctx.fillStyle = that.backgroundColor;
    ctx.fillRect(0, 0, that.canvas.width, that.canvas.height);

    // Draw sentences
    for (var i = 0; i < that.activeSentences.length; ++i) {
      var s = that.activeSentences[i];
      var rgb = hexToRgb(that.color);
      ctx.fillStyle = "rgba(" + [rgb.r, rgb.g, rgb.b, s.a / 255].join(",") + ")";
      ctx.fillText(s.sentence, s.x, s.y);
    }

    // Update sentences
    var elapsedMs = getElapsedMs(that.time.sinceLastUpdate);
    that.time.sinceLastUpdate = new Date();
    for (var i = 0; i < that.activeSentences.length; ++i) {
      var s = that.activeSentences[i];
      updateSentence(s, elapsedMs);
    }

    // Add new sentences
    if (that.activeSentences.length < that.sentences.length
      && getElapsedMs(that.time.sinceAddSentence) > that.addSentenceEvery
    ) {
      addSentence();
      that.time.sinceAddSentence = new Date();
    }

    // Trigger next draw
    requestDraw(that.draw);
  }

  // Stops animation loop
  that.cancelDraw = function () {
    cancelDraw(that.draw);
  }

  // Resize the canvas to the window size
  that.resize = function () {
    that.width = window.innerWidth;
    that.canvas.width = that.width;
    that.height = window.innerHeight;
    that.canvas.height = that.height;
    that.clearSentences();
  }

  // Link event handlers
  window.addEventListener('resize', that.resize);

  // Return the widget
  that.resize(); // resize to window on init
  return that;
}

// Usage
// var scroller = new SentenceScroller("", { sentences: pastas });
// scroller.draw();