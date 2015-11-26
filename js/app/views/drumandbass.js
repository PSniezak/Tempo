// Volume
// Clear canvas ?
// stress effect
// Pulse
// Gérer quand tu le redéposes direct

var Drumandbass = function () {

    this.id = 'drumandbass';

    View.apply(this, arguments);

    this.images = {
        'experience-background': 'img/home-bg.jpg'
    };

};

var sources = {};
var canvas, ctx;
var queue = new Array();

Drumandbass.prototype = Object.create(View.prototype);

Drumandbass.prototype.animateIn = function () {

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

    var context = new AudioContext();
    var javascriptNode = context.createScriptProcessor(256, 1, 1);
    var analyser = context.createAnalyser();
    var BPM = 86;
    var mesure = 60000 / BPM * 8;
    // var gainNode = context.createGain();
    // gainNode.gain.value = 0;

    var gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(1, '#fbfcff');
    gradient.addColorStop(0.75, '#f7f8ff');
    gradient.addColorStop(0.5, '#f7f8ff');
    gradient.addColorStop(0.25, '#f7f8ff');
    gradient.addColorStop(0, '#fbfcff');

    // Heart
    window.addEventListener('load', init(), false);
    window.addEventListener('load', queueSound(), false);

    // AudioContext initialization
    function init() {
        console.log('Initializing sound');
        try {
            window.AudioContext = window.AudioContext || windows.webkitAudioContext;
            console.log('Done');
        } catch (e) {
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
        request.onload = function () {
            context.decodeAudioData(request.response, function (buffer) {
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
        window.setInterval(function () {
            for (var i = 0; i <= queue.length - 1; i++) {
                console.log(queue[i]);
                loadSound(queue[i]);
                queue.pop();
            };
            console.log('salut');
        }, mesure);
    }

    function initSpectrum(javascriptNode, analyser) {
        javascriptNode.onaudioprocess = function () {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);

            ctx.clearRect(0, 0, 1296, 600);

            drawSpectrum(array);
        }
    }

    function releaseSound(ctx, url) {
        sources['key' + url].disconnect();
        ctx.clearRect(0, 0, 1296, 600);
    }

    function drawSpectrum(array) {
        bars = 254;
        for (var i = 0; i < bars; i++) {
            bar_x = i * 2;
            bar_width = 1;
            bar_height = -(array[i] / 7);
            ctx.fillStyle = gradient;

            ctx.fillRect(bar_x, canvas.height / 2, bar_width, bar_height);
            ctx.fillRect(bar_x, canvas.height / 2, bar_width, -bar_height);
        }
    };

    // Event dropped class changes
    $('.element').on('addDropped', function () {
        // $('.element.dropped').css('background-color', '#cfd3fc');
        // $('.element.dropped > span').css('color', '#fff');
        var buffer = $(this).data('src');
        queue.push(buffer);
    });

    $('.element').on('removeDropped', function () {
        releaseSound(ctx, $(this).data('src'));
    });

    //tuto
    $('.tuto').mouseover(function(){
        $('.scene-tuto').css('display','block');
    });
    $('.tuto').mouseout(function () {
        $('.scene-tuto').css('display','none');
    });


}; //end animateIn

Drumandbass.prototype.animateOut = function () {

    View.prototype.animateOut.call(this);

    var self = this;

    this.domElem.fadeOut(250, function () {
        self.onAnimateOut();
    });

};