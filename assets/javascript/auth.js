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

  // Global variables for Creating Account
  var userId = "";
  var email = "";
  var firstName = "";
  var lastName = "";
  var displayName = "";
  var loginPswd = "";
  var uid = "";
  var scorecard = [""];
  var joinedGame = "";
  var gamesPlayed = [""];  

  // Get the Player ID from Firebase
      golfdb.ref('playerCount').on('value', function(snapshot){
        playerId = snapshot.val().playerId;
      });

  // Show Login Modal
      
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
      promise.catch(event => $('#loginError').text(event.message).removeClass('hide'));

      // Clear input fields of sign-in form
        $('#email-login').val("");
        $('#password-login').val("");
      });

    // Cancel Button on Login Screen
    $('#loginCancel').click(function() {
      $('#loginError').text("").addClass('hide');
    });

    // Show Create Account Modal
    $('#signup-nav').on('shown.bs.modal', function () {
      $('#createModal').focus()
    })

  // Add Signup on click 
    $('#createAcct').click(function(event) {
    
      // Get User Information
      displayName = $('#displayName-input').val().trim();
      console.log('Display Name: ', displayName);
      email = $('#email-input').val().trim();
      console.log('Email Address: ', email);
      firstName = $('#fName-input').val().trim();
      console.log('First Name: ', firstName);
      lastName = $('#lName-input').val().trim();
      console.log('Last Name', lastName);
      loginPswd = $('#password-input').val().trim();
      console.log('Password: ', loginPswd);

      // Checks to see if Display name is present
      // TODO:  Need to verify that the user doesn't exist
      if(displayName == "") {
        // Writes Error Message into Alert Box that shows no Display Name
        $('#createError').text('Display Name Required').removeClass('hide');
        console.log('Display Name needed');
      } else {
      // Inserts Email and Password into Autentiation function
      firebase.auth().createUserWithEmailAndPassword(email, loginPswd)
        .then(function(user) {
            user.updateProfile({displayName: displayName});
            // Defines Additional Information to Firebase under Users
            var ref = firebase.database().ref().child("users");
            var data = {
                email: email,
                firstname: firstName,
                lastName: lastName,
                uid:user.uid,
                playerId: playerId,
                joinedGame: joinedGame,
                games: gamesPlayed,
                dataAdded: firebase.database.ServerValue.TIMESTAMP
            }
            // Sends Additional Information or Returns Error Message
            ref.child(displayName).set(data).then(function(ref) {//use 'child' and 'set' combination to save data in your own generated key
                console.log("Saved");
            }, function(error) {
                console.log(error); 
            });

              // Clear Input fields
                $('#displayName-input').val("");
                $('#email-input').val("");
                $('#fName-input').val("");
                $('#lName-input').val("");
                $('#password-input').val("");

              // Add One to playerId and updates Friebase with that number
                playerId++
                golfdb.ref('playerCount').set({
                  playerId:playerId
                });
        })

        // If error happens on account creation and returns and updated Alert
        .catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;
            // Writes Error Message into Alert Box that shows current Error
            $('#createError').text(errorMessage).removeClass('hide');
            console.log(error);
        });
      }
    });

    // Cancel Button on Create Account 
      $('#createCancel').click(function() {
        $('#createError').text("").addClass('hide');
      });

    // LogOut of Firebase
      $('#logout').click(function(event){
        auth.signOut();
        window.location.replace('index.html');
      })

      function getGameState() {
        if (localStorage.userKey) {
          $('#scorecard').removeClass('hide');
          $('#leaderboard').removeClass('hide');
          $('#games').addClass('hide');
        } else {
          $('#scorecard').addClass('hide');
          $('#leaderboard').addClass('hide');
        }
      }

      // What happens when someone logs in
      function loggedIn() {       
        $('#logout-nav').removeClass('hide');
        $('#login-nav').addClass('hide');
        $('#signup-nav').addClass('hide');
        $('#login-form').addClass('hide');
        $('#signup-form').addClass('hide');
        $('#games').removeClass('hide');
        $('#scorecard').removeClass('hide');
        $('#leaderboard').removeClass('hide');
        $('#player').removeClass('hide');
        // $("#autocomplete").focus();
        
        $('#loginModal').modal('hide');
        $('#createModal').modal('hide');
        getGameState();
        loadGames();
      }

      // What happens when someone logs out
      function loggedOut() {
        console.log('not logged in');
        $('#logout-nav').addClass('hide');
        $('#login-nav').removeClass('hide');
        $('#signup-nav').removeClass('hide');
        $('#scorecard').addClass('hide');
        $('#leaderboard').addClass('hide');
        $('#games').addClass('hide');
        $('#player').addClass('hide');
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
        loggedOut();
      }
    });

    // Create Game with Game Name & Course Name
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
          console.log('User Information:', user)
          var gameDetail = snapshot.val();
          console.log('Game Detail:', gameDetail);
          var tableRow = $('<tr>');
          var gameNameCell = $('<td>' + gameDetail.gameName + '</td>');
          var gameDetailCell = $('<td>' + gameDetail.courseName + '</td>');
          var userCell = $('<td class="hidden-xs">' + gameDetail.creator.user + '</td>');
          var joinTableCell = $('<td>');
          var delTableCell = $('<td class="hidden-xs">')
          // var joinButton = $('<button class="openGame btn btn-primary">' + 'Game ' + gameDetail.gameId + '</button>');
          var joinButton = $('<button class="openGame btn btn-primary">Join</button>');
          var deleteButton = $('<button class="delete btn btn-danger">' + 'X' + '</button>');
            joinButton.attr('data-value', `Game${gameDetail.gameId}`);
            joinButton.attr('data-name', gameDetail.gameName);
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

