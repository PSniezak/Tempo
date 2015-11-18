var View = function(){

	// Constructor
	this.loaded = false;
	this.container = app.mainContainer;

	this.domElem = null;

	this.domId = this.id;

	if ( typeof this.templateId == 'undefined' ){
		this.templateId = this.id;
	}

	if ( typeof this.datas == 'undefined' ){
		this.datas = app.datas;
	}

	// Create useful signals
	this._onViewLoadComplete = new signals.Signal();

	this._onAnimateIn = new signals.Signal();
	this._onAnimateOut = new signals.Signal();

	this.images = {};

	// Init view
	this.init();

};

// Init view
View.prototype.init = function() {
	
	this.template();

};

// Template view
View.prototype.template = function() {
	
	this.dom = app.template( this.templateId, this.datas );

};

// Load view
View.prototype.load = function() {
	
	// If there is something to load
	if ( app.getObjectLength( this.images ) > 0 ){

		// Create loader
		this.loader = new Loader();

		// Listen to onComplete event
		this.loader._onComplete.add( this.onLoadComplete, this );

		// Add images to the queue
		this.loader.addImages( this.images );

		// Start loader
		this.loader.start();

	} else {

		// If nothing to load we go directly to onLoadComplete
		this.onLoadComplete();

	}

};

// Once the view is loaded
View.prototype.onLoadComplete = function() {
	
	// Remove listener if we used the loader
	if ( this.loader ) this.loader._onComplete.remove( this.onLoadComplete, this );

	// Set the view as loaded
	this.loaded = true;

	// Dispatch on view load complete event
	this._onViewLoadComplete.dispatch();

};

// Animate view in
View.prototype.animateIn = function() {
	
	// Remove on view load complete event
	this._onViewLoadComplete.remove( this.animateIn, this );

	// If the view is not loaded yet
	if ( !this.loaded ){

		// Listen to the on view load complete event
		// for going back to animateIn once loaded
		this._onViewLoadComplete.add( this.animateIn, this );

		// Load it
		this.load();

		return;

	}
	
	// Append dom to the container
	this.container.append( this.dom );

	// Set selectors
	this.setSelectors();

	// Resize view
	this.resize();

	// Bind view events
	this.bind();

};

// Set selectors
View.prototype.setSelectors = function() {
	
	// Set domElem
	this.domElem = this.container.find('#' + this.domId);

	// Hide it
	this.domElem.hide();

};

// Resize view
View.prototype.resize = function() {

};

// Update
View.prototype.update = function() {

};

// Bind view events
View.prototype.bind = function() {
	
	// Bind onUpdate = requestAnimationFrame event
	app._onUpdate.add(this.update, this);

	// Bind resize event
	app._onResize.add(this.resize, this);

};

// Once view is animated in
View.prototype.onAnimateIn = function() {
	
	// Dispatch onAnimateIn event
	this._onAnimateIn.dispatch();

};

// Animate view out
View.prototype.animateOut = function() {
	
	// Unbind view events
	this.unbind();

};

// Unbind view events
View.prototype.unbind = function() {
	
	// Unbind onUpdate
	app._onUpdate.remove(this.update, this);

	// Unbind onResize
	app._onResize.remove(this.resize, this);

};

// Once view is animated out
View.prototype.onAnimateOut = function() {
	
	// Remove domElem
	this.domElem.remove();

	// Dispatch onAnimateOut event
	this._onAnimateOut.dispatch();

};
"use strict"

function App(){

	this.window = $(window);

	this.mainContainer = $('main');

	// Signals
	this._onResize = new signals.Signal();
	this._onUpdate = new signals.Signal();

	// Datas
	this.datas = null;

	// Datas path
	this.datasPath = '/assets/json/';

	// Save templates
	this.templates = window.templates;

	// Set lang
	this.lang = 'fr';

	// Init
	this.init();

};

// Init app
App.prototype.init = function() {
	
	// Load datas
	this.loadDatas();

};

// Load datas
App.prototype.loadDatas = function() {
	
	// Save context
	var self = this;

	// Get datas
	$.getJSON( this.datasPath + this.lang + '.json', function(response){

		// Save datas
		self.datas = response;

		// Once datas are loaded
		self.onDatasLoaded();

	});

};

// Once datas are loaded
App.prototype.onDatasLoaded = function() {

	// Bind common events
	this.bind();

	// Create router
	this.router = new Router();

	// Create viewController
	this.viewController = new ViewController();

	// Create mainLoader
	this.mainLoader = new MainLoader();

	// Listen mainLoader for onAnimateIn event
	this.mainLoader._onAnimateIn.add(this.onMainLoaderAnimateIn, this);

	// Start loading common assets
	this.mainLoader.animateIn();

};

// Bind common events
App.prototype.bind = function() {
	
	// Bind resize event
	this.window.on("resize", $.proxy(this.resize, this));

};

