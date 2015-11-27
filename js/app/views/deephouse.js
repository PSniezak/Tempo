var Deephouse = function () {

    this.id = 'deephouse';

    View.apply(this, arguments);

    this.images = {
        'experience-background': 'img/home-bg.jpg'
    };

};

var sources = {};
var canvas, ctx;
var queue = new Array();
var canvas;

// - Volume
// - Quand on change de page, ça vire le son et absolument tout en fait
// - Animation en hover sur les pastilles et éventuellement au temps (cf remplissage)
// - Lowpass en changeant de tab
// - design global
// - Binder le retour et faire un for qui arrête tous les samples

Deephouse.prototype = Object.create(View.prototype);

Deephouse.prototype.animateIn = function () {

    View.prototype.animateIn.call(this);

    var self = this;

    if (!this.loaded) return;

    this.domElem.fadeIn(250, function () {
        self.onAnimateIn();
    });

    //Drag and drop

    //see http://www.greensock.com/draggable/ for more details.

    var droppables = $(".element");
    var dropArea = $(".scene");
    var dropSecond = $(".sample");
    var droppablesDropped = $('.dropped');

    //the overlapThreshold can be a percentage ("50%", for example, would only trigger when 50% or more of the surface area of either element overlaps) or a number of pixels (20 would only trigger when 20 pixels or more overlap), or 0 will trigger when any part of the two elements overlap.
    var overlapThreshold = "99%";
    var posX, posY;
    //zone de drag and drop principale = des samples vers l'expérience

    var mainDrag = Draggable.create(droppables, {
        bounds: window,
        //record the starting position on press
        onPress: function () {
            this.startX = this.x;
            this.startY = this.y;
            if ($(this.target).hasClass('dropped')) {
                this.startX = posX;
                this.startY = posY;
                $(this.target).addClass('highlight');
            }
        },
        onDrag: function (e) {
            if (this.hitTest(dropArea, overlapThreshold)) {
                $(this.target).addClass("highlight");
            } else {
                $(this.target).removeClass("highlight");
            }
            if ($(this.target).hasClass('dropped')) {
                if (!this.hitTest(dropArea, overlapThreshold)) {
                    $(this.target).removeClass('dropped').trigger('removeDropped');
                    $(this.target).addClass('deleteSample');
                } else {
                    $(this.target).removeClass('deleteSample');
                }
            }
        },
        onDragEnd: function (e) {
            //instead of doing hitTest again, just see if it has the highligh class. Si au moment de le poser il avait la classe .highlight => c'est qu'il est dans la zone de drop
            //s'il n'était pas dans la zone alors
            if (!$(this.target).hasClass("highlight")) {
                if ($(this.target).hasClass('dropped')) {
                    $(this.target).removeClass('dropped').trigger('removeDropped');
                }
                $(this.target).removeClass('deleteSample');
                //if there isn't a highlight, send it back to starting position
                TweenLite.to(this.target, 0.2, {
                    x: this.startX,
                    y: this.startY
                })
            } else {
                posX = this.startX;
                posY = this.startY;
                $(this.target).removeClass("highlight");
                $(this.target).addClass('dropped').trigger('addDropped');
                $(this.target).removeClass('deleteSample');
            }
        }
    });

// SOUND PROCESSING
  var canvas = $('#canvas-spectrum')[0];
  var ctx = canvas.getContext('2d');
  var ws = canvas.width;
  var hs = canvas.height;

  context = new AudioContext();
  var javascriptNode = context.createScriptProcessor(256, 1, 1);
  var analyser = context.createAnalyser();
  var BPM = 124;
  var mesure = 60000/BPM * 8;
  // var gainNode = context.createGain();
  // gainNode.gain.value = 0;

  var gradient = ctx.createLinearGradient(0,0,0,600);
  gradient.addColorStop(1,'#caf0fd');
  gradient.addColorStop(0.75,'#caf0fd');
  gradient.addColorStop(0.5,'#caf0fd');
  gradient.addColorStop(0.25,'#caf0fd');
  gradient.addColorStop(0,'#caf0fd');

  // Heart
  window.addEventListener('load', init(), false);
  window.addEventListener('load', queueSound(), false);

  // AudioContext initialization
  function init() {
      console.log('Initializing sound');
      try {
          window.AudioContext = window.AudioContext||windows.webkitAudioContext;
          console.log('Done');
      } catch(e) {
          alert("La Web Audio API n'est pas supportée par votre navigateur");
      }
  }

  function onError(e) {
    console.log(e);
  }

  // Load a buffer
function loadSound(url) {
    console.log('Loading ' + url);
    url_buffer = "../sounds/" + url;
    // Request initialization
    var request = new XMLHttpRequest();
    request.open('GET', url_buffer, true);
    request.responseType = 'arraybuffer';

    // Audio decoding
    request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
            console.log('Loaded');
            analyseSound(buffer, url);
        }, onError);
    };

    request.send();
}

