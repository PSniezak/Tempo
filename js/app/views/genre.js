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
	
	//On déclare les variables pour les 4 canvas et les dessine une première fois
	var ctx1 = function() {
		draw(document.getElementById('genre__canvas1').getContext('2d'),"rgb(205,235,245)");
	};

	var ctx2 = function() {
		draw(document.getElementById('genre__canvas2').getContext('2d'),"rgb(248,200,203)");
	};

	var ctx3 = function() {
		draw(document.getElementById('genre__canvas3').getContext('2d'),"rgb(209,211,246)");
	};

	var ctx4 = function() {
		draw(document.getElementById('genre__canvas4').getContext('2d'),"rgb(231,226,241)");
	};
	
	ctx1();
	ctx2();
	ctx3();
	ctx4();
	
	//On déclare une variable pour arrêter le SetInterval quand il est lancé
	var intervDraw;
	
	//Animation qui se lance quand on hover
	// $('.categories').mouseenter(function() {
	// 	var categoryChild = $(this).children("canvas");
	// 	if (categoryChild.attr('id') == "genre__canvas1")
	// 		intervDraw = setInterval(ctx1, 100);
	// 	else if (categoryChild.attr('id') == "genre__canvas2")
	// 		intervDraw = setInterval(ctx2, 100);
	// 	else if (categoryChild.attr('id') == "genre__canvas3")
	// 		intervDraw = setInterval(ctx3, 100);
	// 	else if (categoryChild.attr('id') == "genre__canvas4")
	// 		intervDraw = setInterval(ctx4, 100);
		
	// });
	
	//On stop l'animation quand on quitte le div
	$('.categories').mouseleave(function() {
		clearInterval(intervDraw);
	});
	
	//Fonction qui dessine les rectangles et qu'on utilise pour dessiner nos canvas
	function draw(ctx, color) {
		  ctx.clearRect(0,0,420,140);
		  ctx.strokeStyle = color;
		  ctx.lineWidth = 7;
		  ctx.lineCap="round";
		  var counter = Math.PI/2;
		  var counter2 = Math.PI;
		  var increase = 2*Math.PI / 35;
		  var increase2 = 2*Math.PI / 35;
		  
			
		  for (var i=0; i<35 ; i++) {
			  
			  //Dessine la ligne du haut
			  ctx.beginPath();
           ctx.moveTo(50+i*9,65);
           ctx.lineTo(50+i*9,(Math.abs( Math.sin( counter ) )*40)+Math.floor(Math.random() * (15 - 1))+1);
			  counter += increase;
           ctx.stroke();
			  
			  //Dessine la ligne du bas
			  ctx.beginPath();
           ctx.moveTo(50+i*9,75);
           ctx.lineTo(50+i*9,(Math.abs( Math.sin( counter2 ) )*40)+Math.floor(Math.random() * (15 - 1))+75);
			  counter2 += increase2;
           ctx.stroke();
			  }
				 
	}

};

Genre.prototype.animateOut = function() {
	
	View.prototype.animateOut.call(this);

	var self = this;

	this.domElem.fadeOut(250, function(){
		self.onAnimateOut();
	});

};
