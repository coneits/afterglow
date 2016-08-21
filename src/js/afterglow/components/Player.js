/**
 * afterglow - An easy to integrate HTML5 video player with lightbox support.
 * @link http://afterglowplayer.com
 * @license MIT
 */

'use strict';

import Config from './Config';
import Util from '../lib/Util';

class Player {

	constructor(videoelement){
		// Passing to setup for testability
		this.setup(videoelement);
	}

	/**
	 * Sets the player up and prepares the video element
	 * @param  {DOMElement object} videoelement 	The videoelement which shall be transformed
	 */
	setup(videoelement){
		this.videoelement = videoelement;
		this.id = videoelement.getAttribute('id');

		// Prepare needed dependencies
		this.config = new Config(videoelement, this.getSkinName());
		this.util = new Util();

		// Prepare the element
		this.prepareVideoElement();

		// Set an activity variable to be able to detect if the player can be deleted
		this.alive = true;
	}

	/**
	 * Shortcut method which will apply some classes and parameters to the video element via some other methods
	 * @return
	 */
	prepareVideoElement(){
		this.applyDefaultClasses();
		this.applyParameters();

		if(this.util.isYoutubePlayer(this.videoelement)){
			this.applyYoutubeClasses();
		}
	}

	/**
	 * Initializes the player and applies all needed stuff.
	 * @param  {function} _callback   Callback function to be called when the player is ready
	 * @return {void}
	 */
	init(_callback){
		let videoelement = this.videoelement.node;
		let options = this.config.options;
		
		// initiate videojs and do some post initiation stuff
		var player = window.videojs(videoelement, options).ready(function(){

			// Enable hotkeys
			this.hotkeys({
				enableFullscreen: false,
				enableNumbers: false,
				enableVolumeScroll: false
			});

			// Set initial volume if needed
			if(videoelement.getAttribute('data-volume') !== null){
				var volume = parseFloat(videoelement.getAttribute('data-volume'));
				this.volume(volume);
			}

			// Add TopControBar
			this.addChild("TopControlBar");

			this.on('play', () => {
				// Stop all other players if there are any on play
				for( let key in window.videojs.players ) {
				    if(window.videojs.getPlayers()[key] !== null && window.videojs.getPlayers()[key].id_ !== this.id_){
				    	window.videojs.getPlayers()[key].pause();
				    }
				}
			});

			// Launch the callback if there is one
			if(typeof _callback == "function"){
				_callback(this);
			}
		});
		this.videojs = player;
	}

	/**
	 * Applies the default classes to the videoelement and removes sublime's class
	 * @return {void}
	 */
	applyDefaultClasses(){
		// Add some classes
		this.videoelement.addClass("video-js");
		this.videoelement.addClass("afterglow");

		let classNames = this.config.getSkinClass().split(" ");
		classNames.forEach((className) => {
			this.videoelement.addClass(className);
		});

		// Remove sublime stuff
		this.videoelement.removeClass("sublime");
		
		// Check for IE9 - IE11
		let ie = this.util.ie().actualVersion;
		if(ie >= 8 && ie <= 11){ // @see afterglow-lib.js
			this.videoelement.addClass('vjs-IE');
		}
	}

	/**
	 * Applies basic parameters to the videoelement to make it well usable for video.js
	 * @return {void}
	 */
	applyParameters(){
		// Make lightboxplayer not overscale
		if(this.videoelement.getAttribute("data-overscale") == "false"){
			this.videoelement.setAttribute("data-maxwidth",this.videoelement.getAttribute("width"));
		}

		// Apply some responsive stylings
		if(this.videoelement.getAttribute("data-autoresize") === 'fit' || this.videoelement.hasClass("responsive")){
			this.videoelement.addClass("vjs-responsive");
			let ratio = this.calculateRatio();
			this.videoelement.node.style.paddingTop = (ratio * 100)+"%";
			this.videoelement.removeAttribute("height");
			this.videoelement.removeAttribute("width");
			this.videoelement.setAttribute("data-ratio",ratio);
		}
	}

	/**
	 * Applies all needed classes to the videoelement in order to provide proper youtube playback
	 * @return {void}
	 */
	applyYoutubeClasses(){
		this.videoelement.addClass("vjs-youtube");
		
		// Check for native playback
		if(document.querySelector('video').controls){
			this.videoelement.addClass("vjs-using-native-controls");
		}
		// Add iOS class for iOS.
		if(/iPad|iPhone|iPod|iOS/.test(navigator.platform)){
			this.videoelement.addClass("vjs-iOS");
		}

		// Check for IE9 - IE11
		let ie = this.util.ie().actualVersion;
		if(ie >= 8 && ie <= 11){ // @see afterglow-lib.js
			this.videoelement.addClass("vjs-using-native-controls");
		}
	}

	/**
	 * Calculates the players ratio based on the given value or on width/height
	 * @return {float}
	 */
	calculateRatio(){
		if(this.videoelement.getAttribute("data-ratio")){
			var ratio = this.videoelement.getAttribute("data-ratio");
		}
		else if(!this.videoelement.getAttribute("height") || !this.videoelement.getAttribute("width"))
		{
			console.error("Please provide witdh and height for your video element.");
			return 0;
		}
		else{
			var ratio = this.videoelement.getAttribute("height") / this.videoelement.getAttribute("width");
		}
		return parseFloat(ratio);
	}

	/** 
	 * Gets the current player's skin name for further use in css variables and so on.
	 * @return {string}
	 */
	getSkinName(){
		if(this.videoelement.getAttribute('data-skin')){
			return this.videoelement.getAttribute('data-skin');
		}
		return 'afterglow';
	}

	/**
	 * Destroys the player instance and disposes it.
	 * @return {void}
	 */
	destroy(){
		if(!this.videojs.paused()){
			this.videojs.pause();
		}
		if(this.videojs.isFullscreen()){
			this.videojs.exitFullscreen();
		}
		this.videojs.dispose();
		this.alive = false;
	}
	
	/**
	 * Getter for the player
	 */
	getPlayer(){
		return this.videojs;
	}
}

export default Player;