// Analyse and define buffer
function analyseSound(buffer, url) {
    console.log('Analysing sound');
    javascriptNode.connect(context.destination); 
    // Analyser
    analyser.smoothingTimeConstant = 0.9;
    analyser.fftSize = 2048;

    // Source creation
    var source = context.createBufferSource();
    // Associating the buffer to the source
    source.connect(analyser);
    analyser.connect(javascriptNode);

    // Connection of the source to the context destination
    source.connect(context.destination);

    playSound(javascriptNode, source, analyser, buffer, url);
}

// Play a buffer (Source -> Dest)
function playSound(javascriptNode, source, analyser, buffer, url) {
    console.log('Playing');
    // Start the source
    source.buffer = buffer;
    source.loop = true;
    source.start(0);
    sources['key' + url] = source;

    initSpectrum(javascriptNode, analyser);
}

function queueSound(url) {
  window.setInterval(function() {
    for (var i = 0; i <= queue.length - 1; i++) {
      loadSound(queue[i]);
      ctx.clearRect(0, 0, ws, hs);
    };
    queue = [];
    console.log('Time');
  }, mesure);
  pusleEffect();
}

function initSpectrum(javascriptNode, analyser) {
    javascriptNode.onaudioprocess = function() {
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);

        ctx.clearRect(0, 0, ws, hs);

        drawSpectrum(array);
    }
}

function releaseSound(ctx, url) {
  sources['key' + url].disconnect();
  delete sources['key' + url];
  ctx.clearRect(0, 0, ws, hs);
}

function drawSpectrum(array) {
    bars = 254;
    for (var i = 0; i < bars; i++) {
        bar_x = i * 2;
        bar_width = 1;
        bar_height = -(array[i] / 7);
        ctx.fillStyle= "#d0c7dd";

        ctx.fillRect(bar_x, canvas.height/2, bar_width, bar_height);
        ctx.fillRect(bar_x, canvas.height/2, bar_width, -bar_height);
      }
};

function pusleEffect() {
  $('.scene--bouncer-circle').addClass( "scene--bouncer-outline-animated" );
  $('.scene--bouncer-outline').addClass( "scene--bouncer-outline-animated" );
  $('.scene--bouncer-outline-2').addClass( "scene--bouncer-outline-animated" );
  $('.scene--bouncer-outline-3').addClass( "scene--bouncer-outline-animated" );
  $('.deephouse-forme').addClass( "scene--bouncer-outline-animated" );
}

function secureSearch(buffer) {
  if (sources['key' + buffer]) {
    return true;
  } else {
    return false;
  }
}

// Event dropped class changes
$('.element').on('addDropped', function() {
  // $('.element.dropped').css('background-color', '#cfd3fc');
  // $('.element.dropped > span').css('color', '#fff');
    var buffer = $(this).data('src');
    if (secureSearch(buffer)) {
      console.log('Sample here');
    } else {
      console.log('Sample not here');
      queue.push(buffer);
      console.log(queue);
    }
});

$('.element').on('removeDropped', function() {
  releaseSound(ctx, $(this).data('src'));
});

//tuto
    $('.tuto').mouseover(function(){
        $('.scene-tuto').css('display','block');
    });
    $('.tuto').mouseout(function () {
        $('.scene-tuto').css('display','none');
    });


// Switch tab effect
var hidden, visibilityChange;
if (typeof document.hidden !== 'undefined') {
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
} else if (typeof document.mozHidden !== 'undefined') {
    hidden = 'mozHidden';
    visibilityChange = 'mozVisibilitychange';
} else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msVisibilitychange';
} else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitVisibilitychange';
}

document.addEventListener(visibilityChange, function() {
    if (document.hidden) {
        console.log('Tab changed');
        context.suspend();
    } else {
        console.log('Tab back');
        context.resume();
    }
}, false);


