var Experience = function(){

	this.id = 'experience';

	View.apply(this, arguments);

	this.images = {
		'experience-background': 'img/home-bg.jpg'
	};

};

Experience.prototype = Object.create(View.prototype);

Experience.prototype.animateIn = function() {
	
	View.prototype.animateIn.call(this);

	var self = this;

	if ( !this.loaded ) return;

	this.domElem.fadeIn(250, function(){
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
    onPress: function() {
      this.startX = this.x;
      this.startY = this.y;
        if ($(this.target).hasClass('dropped')){
            this.startX = posX;
            this.startY = posY;
            $(this.target).addClass('highlight');
        }
    },
    onDrag: function(e) {
      if (this.hitTest(dropArea, overlapThreshold)) {
        $(this.target).addClass("highlight");
      } else {
        $(this.target).removeClass("highlight");
      }
      if ($(this.target).hasClass('dropped')){
         if (!this.hitTest(dropArea, overlapThreshold)) {
          $(this.target).removeClass('dropped');
          $(this.target).addClass('deleteSample');
         }else{
          $(this.target).removeClass('deleteSample');
         }
      }
    },
  onDragEnd: function(e) {
    //instead of doing hitTest again, just see if it has the highligh class. Si au moment de le poser il avait la classe .highlight => c'est qu'il est dans la zone de drop
      //s'il n'était pas dans la zone alors
    if (!$(this.target).hasClass("highlight")) {
            if($(this.target).hasClass('dropped')){
                $(this.target).removeClass('dropped');
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
          $(this.target).addClass('dropped');
        $(this.target).removeClass('deleteSample');
    }
  }
  });
}; //end animateIn

Experience.prototype.animateOut = function() {
	
	View.prototype.animateOut.call(this);

	var self = this;

	this.domElem.fadeOut(250, function(){
		self.onAnimateOut();
	});

};

