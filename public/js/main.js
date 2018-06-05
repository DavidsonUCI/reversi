/* functions for general use */

/* This function returns the value associated with 'whichParam' on the URL */

function getURLParameters(whichParam) {
	var pageURL = window.location.search.substring(1);
	var pageURLVariables = pageURL.split('&');
	for(var i=0; i<pageURLVariables.length; i++){
		var paramaterName = pageURLVariables[i].split('=');
		if (paramaterName[0] == whichParam) {
			return paramaterName[1];
		}
	}
}
/* Get username info from the url */
var username = getURLParameters('username');
if ('undefined' == typeof username || !username){
	username = 'Anonymous_'+Math.random();
}
/* Get chat_room info from the url */
var chat_room = getURLParameters('game_id');
if('undefined' == typeof chat_room || !chat_room){
   chat_room = 'lobby';
}

/* Connect to the socket server */
var socket = io.connect();

/* What to do when the server sends me a log message */
socket.on('log', function(array){
	console.log.apply(console,array);
});

/* What to do when the server responds that someone joined a room */
/* Join room response */
socket.on('join_room_response', function(payload){
	if (payload.result === 'fail'){
		alert(payload.message);
		return;
	}
	/* If we are being notified that we joined the room, then ignore it */
	if (payload.socket_id === socket.id) {
		return;
	}

	/* If somone joined the new room then add a new row to the lobby table */
	var dom_element = $('.socket_'+payload.socket_id);
	/* If we don't already have an entry for this person */
	if (dom_element.length === 0) {
		var nodeA = $('<div></div>');
		nodeA.addClass('socket_'+payload.socket_id);

		var nodeB = $('<div></div>');
		nodeB.addClass('socket_'+payload.socket_id);

		var nodeC = $('<div></div>');
		nodeC.addClass('socket_'+payload.socket_id);

		nodeA.addClass('w-100');

		nodeB.addClass('col-9 text-right');
		nodeB.append('<h4>'+payload.username+'</h4>');

		nodeC.addClass('cold-3 text-left');
		var buttonC = makeInviteButton(payload.socket_id);
		nodeC.append(buttonC);

		nodeA.hide();
		nodeB.hide();
		nodeC.hide();
		$('#players').append(nodeA,nodeB,nodeC);
		nodeA.slideDown(1000);
		nodeB.slideDown(1000);
		nodeC.slideDown(1000);

	}
  /* if we have seen the person who just joined (something weird happend) */
	else {
		uninvite(payload.socket_id);
		var buttonC = makeInviteButton(payload.socket_id);
		$('.socket_'+payload.socket_id+' button' ).replaceWith(buttonC);
		dom_element.slideDown(1000);
	}

	/* Manage the message that a new player has joined */
	var newHTML = '<p>'+payload.username+' just entered the room</p>';
	var newNode = $(newHTML);
	newNode.hide();
	$('#messages').prepend(newNode);
	newNode.slideDown(1000);



});

/* What to do when the server says someone has left a room */
socket.on('player_disconnected', function(payload){
	console.log('*** Client Log Message: "disconnected" payload: '+JSON.stringify(payload));

	if (payload.result === 'fail') {
		alert(payload.message);
		return;
	}

	/* if were are being notified that we left the room, then ignore it */
	if (payload.socket_id === socket.id) {
		return;
	}

	/* if someone left the room then animate out all their content */
	var dom_elements = $('.socket_'+payload.socket_id);

	/* is something exists */
	if (dom_elements.length !== 0){
		dom_elements.slideUp(1000);
	}

	/* manage the message that a player has left */
	var newHTML = '<p>'+payload.username+' has left the room</p>';
	var newNode = $(newHTML);
	newNode.hide();
	$('#messages').prepend(newNode);
	newNode.slideDown(1000);
});

/* Leave room response */
socket.on('player_disconnected', function(payload){

	if (payload.result === 'fail'){
		alert(payload.message);
		return;
	}

	/*If we are being notified that we joined the room, then ignore it */
	if (payload.socket_id === socket.id) {
		return;
	}

  /*If someone left then animate out all of their content */
	var dom_element = $('.socket_'+payload.socket_id);

	/* If something exists */
	if (dom_elements.length !== 0) {
		dom_elements.slideUp(1000);
	}

	/* Manage the message that a new player has left */
	var newHTML = '<p>'+payload.username+' has left the lobby</p>';
	var newNode = $(newHTML);
	newNode.hide();
	$('#messages').append(newNode);
	newNode.slideDown(1000);

});


/* Send an invite message to the server */
function invite(who) {
	var payload = {};
	payload.requested_user = who;

	console.log('*** Client Log Message: "invite" payload: '+JSON.stringify(payload));
	socket.emit('invite', payload);
}