/*******************************************
join-game logic
*******************************************/ 

    
    var playerKey = localStorage.userKey;
    var gameKey = localStorage.gameKey;

    $(document).on('click', '.openGame', function() {
      console.log('join button clicked');
      console.log($(this).attr('data-value'))

      getGameState();

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
    localStorage.setItem('gameKey', gameKey);

    // assigning unique id to variable to use to keep track of player data
    playerKey = localStorage.userKey;
    gameKey = localStorage.gameKey;

    console.log(playerKey);

    window.location.href='scorecard.html';

    });

    // Exit button on scorecard
    $('#exitGame').click(function() {

      $('#exit-modal').show();

    });

    // Exit button on modal
    $('#exit').click(function() {

      var playerRef = golfdb.ref('/games/' + gameKey + '/players/' + playerKey);

      localStorage.removeItem('userKey');
      getGameState();
      playerRef.remove();
      window.location.href='games.html';

    });

    // Cancel button on modal
    $('#exit-cancel').click(function() {

      $('#exit-modal').hide();
    
    });

/*******************************************
Delete Game from Open List and Firebase logic
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

/*******************************************
Game Chat logic
*******************************************/     

var chatdb = firebase.database().ref("/chat");

function sendChatMessage() {
  messageField = $('#chatMessage').val().trim();
  console.log('Message: ', messageField);

    if(messageField != "") {
      chatdb.push().set({
        name:firebase.auth().currentUser.displayName,
        message: messageField,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
      });
    }  
}
  
  $('#messageSubmit').click(function() {
    sendChatMessage();
    updateScroll();
  });

  $('#chatMessage').keypress(function(e) {
      if(e.which == 13) {
        sendChatMessage();
      }
  });  

  chatdb.orderByChild("dateAdded").on('child_added', function(snapshot){
    var message = snapshot.val();
    $('#messages').append(`<p><b>${message.name}:</b> ${message.message}</p>`);
    $('#chatMessage').val("");
    
    var height = 0;
    $('#messages p').each(function(i, value){
      height += parseInt($(this).height())+20;
    });

    height += 200;

    $('#messages').animate({scrollTop: height},0);

  });
//  Auto Scroll to Bottom on Chat - Not Currently working
    // var chatAutoScroll = $('#messages');
    // chatAutoScroll.scrollIntoView();