// Resize
App.prototype.resize = function() {
	
	// Save new window width & height
	this.w = this.window.width();
	this.h = this.window.height();

	// Dispatch resize event
	this._onResize.dispatch();

};

// Update
App.prototype.update = function() {
		
	// Dispatch onUpdate event at every requestAnimationFrame
	this._onUpdate.dispatch();

};

// Template
App.prototype.template = function(templateId, datas) {

	// Return compiled template from templateId & datas
	return this.templates[ templateId ]( datas );

};

App.prototype.onMainLoaderAnimateIn = function() {
	
	// Remove listener
	this.mainLoader._onAnimateIn.remove(this.onMainLoaderAnimateIn, this);

	// Bind viewController
	this.viewController.bind();

	// Init router
	this.router.init();

};

App.prototype.getObjectLength = function( obj ){

  return Object.size(obj);

};

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

var ViewController = function(){

	this.views = {};

	this.isBusy = false;

	this._onViewLoadComplete = new signals.Signal();

	this._onNavigate = new signals.Signal();

	this.prevView = null;
	this.currentView = null;
	this.nextView = null;

	this.init();

};

// Init views
ViewController.prototype.init = function() {
	
	// Create all views
	this.views = {
		'home': new Home(),
		'genre': new Genre(),
		'experience': new Experience(),
	};

};

// Bind
ViewController.prototype.bind = function() {
	
	// Listen to the router for navigate event
	app.router._onNavigate.add( this.onNavigate, this );

};

// On navigate
ViewController.prototype.onNavigate = function(e) {
	
	var view = e.view;

	console.log('## VC Navigate >> ', e);

	// Go to next view
	this.goTo( this.views[ view ] );

};

// Go to a view
ViewController.prototype.goTo = function( nextView ) {

	// If same view as current, stop it
	if ( nextView == this.currentView ){
		this.isBusy = false;
		return;
	}

	// Set busy state
	this.isBusy = true;

	// Save next view
	this.nextView = nextView;

	// If next view is not loaded yet
	if ( !this.nextView.loaded ){

		// Listen to on view load complete event
		this.nextView._onViewLoadComplete.add( this.onViewLoadComplete, this );

		// Load next view
		this.nextView.load();

		return;

	}

	// Remove on view load complete listener
	this.nextView._onViewLoadComplete.remove( this.onViewLoadComplete, this );

	// If it's the first view to be shown
	if ( this.currentView == null ){

		// Listen to onAnimateIn event
		this.nextView._onAnimateIn.add(this.onViewAnimateIn, this);

		// Animate next view in
		this.nextView.animateIn();

		// Dispatch navigation event
		this._onNavigate.dispatch({
			from: null,
			to: this.nextView
		});

		// Save prev view
		this.prevView = this.currentView;

		// Save new current view
		this.currentView = this.nextView;

		// Reset next view
		this.nextView = null;

		return;

	} else {

		// Animate out current view
		this.currentView.animateOut( this.nextView );

		// Listen to onAnimateIn event
		this.nextView._onAnimateIn.add( this.onViewAnimateIn, this );

		// Animate in next view
		this.nextView.animateIn( this.currentView );
		
		// Dispatch navigation event
		this._onNavigate.dispatch({
			from: this.currentView,
			to: this.nextView
		});

		// Save prev view
		this.prevView = this.currentView;

		// Save new current view
		this.currentView = this.nextView;

		// Reset next view
		this.nextView = null;

	}

};

ViewController.prototype.onViewLoadComplete = function(e) {
	
	this.nextView._onViewLoadComplete.remove( this.onViewLoadComplete );

	this._onViewLoadComplete.dispatch(e);

	if ( this.currentView == null ){

		app.mainLoader.animateOut();

	}

	this.goTo( this.nextView );	
	
};

// Once next view has been animated in
ViewController.prototype.onViewAnimateIn = function() {

	// Remove listener
	this.currentView._onAnimateIn.remove( this.onViewAnimateIn, this );

	// Set not busy anymore
	this.isBusy = false;

	// Bind navigation links again in case of new ones
	this.bindNavLinks();

};

// Bind navigation links
ViewController.prototype.bindNavLinks = function() {
	
	$('a').not('[target="_blank"]').off('click').on('click', $.proxy(this.onNavLinkClick, this));

};

// On nav link click
ViewController.prototype.onNavLinkClick = function(e) {

	// Prevent default link behavior
	e.preventDefault();

	// Get url of clicked link
	var url = $(e.currentTarget).attr('href');

	// If navigation is not busy and url is a valid link
	if ( !this.isBusy && url != '#' ){
	
		// Navigate to the new url		
		app.router.navigate( url );

	}

};
var Loader = function(xhr, maxConnections){

	this._onComplete = new signals.Signal();

	this.images = {};

	this.isComplete = false;

	this.fileTypes = {
		IMAGE: createjs.AbstractLoader.IMAGE,
		VIDEO: createjs.AbstractLoader.VIDEO,
		SOUND: createjs.AbstractLoader.SOUND,
		JS: createjs.AbstractLoader.JAVASCRIPT,
		JSON: createjs.AbstractLoader.JSON		
	};

	this.useXHR = false;
	this.maxConnections = 50;

	if ( xhr ) this.useXHR = xhr;
	if ( maxConnections ) this.maxConnections = maxConnections;

	this.init();

};

