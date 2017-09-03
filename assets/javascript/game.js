$(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAbJX4QcF-KzWZrahes6M3iKgDBI_Jg6os",
    authDomain: "golf-tourny-scoring.firebaseapp.com",
    databaseURL: "https://golf-tourny-scoring.firebaseio.com",
    projectId: "golf-tourny-scoring",
    storageBucket: "golf-tourny-scoring.appspot.com",
    messagingSenderId: "110343822868"
  };
  firebase.initializeApp(config);

var gamedb = firebase.database().ref('/games');

    function createGame() {
    
    	var user = firebase.auth().currentUser;
    	console.log('Create User: ', user);
    	var currentGame = {
    		creator: {uid: user.uid, user: user.displayName},
    		state: STATE.OPEN
    	};
    	gamedb.push().set(currentGame);
    }

    $('#createGame').click(function() {
    	createGame();
    })

    function joinGame(key) {
    	var user = firebase.auth().currentUser;
    	var gameRef = ref.child(key);
    	gameRef.transaction(function(game) {
    		if(!game.joiner) {
    			game.state = STATE.JOINED;
    			game.joiner = {uid: user.uid, user: user.displayName}
    		}
    		return game;
    	})

    }

    var openGames = gamedb.orderByChild('state').equalTo(STATE.OPEN);
    openGames.on('child-added', function(snapshot) {
    	var data = snapshot.val();

    	if(data.creator.uid != firebase.auth.currentUser.uid) {
    		addJoinGameButton(snapshot.key, data);
    	}
    })

    openGames.on('child-removed', function(snapshot) {
    	var item = $('#' + snapshot.key);
    	if (item) {
    		item.remove();
    	}
    })




    
 });