$(function() {
  var W, H,
    canvas_particles, ctx, //ctx stands for context and is the "curso" of our canvas element.
    particleCount = 200,
    particles = []; //this is an array which will hold our particles Object/Class

  W = window.innerWidth;
  H = window.innerHeight;

  canvas_particles = $("#canvas-particles").get(0); //this "get(0) will pull the underlying non-jquery wrapped dom element from our selection
  canvas_particles.width = W;
  ctx = canvas_particles.getContext("2d"); // settng the context to 2d rather than the 3d WEBGL
  ctx.globalCompositeOperation = "lighter";
  console.log(ctx);
  var mouse = {
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
    speed: 40,
    delta: 0
  };

  document.addEventListener('mousemove', function(e) {

    mouse.x = e.clientX || e.pageX;
    mouse.y = e.clientY || e.pageY;
    mouse.x -= W / 2;
    mouse.y -= H / 2;

  }, false);

  function randomNorm(mean, stdev) {

    return Math.abs(Math.round((Math.random() * 2 - 1) + (Math.random() * 2 - 1) + (Math.random() * 2 - 1)) * stdev) + mean;
  }

  //Setup particle class
  function Particle() {
      //using hsl is easier when we need particles with similar colors
      this.h = parseInt(0);
      this.s = parseInt(60 * Math.random() + 80);
      /*this.l=parseInt(30 * Math.random() + 60);*/
      this.l = parseInt(100);
      this.a = 1;

      this.color = "hsla(" + this.h + "," + this.s + "%," + this.l + "%," + (this.a) + ")";
      this.shadowcolor = "hsla(" + this.h + "," + this.s + "%," + this.l + "%," + parseFloat(this.a) + ")";

      this.x = Math.random() * W;
      this.y = Math.random() * H;

      this.direction = {
        "x": -1 + Math.random() * 2,
        "y": -1 + Math.random() * 2
      };
      //this.radius = 9 * ((Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1)+3);
      this.radius = randomNorm(0, 1);
      this.scale = 1;
      this.rotation = Math.PI / 4 * Math.random();

      this.grad = ctx.createRadialGradient(this.x, this.y, this.radius, this.x, this.y, 0);
      this.grad.addColorStop(0, this.color);
      this.grad.addColorStop(1, this.shadowcolor);

      this.vx = .2 * this.radius;
      this.vy = 3 * this.radius;

      this.valpha = 0.01 * Math.random() - 0.02;

      this.move = function() {
        this.x += this.vx * this.direction.x;
        this.y += this.vy * this.direction.y;
        this.rotation += this.valpha;
        //this.radius*= Math.abs((this.valpha*0.01+1));
      };

      this.changeDirection = function(axis) {
        this.direction[axis] *= -1;
        this.valpha *= -1;
      };
      this.draw = function() {
        ctx.save();
        ctx.translate(this.x + mouse.rx / -20 * this.radius, this.y + mouse.ry / -20 * this.radius);
        ctx.rotate(this.rotation);
        ctx.scale(1, this.scale);

        this.grad = ctx.createRadialGradient(0, 0, this.radius, 0, 0, 0);
        this.grad.addColorStop(1, this.color);
        this.grad.addColorStop(0, this.shadowcolor);

        ctx.beginPath();
        ctx.fillStyle = this.grad;
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();

      };

      this.boundaryCheck = function() {
        if (this.x >= W * 1.2) {
          this.x = W * 1.2;
          this.changeDirection("x");
        } else if (this.x <= -W * 0.2) {
          this.x = -W * 0.2;
          this.changeDirection("x");
        }
        if (this.y >= H * 1.2) {
          this.y = H * 1.2;
          this.changeDirection("y");
        } else if (this.y <= -H * 0.2) {
          this.y = -H * 0.2;
          this.changeDirection("y");
        }
      };
    } //end particle class

  function clearCanvas() {
      ctx.clearRect(0, 0, W, H);
    } //end clear canvas

  function createParticles() {
      for (var i = particleCount - 1; i >= 0; i--) {
        p = new Particle();
        particles.push(p);
      }
    } // end createParticles

  function drawParticles() {
      for (var i = particleCount - 1; i >= 0; i--) {
        p = particles[i];
        p.draw();
      }

    } //end drawParticles

  function updateParticles() {
      for (var i = particles.length - 1; i >= 0; i--) {
        p = particles[i];
        p.move();
        p.boundaryCheck();
      }
    } //end updateParticles

  function initParticleSystem() {
    createParticles();
    drawParticles();
  }

  function animateParticles() {
    clearCanvas();
    setDelta();
    update()
    drawParticles();
    updateParticles();
    requestAnimationFrame(animateParticles);
  }

  initParticleSystem();
  requestAnimationFrame(animateParticles);

  function setDelta() {
    this.now = (new Date()).getTime();
    mouse.delta = (this.now - this.then) / 1000;
    this.then = this.now;
  }

  function update() {

    if (isNaN(mouse.delta) || mouse.delta <= 0) {
      return;
    }

    var distX = mouse.x - (mouse.rx),
      distY = mouse.y - (mouse.ry);

    if (distX !== 0 && distY !== 0) {

      mouse.rx -= ((mouse.rx - mouse.x) / mouse.speed);
      mouse.ry -= ((mouse.ry - mouse.y) / mouse.speed);

    }

  };

});

}; //end animateIn

Deephouse.prototype.animateOut = function() {

    View.prototype.animateOut.call(this);

    var self = this;

    this.domElem.fadeOut(250, function(){
        self.onAnimateOut();
    });

    context.close();
    window.location.href = window.location.href;
};