/****************************************
scorecard logic
****************************************/
  var holeNumber = 0;
  var frontNineScores = [];
  var backNineScores = [];
  var frontNine = 0;
  var backNine = 0;
  var totalScore = 0;
  $('#update-score').hide();

  golfdb.ref('/games/' + gameKey).on('value', function(snap) {
    console.log('Game Name: ', snap.val());
    $('#scorecardTourney').text(snap.val().gameName);
  });

  $('#edit-score').click(function() {

    $('#edit-score').hide();
    $('#update-score').show();

    if (holeNumber <= 9) {
      for (var i = 0; i < holeNumber - 1; i++) {
        $('#front').find('td').eq(i).attr('contenteditable', true);
      }
    } else {
      for (var i = 0; i < holeNumber - 10; i++) {
        $('#back').find('td').eq(i).attr('contenteditable', true);
      }
      $('.front-nine-hole').attr('contenteditable', true);
    }
    

  })

  $('#update-score').click(function() {

    var updatePlayerRef = golfdb.ref('/games/' + gameKey + '/players/' + playerKey);

    updatePlayerRef.update({
      holeOne: Number($('#hole1').text()),
      holeTwo: Number($('#hole2').text()),
      holeThree: Number($('#hole3').text()),
      holeFour: Number($('#hole4').text()),
      holeFive: Number($('#hole5').text()),
      holeSix: Number($('#hole6').text()),
      holeSeven: Number($('#hole7').text()),
      holeEight: Number($('#hole8').text()),
      holeNine: Number($('#hole9').text()),
      holeTen: Number($('#hole10').text()),
      holeEleven: Number($('#hole11').text()),
      holeTwelve: Number($('#hole12').text()),
      holeThirteen: Number($('#hole13').text()),
      holeFourteen: Number($('#hole14').text()),
      holeFifteen: Number($('#hole15').text()),
      holeSixteen: Number($('#hole16').text()),
      holeSeventeen: Number($('#hole17').text()),
      holeEighteen: Number($('#hole18').text())
    })

    $('.front-nine-hole').attr('contenteditable', false);
    $('.back-nine-hole').attr('contenteditable', false);
    $('#edit-score').show();
    $('#update-score').hide();

  })
    
  
  // getting data from player path in db using unique id
  golfdb.ref('/games/' + gameKey + '/players/' + playerKey).on('value', function(snap) {
      console.log('Player Key: ',playerKey)

      // getting current hole number from db to use in switch statement  
      holeNumber = snap.val().holeNumber;

      if (holeNumber >= 19) {
        $('#hole-title').text('Game Over');
        $('#hole-number').text('');
        $('#submit').addClass('disabled');
        $('#submit').prop( "disabled", true );
        $('#minus').addClass('disabled');
        $('#minus').prop( "disabled", true );
        $('#plus').addClass('disabled');
        $('#plus').prop( "disabled", true );
        $('#score').addClass('disabled');
        $('#score').prop( "disabled", true );

      } else {
        $('#hole-number').text(holeNumber);
      }

      frontNineScores = [snap.val().holeOne, snap.val().holeTwo, snap.val().holeThree, snap.val().holeFour, snap.val().holeFive, snap.val().holeSix, snap.val().holeSeven, snap.val().holeEight, snap.val().holeNine];
      backNineScores = [snap.val().holeTen, snap.val().holeEleven, snap.val().holeTwelve, snap.val().holeThirteen, snap.val().holeFourteen, snap.val().holeFifteen, snap.val().holeSixteen, snap.val().holeSeventeen, snap.val().holeEighteen];

      frontNine = 0;
      backNine = 0;
      totalScore = 0;

      for (var i = 0; i < frontNineScores.length; i++) {
        if (frontNineScores[i] != 0) {
        $('#front').find('td').eq(i).text(frontNineScores[i])
        }
      }
      console.log(frontNineScores)

      for (var i = 0; i < frontNineScores.length; i++) {
        frontNine += frontNineScores[i];
      }

      $('#out').text(frontNine);

      for (var i = 0; i < backNineScores.length; i++) {
        if (backNineScores[i] != 0) {
        $('#back').find('td').eq(i).text(backNineScores[i])
        }
      }

      for (var i = 0; i < backNineScores.length; i++) {
        backNine += backNineScores[i];
      }

      $('#in').text(backNine);

      $('#totalScore').text(frontNine + backNine)


  }, function(errorObject) {
      console.log('the read failed ' + errorObject.code)
  });

  var scoreInput = 0;

  function submitScore() {
    var playerRef = golfdb.ref('/games/' + gameKey + '/players/' + playerKey);
    // getting score input from user
    var score = Number($('#score').val());

    
    // tim
    // var data = {
    //   holeNumber: holeNumber + 1          
    // };
    // data['hole'+holeNumber] = score;
    // playerRef.update(data);

    // /tim
    if(score != "") {
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
            holeTen: score,
            holeNumber: holeNumber + 1
          })
          break;

        case 11:
          playerRef.update({
            holeEleven: score,
            holeNumber: holeNumber + 1
          })
          break;

        case 12:
          playerRef.update({
            holeTwelve: score,
            holeNumber: holeNumber + 1
          })
          break;

        case 13:
          playerRef.update({
            holeThirteen: score,
            holeNumber: holeNumber + 1
          })
          break;

        case 14:
          playerRef.update({
            holeFourteen: score,
            holeNumber: holeNumber + 1
          })
          break;

        case 15:
          playerRef.update({
            holeFifteen: score,
            holeNumber: holeNumber + 1
          })
          break;

        case 16:
          playerRef.update({
            holeSixteen: score,
            holeNumber: holeNumber + 1
          })
          break;

        case 17:
          playerRef.update({
            holeSeventeen: score,
            holeNumber: holeNumber + 1
          })
          break;

        case 18:
          playerRef.update({
            holeEighteen: score,
            holeNumber: holeNumber + 1
          })

          $(this).addClass('disabled')
          break;
      }
    
      // setting scorecard back to blank after submit
      var score = Number($('#score').val(''));
      }
    }

    // Need to disable button if nothing is entered
  $('#submit').click(function() {
    submitScore();
  }) // end click

  $('#score').keypress(function(e) {
      if(e.which == 13) {
        submitScore();
      }
  });



  golfdb.ref('/games/' + gameKey).on('value', function(snap) {
    
    
    $('#tourneyName').text(snap.val().gameName);
    $('#courseName').text(snap.val().courseName);
    $('#createdBy').text(snap.val().creator.user);

  })
  
  /*****************************************
  leaderboard logic
  *****************************************/

  // adding player to leaderboard as soon as they join the game. it is also updating their hole and score...i think
  golfdb.ref('/games/' + gameKey + '/players').on('child_added', function(snap) {
    
    var holeScores = [snap.val().holeOne, snap.val().holeTwo, snap.val().holeThree, snap.val().holeFour, snap.val().holeFive, snap.val().holeSix, snap.val().holeSeven, snap.val().holeEight, snap.val().holeNine, snap.val().holeTen, snap.val().holeEleven, snap.val().holeTwelve, snap.val().holeThirteen, snap.val().holeFourteen, snap.val().holeFifteen, snap.val().holeSixteen, snap.val().holeSeventeen, snap.val().holeEighteen]
    
    var total = 0;
    
    for (var i = 0; i < holeScores.length; i++) {
      total += holeScores[i];
    }

    var newPlayer = snap.val().name
    var score = $('<td id="boardScore">');
    var thru = $('<td id="thru">');
    var tableRow = $('<tr>');
    score.text(total);
    thru.text(snap.val().holeNumber - 1);
    
    
    $('#leaderBody').append(tableRow);
    tableRow.append('<td>' + newPlayer);
    tableRow.append(score);
    tableRow.append(thru);


  });

  // Scorecard Plus and Minus for easier Mobile use
  // Bootstrap 3.1.0 Snippet by davidsantanacosta


  $('.btn-number').click(function(e){
        e.preventDefault();
        
        fieldName = $(this).attr('data-field');
        type      = $(this).attr('data-type');
        var input = $("input[name='"+fieldName+"']");
        var currentVal = parseInt(input.val());
        if (!isNaN(currentVal)) {
            if(type == 'minus') {
                
                if(currentVal > input.attr('min')) {
                    input.val(currentVal - 1).change();
                    // input.focus();
                } 
                if(parseInt(input.val()) == input.attr('min')) {
                    $(this).attr('disabled', true);
                }

            } else if(type == 'plus') {

                if(currentVal < input.attr('max')) {
                    input.val(currentVal + 1).change();
                    // input.focus();
                }
                if(parseInt(input.val()) == input.attr('max')) {
                    $(this).attr('disabled', true);
                }

            }
        } else {
            input.val(1);
        }
    });
    $('.input-number').focusin(function(){
       $(this).data('oldValue', $(this).val());
    });
    $('.input-number').change(function() {
        
        minValue =  parseInt($(this).attr('min'));
        maxValue =  parseInt($(this).attr('max'));
        valueCurrent = parseInt($(this).val());
        
        name = $(this).attr('name');
        if(valueCurrent >= minValue) {
            $(".btn-number[data-type='minus'][data-field='"+name+"']").removeAttr('disabled')
        } else {
            $(this).val($(this).data('oldValue'));
        }
        if(valueCurrent <= maxValue) {
            $(".btn-number[data-type='plus'][data-field='"+name+"']").removeAttr('disabled')
        } else {
            $(this).val($(this).data('oldValue'));
        }        
    });

});


