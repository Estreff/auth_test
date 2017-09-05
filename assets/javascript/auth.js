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
  var gamesPlayed = [""];  

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
        $('#player').text(firebaseUser.displayName);
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

      if(gameName != "" && courseName != "") {
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

    }
      golfdb.ref('gameCount').on('value', function(snapshot){
          gameId = snapshot.val().gameId;
      });

    $('#createGame').click(function() {
      createGame();
    })

    function loadGames() {
      gamedb.on('child_added', function(snapshot){
          var user = firebase.auth().currentUser;
          var gameDetail = snapshot.val();
          console.log(gameDetail);
          var tableRow = $('<tr>');
          var gameNameCell = $('<td>' + gameDetail.gameName + '</td>');
          var gameDetailCell = $('<td>' + gameDetail.courseName + '</td>');
          var userCell = $('<td>' + gameDetail.creator.user + '</td>');
          var joinTableCell = $('<td>');
          var delTableCell = $('<td>')
          var joinButton = $('<button class="openGame btn btn-primary">' + 'Game ' + gameDetail.gameId + '</button>');
          var deleteButton = $('<button class="delete btn btn-danger">' + 'X' + '</button>');
            joinButton.attr('data-value', `Game${gameDetail.gameId}`);
              deleteButton.attr('data-value', `Game${gameDetail.gameId}`);
            $('#openGames').append(tableRow);
            tableRow.append(gameNameCell);
            tableRow.append(gameDetailCell);
            tableRow.append(userCell);
            tableRow.append(joinTableCell);
            joinTableCell.append(joinButton);
            tableRow.append(delTableCell);
            if(gameDetail.creator.user === user.displayName) { 
              delTableCell.append(deleteButton);
            } 
      });
    }
    loadGames();

/*******************************************
join-game logic
*******************************************/   

    var playerKey = localStorage.userKey;
    var gameKey = localStorage.gameKey;

    $(document).on('click', '.openGame', function() {
      console.log('join button clicked');
      console.log($(this).attr('data-value'))

      gameKey = $(this).attr('data-value');

      var gameRef = golfdb.ref('/games/' + gameKey + '/players');

      newPostRef = gameRef.push({
      name: firebase.auth().currentUser.displayName,
      holeOne: 0,
      holeTwo: 0,
      holeThree: 0,
      holeFour: 0,
      holeFive: 0,
      holeSix: 0,
      holeSeven: 0,
      holeEight: 0,
      holeNine: 0,
      holeTen: 0,
      holeEleven: 0,
      holeTwelve: 0,
      holeThirteen: 0,
      holeFourteen: 0,
      holeFifteen: 0,
      holeSixteen: 0,
      holeSeventeen: 0,
      holeEighteen: 0,
      holeNumber: 1
    });
    // grabbing unique id from push method above and storing it to localStorage
    localStorage.setItem('userKey', newPostRef.key);
    localStorage.setItem('gameKey', gameKey)

    // assigning unique id to variable to use to keep track of player data
    playerKey = localStorage.userKey;
    gameKey = localStorage.gameKey;
    
    console.log(playerKey);

    });

/*******************************************
END join-game logic
*******************************************/ 


    $(document).on('click', '.delete', function() {
      console.log('delete button clicked');
      console.log($(this).attr('data-value'))
      var deleteGame = $(this).attr('data-value');     
      var findGameID = firebase.database().ref(`games`);
      findGameID.child(deleteGame).remove();
      $('#openGames').html("");
      loadGames();      
    });

var chatdb = firebase.database().ref("/chat");

function sendChatMessage() {
  messageField = $('#chatMessage').val().trim();
  console.log('Message: ', messageField);

    if(messageField != "") {
      chatdb.push().set({
        name:firebase.auth().currentUser.displayName,
        message: messageField
      });
    }  
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
    $('#messages').append(`<p><b>${message.name}:</b> ${message.message}</p>`);
    $('#chatMessage').val("");
  });

//  Auto Scroll to Bottom on Chat - Not Currently working
    // var chatAutoScroll = $('#messages');
    // chatAutoScroll.scrollIntoView();


/****************************************
scorecard logic
****************************************/
  
  // getting data from player path in db using unique id
  golfdb.ref('/games/' + gameKey + '/players/' + playerKey).on('value', function(snap) {
      console.log('Player Key: ',playerKey)

      // getting current hole number from db to use in switch statement
      
      var holeNumber = snap.val().holeNumber;
      $('#hole-number').text(holeNumber);

    $('#submit').click(function() {
      // temporary solution to update hole number. was not updating without page reload
      location.reload()
      var playerRef = golfdb.ref('/games/' + gameKey + '/players/' + playerKey)
      // getting score input from user
      var score = Number($('#score').val());
     
        switch (holeNumber) {
          case 1:
            playerRef.update({
              holeOne: score,
              holeNumber: holeNumber + 1          
            })            
            break;

          case 2:
            playerRef.update({
              holeTwo: score,
              holeNumber: holeNumber + 1
            })       
            break;

          case 3:
            playerRef.update({
              holeThree: score,
              holeNumber: holeNumber + 1
            })    
            break;

          case 4:
            playerRef.update({
              holeFour: score,
              holeNumber: holeNumber + 1
            }) 
            break;

          case 5:
            playerRef.update({
              holeFive: score,
              holeNumber: holeNumber + 1
            }) 
            break;

          case 6:
            playerRef.update({
              holeSix: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 7:
            playerRef.update({
              holeSeven: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 8:
            playerRef.update({
              holeEight: score,
              holeNumber: holeNumber + 1
            })  
            break;

          case 9:
            playerRef.update({
              holeNine: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 10:
            playerRef.update({
              holeNine: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 11:
            playerRef.update({
              holeNine: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 12:
            playerRef.update({
              holeNine: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 13:
            playerRef.update({
              holeNine: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 14:
            playerRef.update({
              holeNine: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 15:
            playerRef.update({
              holeNine: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 16:
            playerRef.update({
              holeNine: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 17:
            playerRef.update({
              holeNine: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 18:
            playerRef.update({
              holeNine: score,
              holeNumber: 0
            })
            break;

        }
      
        // setting scorecard back to blank after submit
        var score = Number($('#score').val(''));

    })
      
    }, function(errorObject) {
      console.log('the read failed ' + errorObject.code)
    });


  /*****************************************
  leaderboard logic
  *****************************************/

  // adding player to leaderboard as soon as they join the game. it is also updating their hole and score...i think
  golfdb.ref('/games/' + gameKey + '/players').on('child_added', function(snap) {
    
    var holeScores = [snap.val().holeOne, snap.val().holeTwo, snap.val().holeThree, snap.val().holeFour, snap.val().holeFour, snap.val().holeFive, snap.val().holeSix, snap.val().holeSeven, snap.val().holeEight, snap.val().holeNine, snap.val().holeTen, snap.val().holeEleven, snap.val().holeTwelve, snap.val().holeThirteen, snap.val().holeFourteen, snap.val().holeFifteen, snap.val().holeSixteen, snap.val().holeSeventeen, snap.val().holeEighteen]
    
    var total = 0;

    for (var i = 0; i < holeScores.length; i++) {
      total += holeScores[i];
    }

    var newPlayer = snap.val().name
    var score = $('<td id="score">');
    var thru = $('<td id="thru">');
    var tableRow = $('<tr>');
    score.text(total);
    thru.text(snap.val().holeNumber - 1);
    
    
    $('#tbody').append(tableRow);
    tableRow.append('<td>' + newPlayer);
    tableRow.append(score);
    tableRow.append(thru);

  })

});

   



