/**
 * afterglow - An easy to integrate HTML5 video player with lightbox support.
 * @link http://afterglowplayer.com
 * @license MIT
 */

'use strict';

import Player from './components/Player';
import Lightbox from './components/Lightbox';
import LightboxTrigger from './components/LightboxTrigger';
import DOMElement from './lib/DOMElement';


class Afterglow {

	constructor(){
		/**
		 * Will hold the players in order to make them accessible
		 */
		this.players = [];
		/**
		 * Will hold the trigger elements which will launch lightbox players
		 */
		this.lightboxtriggers = [];
	}

	/**
	 * Initiate all players that were found and need to be initiated
	 * @return void
	 */
	init(){
		// Run some preparations
		this.configureVideoJS();

		// initialize regular players
		this.initVideoElements();

		// prepare Lightboxes
		this.prepareLightboxVideos();
	}

	/**
	 * Looks for players to initiate and creates AfterglowPlayer objects based on those elements
	 * @return void
	 */
	initVideoElements(){
		// Get players including sublime fallback
		var players = document.querySelectorAll("video.afterglow,video.sublime");

		// Initialize players
		for (var i = 0; i < players.length; i++){
			let videoelement = new DOMElement(players[i]);
			var player = new Player(videoelement);
			player.init();
			this.players.push(player);
		}
	}

	/**
	 * Prepares all found trigger elements and makes them open their corresponding players when needed
	 * @return void
	 */
	prepareLightboxVideos(){
		// Get lightboxplayers including sublime fallback
		var lightboxtriggers = document.querySelectorAll("a.afterglow,a.sublime");
		
		// Initialize players launching in a lightbox
		for (var i = 0; i < lightboxtriggers.length; i++){
			let trigger = new LightboxTrigger(lightboxtriggers[i]);

			this.bindLightboxTriggerEvents(trigger);

			this.lightboxtriggers.push(trigger);
		}
	}

	/**
	 * Binds some elements for lightbox triggers.
	 * @param  {object} the trigger object
	 * @return void
	 */
	bindLightboxTriggerEvents(trigger){
		trigger.on('trigger',() => {
			this.consolidatePlayers;
		});
		trigger.on('close',() => {
			this.consolidatePlayers();
		});
	}

	/**
	 * Returns the the players object if it was initiated yet
	 * @param  string The player's id
	 * @return boolean false or object if found
	 */
	getPlayer(playerid){
		// Try to get regular player
	 	for (var i = this.players.length - 1; i >= 0; i--) {
			if(this.players[i].id === playerid){
	 			return this.players[i].getPlayer();
			}
	 	};
		// Else try to find lightbox player
	 	for (var i = this.lightboxtriggers.length - 1; i >= 0; i--) {
	 		if(this.lightboxtriggers[i].playerid === playerid){
	 			return this.lightboxtriggers[i].getPlayer();
			}
	 	};
	 	return false;
	}

	/**
	 * Should destroy a player instance if it exists. Lightbox players should be just closed.
	 * @param  {string} playerid  The player's id
	 * @return void
	 */
	destroyPlayer(playerid){
		// Look for regular players
	 	for (var i = this.players.length - 1; i >= 0; i--) {
	 		if(this.players[i].id === playerid){
	 			this.players[i].destroy();
	 			this.players.splice(i,1);
	 			return true;
	 		}
	 	};
	 	// Else look for an active lightbox
	 	for (var i = this.lightboxtriggers.length - 1; i >= 0; i--) {
	 		if(this.lightboxtriggers[i].playerid === playerid){
	 			this.closeLightbox();
	 			return true;
	 		}
	 	};
	 	return false;
	}

	/**
	 * Closes the lightbox and resets the lightbox player so that it can be reopened
	 * @return void
	 */
	closeLightbox(){
		for (var i = this.lightboxtriggers.length - 1; i >= 0; i--) {
			this.lightboxtriggers[i].closeLightbox();
		};
		this.consolidatePlayers();
	}

	/**
	 * Consolidates the players container and removes players that are not alive any more.
	 * @return {[type]} [description]
	 */
	consolidatePlayers(){
		for (var i = this.players.length - 1; i >= 0; i--) {
			if(this.players[i] !== undefined && !this.players[i].alive){
				delete this.players[i];
				
				// Reset indexes
				this.players = this.players.filter(() =>{return true});
			}
		};
	}

	/**
	 * Run some configurations on video.js to make it work for us
	 * @return void
	 */
	configureVideoJS(){
		// Disable tracking
		window.HELP_IMPROVE_VIDEOJS = false;	
	}
}

export default Afterglow;