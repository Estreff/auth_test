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

      var auth = firebase.auth(); 
      var golfdb = firebase.database();
      var playerId = 1;
      var gameId = 1;

  // Sign-up Navbar to show the form

  $('#signup-nav').click(function(){
    $('#signup-form').removeClass('hide')
    $('#login-form').addClass('hide')
  });

  // Login Navbar to show login to system
  $('#login-nav').click(function(){
    $('#login-form').removeClass('hide')
    $('#signup-form').addClass('hide')

  });

  // Cancel Button on forms
  $('.cancel').click(function(){
    $('#login-form').addClass('hide')
    $('#signup-form').addClass('hide')
  });

  var userId = "";
  var email = "";
  var firstName = "";
  var lastName = "";
  var displayName = "";
  var loginPswd = "";
  var uid = "";
  var scorecard = [""];
  var gamesPlayed = [""]
  var scores = {
      hole01:"",
      hole02:"",
      hole03:"",
      hole04:"",
      hole05:"",
      hole06:"",
      hole07:"",
      hole08:"",
      hole09:"",
      hole10:"",
      hole11:"",
      hole12:"",
      hole13:"",
      hole14:"",
      hole15:"",
      hole16:"",
      hole17:"",
      hole18:""
  };
  

      golfdb.ref('playerCount').on('value', function(snapshot){
        playerId = snapshot.val().playerId;
      });
      



  // Add Login on click
    $('#login').click(function(event){
      // Get email and password
      email = $('#email-login').val().trim();
      console.log(email);
      loginPswd = $('#password-login').val().trim();
      console.log(loginPswd);

      event.preventDefault();

      // Login
      var promise = auth.signInWithEmailAndPassword(email, loginPswd);
      promise.catch(event => alert(event.message));

      // $('#player').text('Username');

      $('#email-login').val("")
      $('#password-login').val("")

           

    });

  // Add Signup on click 

    $('#createAcct').click(function(event){
      // Get email and password
      email = $('#email-input').val().trim();
      console.log(email);
      displayName = $('#displayName-input').val().trim();
      console.log(displayName);
      firstName = $('#fName-input').val().trim();
      console.log(firstName);
      lastName = $('#lName-input').val().trim();
      console.log(lastName);
      loginPswd = $('#password-input').val().trim();
      console.log(loginPswd);
      

      // Create User
      var promise = auth.createUserWithEmailAndPassword(email, loginPswd);
        promise.then(function(user) {
          // add Display Name
          user.updateProfile({displayName: displayName});
        })
        promise.catch(event => alert(event.message));

      event.preventDefault();

      var userRef = golfdb.ref("users");

      userRef.child(displayName).set({
        playerId: playerId,
        firstname: firstName,
        lastName: lastName,
        email: email,
        games: gamesPlayed,
        scores: scores,
        dataAdded: firebase.database.ServerValue.TIMESTAMP
      })


      $('#email-input').val("");
      $('#displayName-input').val("");
      $('#fName-input').val("");
      $('#lName-input').val("");
      $('#password-input').val("");



      playerId++
      golfdb.ref('playerCount').set({
        playerId:playerId
      });

    });

    // LogOut of Firebase
      $('#logout-nav').click(function(event){
        auth.signOut();
        window.location.replace('index.html');
      })

      function loggedIn() {
        
        $('#player').text(displayName);
        $('#logout-nav').removeClass('hide');
        $('#login-nav').addClass('hide');
        $('#signup-nav').addClass('hide');
        $('#login-form').addClass('hide')
        $('#signup-form').addClass('hide')
        $('#scorecard').removeClass('hide');
        $('#leaderboard').removeClass('hide');
        $('#games').removeClass('hide');
        $('#loginModal').modal('hide');
      }
  
    // Add a realtime listener

    firebase.auth().onAuthStateChanged(firebaseUser => {
      if(firebaseUser) {
        loggedIn();
        console.log('Valid User: ', firebaseUser);
        console.log('Username: ', firebaseUser.displayName);
        console.log('User UID: ', firebaseUser.uid);

 
        
      } else {
        console.log('not logged in');
        $('#logout-nav').addClass('hide');
        $('#login-nav').removeClass('hide');
        $('#signup-nav').removeClass('hide');
        $('#scorecard').addClass('hide');
        $('#leaderboard').addClass('hide');
        $('#games').addClass('hide');
      }
    });

      $('#signup-nav').on('shown.bs.modal', function () {
        $('#createModal').focus()
      })


    var gamedb = firebase.database().ref('/games');

    function createGame() {
      var user = firebase.auth().currentUser;
      console.log('Create currentUser: ', user);
      console.log('Create User UID: ', user.uid);
      console.log('Create User Display Name: ', user.displayName);
      var gameName = $('#gameName-input').val().trim();
      console.log('Game Name: ', gameName);
      var courseName = $('#courseName-input').val().trim();
      console.log('Course Name: ', courseName);
      var currentGame = {
        courseName: courseName,
        creator: {uid: user.uid, user: user.displayName},
        gameId: gameId,
        gameName: gameName
        // state: STATE.OPEN
      };
      console.log('GameId: ', gameId);
      // Push game information to Firebase
      gamedb.child('Game' + gameId).set(currentGame);
       // Add 1 to GameId
      gameId++
      // Push New GameId back to irebase
      golfdb.ref('gameCount').set({
        gameId:gameId
      });
      $('#gameName-input').val("");
      $('#courseName-input').val("");

    }
      golfdb.ref('gameCount').on('value', function(snapshot){
          gameId = snapshot.val().gameId;
        });

    $('#createGame').click(function() {
      createGame();
    })

    gamedb.on('child_added', function(snapshot){
    var gameDetail = snapshot.val();
    console.log(gameDetail);
    $('#openGames').append(`<tr><td>${gameDetail.gameName}</td><td>${gameDetail.courseName}</td><td>${gameDetail.creator.user}</td><td><button class="openGame btn btn-primary" id="Game${gameDetail.gameId}">Game ${gameDetail.gameId}</button></td><td><button class="btn btn-danger">X</button></td></tr>`);
  });


      $('#hole').text(hole);
      var hole = 1;
      var score = 0;
      var totalScore = 0;
      var holeNumber = 'Hole ' + hole;
      console.log('Hole Number: ',holeNumber);

      $('#nextHole').click(function(){
        var scoreData = $('#holeScore').val().trim();
        score = parseInt(scoreData,10);
        console.log(score);
        hole++; 
        $('#hole').text(hole);
        $('#holeScore').val("");
        totalScore = totalScore + score;
        console.log('Total Score: ', totalScore);
        $('#totalScore').text(totalScore);

        golfdb.ref('Scores').push({
          totalScore: totalScore,
          
            
           
        })

      })


var chatdb = firebase.database().ref("/chat");

function sendChatMessage() {
  messageField = $('#chatMessage').val().trim();
  console.log('Message: ', messageField);

  chatdb.push().set({
    name:firebase.auth().currentUser.displayName,
    message: messageField
  });
}
  
  $('#messageSubmit').click(function() {
    sendChatMessage();
  });

  $('#chatMessage').keypress(function(e) {
      if(e.which == 13) {
        sendChatMessage();
      }
  });  

  chatdb.on('child_added', function(snapshot){
    var message = snapshot.val();
    $('#messages').append(`<p>${message.name}: ${message.message}</p>`);
    $('#chatMessage').val("");
  });
});