Loader.prototype.init = function() {

	if ( !this.queue ){

		this.queue = new createjs.LoadQueue( this.useXHR );

	}

	this.queue.on('complete', $.proxy(this.onQueueComplete, this));

};

Loader.prototype.onQueueComplete = function() {
	
	this.isComplete = true;

	this._onComplete.dispatch();

};

Loader.prototype.addImages = function( images ) {

	var self = this;

	$.each( images, function(id, img){

		self.queue.loadFile({
			id: id,
			src: img,
			type: self.fileTypes.IMAGE
		}, false);

	});

};

Loader.prototype.start = function() {
	
	this.queue.load();

};

Loader.prototype.pause = function() {
	
	this.queue.setPaused( true );

};

Loader.prototype.resume = function() {
	
	this.queue.setPaused( false );

};

Loader.prototype.clearQueue = function() {
	
	this.queue.removeAll();

};
var MainLoader = function(){

	this.id = 'loader';

	View.apply(this, arguments);

	this.images = {
		'logo': 'img/logo.png'
	};

};

MainLoader.prototype = Object.create(View.prototype);

MainLoader.prototype.animateIn = function() {
	
	View.prototype.animateIn.call(this);

	var self = this;

	if ( !this.loaded ) return;

	this.domElem.fadeIn(function(){
		self.onAnimateIn();
	});

};

MainLoader.prototype.animateOut = function() {
	
	View.prototype.animateOut.call(this);

	var self = this;

	this.domElem.fadeOut(function(){
		self.onAnimateOut();
	});

};
var Router = function(){

	// Create navigate event
	this._onNavigate = new signals.Signal();

	// Create routes
	this.createRoutes();

};

// Init router
Router.prototype.init = function() {

	var self = this;

	// Bind HistoryJS state change
	History.Adapter.bind(window, "statechange", function(e){

		self.onStateChange(e);

	});

	// Parse first token
	this.onStateChange();

};

// On state change
Router.prototype.onStateChange = function(e) {
	
	// Get token
	var token = this.getToken();

	// Parse token - test if it matches a route
	crossroads.parse( token );

};

// Create routes
Router.prototype.createRoutes = function() {

	var self = this;

	// Homepage
	crossroads.addRoute( '', function(){

		// Dispatch navigate event
		self._onNavigate.dispatch({
			view: 'home'
		});

		console.log( '## Navigate view home' );

	});

	// Genre
	crossroads.addRoute( '/genre' , function(){

		self._onNavigate.dispatch({
			view: 'genre'
		});

		console.log( '## Navigate genre experience' );

	});

	// Experience
	crossroads.addRoute( '/experience' , function(){

		self._onNavigate.dispatch({
			view: 'experience'
		});

		console.log( '## Navigate view experience' );

	});

};

// Navigate
Router.prototype.navigate = function( href ) {
	
	History.pushState(null, null, href);

};

// Get token from History hash
Router.prototype.getToken = function() {
	
	var token = History.getState().hash;

	if ( token.indexOf('?') != -1 ){

		var tokenSplit = token.split('?');
		return tokenSplit[0];

	} else {

		return token;

	}

};
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

	this.domElem.fadeIn(function(){
		self.onAnimateIn();
	});

};

Experience.prototype.animateOut = function() {
	
	View.prototype.animateOut.call(this);

	var self = this;

	this.domElem.fadeOut(function(){
		self.onAnimateOut();
	});

};
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

	this.domElem.fadeIn(function(){
		self.onAnimateIn();
	});

};

Genre.prototype.animateOut = function() {
	
	View.prototype.animateOut.call(this);

	var self = this;

	this.domElem.fadeOut(function(){
		self.onAnimateOut();
	});

};
var Home = function(){

	this.id = 'home';

	View.apply(this, arguments);

	this.images = {
		'home-background': 'img/home-bg.jpg'
	};

};

Home.prototype = Object.create(View.prototype);

Home.prototype.animateIn = function() {
	
	View.prototype.animateIn.call(this);

	var self = this;

	if ( !this.loaded ) return;

	this.domElem.fadeIn(function(){
		self.onAnimateIn();
	});

};

Home.prototype.animateOut = function() {
	
	View.prototype.animateOut.call(this);

	var self = this;

	this.domElem.fadeOut(function(){
		self.onAnimateOut();
	});

};