/* Handle a response after sending an invite message to the server */
socket.on('invite_response', function(payload){
	if (payload.result === 'fail'){
		alert(payload.message);
		return;
	}
	var newNode = makeInvitedButton(payload.socket_id);
	$('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

/* Handle a notification that we have been invited */
socket.on('invited', function(payload){
	if (payload.result === 'fail'){
		alert(payload.message);
		return;
	}
	var newNode = makePlayButton(payload.socket_id);
	$('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});


/* Send an uninvite message to the server */
function uninvite(who) {
	var payload = {};
	payload.requested_user = who;

	console.log('*** Client Log Message: "uninvite" payload: '+JSON.stringify(payload));
	socket.emit('uninvite', payload);
}

/* Handle a response after sending an uninvite message to the server */
socket.on('uninvite_response', function(payload){
	if (payload.result === 'fail'){
		alert(payload.message);
		return;
	}
	var newNode = makeInviteButton(payload.socket_id);
	$('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});

/* Handle a notification that we have been uninvited */
socket.on('uninvited', function(payload){
	if (payload.result === 'fail'){
		alert(payload.message);
		return;
	}
	var newNode = makeInviteButton(payload.socket_id);
	$('.socket_'+payload.socket_id+' button').replaceWith(newNode);
});


/* Send game_start message to the server */
function game_start(who) {
	var payload = {};
	payload.requested_user = who;

	console.log('*** Client Log Message: "game_start" payload: '+JSON.stringify(payload));
	socket.emit('game_start', payload);
}

/* Handle a notification that we have been engaged */
socket.on('game_start_response', function(payload){
	if (payload.result === 'fail'){
		alert(payload.message);
		return;
	}
	var newNode = makeEngagedButton(payload.socket_id);
	$('.socket_'+payload.socket_id+' button').replaceWith(newNode);

	/* Jump to a new page */
	window.location.href = 'game.html?username=' + username + '&game_id='+payload.game_id;
});

/* Setting up the message variable with content */
function send_message(){
	var payload = {};
	payload.room = chat_room;
	payload.message = $('#send_message_holder').val();
	console.log('*** Client Log Message: \'send_message\' payload: '+JSON.stringify(payload));
	socket.emit('send_message', payload);
	$('#send_message_holder').val('');
}

/* Send message response */
socket.on('send_message_response', function(payload){
	if (payload.result == 'fail'){
		alert(payload.message);
		return;
	}
	var newHTML = '<p><b>'+payload.username+' says:</b> '+payload.message+'</p>';
	var newNode = $(newHTML);
	newNode.hide();
	$('#messages').prepend(newNode);
	newNode.slideDown(1000);
});

/* Make an invite button */
function makeInviteButton(socket_id) {

	var newHTML = '<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>';
	var newNode = $(newHTML);
	newNode.click(function(){
		invite(socket_id);
	});
	return(newNode);

}

/* Make an invited button */
function makeInvitedButton(socket_id) {

	var newHTML = '<button type=\'button\' class=\'btn btn-primary\'>Invited</button>';
	var newNode = $(newHTML);
	newNode.click(function(){
		uninvite(socket_id);
	});
	return(newNode);

}

/* Make a play button */
function makePlayButton(socket_id) {

	var newHTML = '<button type=\'button\' class=\'btn btn-success\'>Play</button>';
	var newNode = $(newHTML);
	newNode.click(function(){
		game_start(socket_id);
	});
	return(newNode);

}

/* Make an engage button */
function makeEngagedButton() {

	var newHTML = '<button type=\'button\' class=\'btn btn-danger\'>Engaged</button>';
	var newNode = $(newHTML);
	return(newNode);

}

$(function(){
	var payload = {};
	payload.room = chat_room;
	payload.username = username;

	console.log('*** Client Log Message: \'join_room\ payload: ' + JSON.stringify(payload));
	socket.emit('join_room', payload);

	$('#quit').append('<a href="lobby.html?username='+username+'" class="btn btn-danger btn-default active" role="button" aria-pressed="true">Quit</a>');
});

/* Code for the board specifically */
var old_board = [
	['?','?','?','?','?','?','?','?',],
	['?','?','?','?','?','?','?','?',],
	['?','?','?','?','?','?','?','?',],
	['?','?','?','?','?','?','?','?',],
	['?','?','?','?','?','?','?','?',],
	['?','?','?','?','?','?','?','?',],
	['?','?','?','?','?','?','?','?',],
	['?','?','?','?','?','?','?','?',]
];

var my_color = ' ';

socket.on('game_update', function(payload){
	console.log('*** Client Log Message: \'game_update\' \n\tpayload: '+JSON.stringify(payload));
	/*Check for a good board update */
	if (payload.result === 'fail') {
		console.log(payload.message);
		window.location.href = 'lobby.html?username='+username;
		return;
	}
	/* Check for a good board in payload */
	var board = payload.game.board;
	if ('undefined' === typeof board || !board){
		console.log('Internal error: received a malformed board update from the server');
		return;
	}

	/* Update my color */
	if (socket.id === payload.game.player_white.socket) {
		my_color = 'white';
	}
	else if (socket.id === payload.game.player_black.socket) {
		my_color = 'black';
	}
	else {
		/* Something weird is going on, like three people playing at once */
		/* Send client back to the lobby */
		window.location.href = 'lobby.html?username='+username;
		return;
	}

	$('#my_color').html('<h5 id="my_color">('+my_color+')</h5>');
  $('#my_color').append('<h5>It is '+payload.game.whose_turn+'\'s turn</h5>');


/* Versus display */
/* My username */
  $('#username').html('<h4 id="username">'+username+'</h4>');
/* My opponent's username */
  $('#opponent').html('<h4 id="opponent">'+opponent+'</h4>');


	/* Animate changes to the board */
	var blacksum = 0;
	var whitesum = 0;
	var row,column;
	for(row=0; row<8; row++){
		for (column=0; column<8; column++){
			if (board[row][column] === 'b'){
				blacksum++;
			}
			if (board[row][column] === 'w'){
				whitesum++;
			}

			/* If a board space has changed */
			if (old_board[row][column] !== board[row][column]){
				if (old_board[row][column] === '?' && board[row][column] === ' ') {
					$('#'+row+'_'+column).html('<div class="emptyToken"></div>'/*'<img src="assets/images/empty.gif" alt="empty square"/>'*/);
				}
				else if (old_board[row][column] === '?' && board[row][column] === 'w') {
					$('#'+row+'_'+column).html('<div class="whiteToken fade-in"><div class="whiteTokenShadow"></div></div>'/*''<img src="assets/images/empty_to_white.gif" alt="white square">'*/);
				}
				else if (old_board[row][column] === '?' && board[row][column] === 'b'){
					$('#'+row+'_'+column).html('<div class="blackToken fade-in"><div class="blackTokenHighlight"></div></div>'/*'<img src="assets/images/empty_to_black.gif" alt="black square">'*/);
				}
				else if (old_board[row][column] === ' ' && board[row][column] === 'w') {
					$('#'+row+'_'+column).html('<div class="whiteToken fade-in"><div class="whiteTokenShadow"></div></div>'/*'<img src="assets/images/empty_to_white.gif" alt="white square">'*/);
				}
				else if (old_board[row][column] === ' ' && board[row][column] === 'b'){
					$('#'+row+'_'+column).html('<div class="blackToken fade-in"><div class="blackTokenHighlight"></div></div>'/*'<img src="assets/images/empty_to_black.gif" alt="empty square">'*/);
				}
        else if (old_board[row][column] === 'w' && board[row][column] === ' ') {
					$('#'+row+'_'+column).html('<div class="emptyToken"></div>'/*'<img src="assets/images/empty_to_white.gif" alt="white square">'*/);
				}
				else if (old_board[row][column] === 'b' && board[row][column] === ' '){
					$('#'+row+'_'+column).html('<div class="emptyToken"></div>'/*'<img src="assets/images/empty_to_black.gif" alt="empty square">'*/);
				}
        else if (old_board[row][column] === 'w' && board[row][column] === 'b') {
					$('#'+row+'_'+column).html(/*'<div class="blackToken fade-in"><div class="blackTokenHighlight"></div></div>'*/'<img src="assets/images/white_to_black.gif" alt="white square"/>');
				}
				else if (old_board[row][column] === 'b' && board[row][column] === 'w'){
					$('#'+row+'_'+column).html(/*'<div class="whiteToken fade-in"><div class="whiteTokenShadow"></div></div>'*/'<img src="assets/images/black_to_white.gif" alt="black square"/>');
				}
				else {
					$('#'+row+'_'+column).html('<div class="error"></div>');
				}
    }
    /*video 25 */
    /* Set up interactivity */
		$('#'+row+'_'+column).off('click');
    $('#'+row+'_'+column).removeClass('hovered_over');

    if(payload.game.whose_turn === my_color){
          if(payload.game.legal_moves[row][column] === my_color.substr(0,1)){
					         $('#'+row+'_'+column).addClass('hovered_over');
					          $('#'+row+'_'+column).click(function(r,c){
						                    return function(){
							                           var payload = {};
							                                  payload.row = r;
							                                  payload.column = c;
							                                  payload.color = my_color;
							                                  console.log('*** Client Log Message: \'Play_token\' payload: '+JSON.stringify(payload));
							                                  socket.emit('play_token', payload);
						                              };
					                       }(row,column));
				}
			}
		}
	}
  /*end video 25*/
	$('#blacksum').html(blacksum);
	$('#whitesum').html(whitesum);

	old_board = board;
});

socket.on('play_token_response', function(payload){
	console.log('*** Client Log Message: \'play_token_response\'\n\tpayload: '+JSON.stringify(payload));
	/* Check for a good play_token_response */
	if (payload.result === 'fail') {
		console.log(payload.message);
		alert(payload.message);
		return;
	}
});

socket.on('game_over', function(payload){
	console.log('*** Client Log Message: \'game_over\'\n\tpayload: '+JSON.stringify(payload));
	/* Check for a good play_token_response */
	if (payload.result === 'fail') {
		console.log(payload.message);
		alert(payload.message);
		return;
	}

	/* Jump to a new page */
	$('#game_over').html('<h1>Game Over</h1><h2>'+payload.who_won+' won!</h2>');
	$('#game_over').append('<br><a href="lobby.html?username='+username+'" class="btn btn-success btn-lg active" role="button" aria-pressed="true">Return to the lobby</a>');
});
