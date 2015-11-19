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
    

        
    //see http://www.greensock.com/draggable/ for more details.

var droppables = $(".element");
var dropArea = $(".exp");

//the overlapThreshold can be a percentage ("50%", for example, would only trigger when 50% or more of the surface area of either element overlaps) or a number of pixels (20 would only trigger when 20 pixels or more overlap), or 0 will trigger when any part of the two elements overlap.
var overlapThreshold = "99%";

Draggable.create(droppables, {
  bounds: window,
  //record the starting position on press
  onPress: function() {
    this.startX = this.x;
    this.startY = this.y;
  },
  onDrag: function(e) {
    if (this.hitTest(dropArea, overlapThreshold)) {
      $(this.target).addClass("highlight");
    } else {
      $(this.target).removeClass("highlight");
    }
  },
onDragEnd: function(e) {
  //instead of doing hitTest again, just see if it has the highligh class.
  if (!$(this.target).hasClass("highlight")) {
    //if there isn't a highlight, send it back to starting position
    TweenLite.to(this.target, 0.2, {
      x: this.startX,
      y: this.startY
    })
  }

}
});
    
    
};

Experience.prototype.animateOut = function() {
	
	View.prototype.animateOut.call(this);

	var self = this;

	this.domElem.fadeOut(250, function(){
		self.onAnimateOut();
	});

};

