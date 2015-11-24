var Genre = function(){

	this.id = 'genre';

	View.apply(this, arguments);
	
	this.images = {
		'genre-background': 'img/home-bg.jpg'
	};

};

Genre.prototype = Object.create(View.prototype);

Genre.prototype.animateIn = function() {
	
	View.prototype.animateIn.call(this);

	var self = this;

	if ( !this.loaded ) return;
	
	this.domElem.fadeIn(250, function(){
		self.onAnimateIn();
	});
	
		var intervDraw;
		var ctx1 = document.getElementById('genre__canvas1').getContext('2d');
		var ctx2 = document.getElementById('genre__canvas2').getContext('2d');
		var ctx3 = document.getElementById('genre__canvas3').getContext('2d');
		var ctx4 = document.getElementById('genre__canvas4').getContext('2d');
		
	draw(ctx1,"rgb(205,235,245)",'../../../img/Future.png');
	draw(ctx2,"rgb(248,200,203)",'../../../img/Dubstep.png');
	draw(ctx3,"rgb(209,211,246)",'../../../img/Deephouse.png');
	draw(ctx4,"rgb(231,226,241)",'../../../img/Drumandbass.png');
	
	
	//animation en hover (refaire en switch ?)
	$('.categories').mouseenter(function() {
		var categoryChild = $(this).children("canvas");
		if (categoryChild.attr('id') == "genre__canvas1")
			intervDraw = setInterval(function() {draw(ctx1,"rgb(205,235,245)",'../../../img/Future.png')}, 100);
		else if (categoryChild.attr('id') == "genre__canvas2")
			intervDraw = setInterval(function() {draw(ctx2,"rgb(248,200,203)",'../../../img/Dubstep.png')}, 100);
		else if (categoryChild.attr('id') == "genre__canvas3")
			intervDraw = setInterval(function() {draw(ctx3,"rgb(209,211,246)",'../../../img/Deephouse.png')}, 100);
		else if (categoryChild.attr('id') == "genre__canvas4")
			intervDraw = setInterval(function() {draw(ctx4,"rgb(231,226,241)",'../../../img/Drumandbass.png')}, 100);
		
	});
	
	$('.genre__canvas').mouseleave(function() {
		clearInterval(intervDraw);
	});
	
	//fonction qui dessine les rectangles
	function draw(ctx, color, imgSrc) {
		  ctx.clearRect(0,0,420,140);
		  ctx.strokeStyle = color;
		  ctx.lineWidth = 7;
		  ctx.lineCap="round";
		  var counter = Math.PI/2;
		  var counter2 = Math.PI;
		  var increase = 2*Math.PI / 35;
		  var increase2 = 2*Math.PI / 35;
		  
			
		  for (var i=0; i<35 ; i++) {
			  
			  //ligne du haut
			  ctx.beginPath();
           ctx.moveTo(50+i*9,65);
           ctx.lineTo(50+i*9,(Math.abs( Math.sin( counter ) )*40)+Math.floor(Math.random() * (15 - 1))+1);
			  counter += increase;
           ctx.stroke();
			  
			  // ligne du bas
			  ctx.beginPath();
           ctx.moveTo(50+i*9,75);
           ctx.lineTo(50+i*9,(Math.abs( Math.sin( counter2 ) )*40)+Math.floor(Math.random() * (15 - 1))+75);
			  counter2 += increase2;
           ctx.stroke();
			  }
			  //image fond et texte : utiliser la fonction image de Canvas
			    var img = new Image();
				 img.src = imgSrc;
				 ctx.drawImage(img,5,45);
				 
	}

};

Genre.prototype.animateOut = function() {
	
	View.prototype.animateOut.call(this);

	var self = this;

	this.domElem.fadeOut(250, function(){
		self.onAnimateOut();
	});

};
