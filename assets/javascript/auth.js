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
      // Delete Game on Game Page  !!!!Not Working!!!!
    $('.deleteGame').click(function(){
      deleteGame();
    });

    // Join Game on Game Page  !!!!Not Working!!!!
    $('.join-game').click(function(){
      joinGame();
    });
    })

    gamedb.on('child_added', function(snapshot){
      var gameDetail = snapshot.val();
      console.log(gameDetail);
      $('#openGames').append(`<tr><td>${gameDetail.gameName}</td><td>${gameDetail.courseName}</td><td>${gameDetail.creator.user}</td><td><button class="btn btn-primary join-game" data-gameNo="Game${gameDetail.gameId}">Game ${gameDetail.gameId}</button></td><td><button class="btn btn-danger deleteGame" id="${gameDetail.gameId}">X</button></td></tr>`);
    
    });



    function deleteGame() {
      alert('Delete Me');
      // var deleteID = $('#gameId').val();
      // console.log('Delete Game: ', deleteId);
    }

    function joinGame() {
      alert('Joined Game');
      // var joinID = $('#openGame').attr('data-gameNo').val();
      // console.log('Joined Game: ', joinId);
    }



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





 /******************************************

 START OF NICK'S CODE

 *******************************************/

/*******************************************
join-game logic
*******************************************/

  var ref = golfdb.ref('/players');

  var playerKey = localStorage.userKey;
  
  console.log(playerKey)

  $('#join-game').click(function() {
    console.log('joined game')
    newPostRef = ref.push({
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
      holeNumber: 1
    });
    // grabbing unique id from push method above and storing it to localStorage
    localStorage.setItem('userKey', newPostRef.key);

    // assigning unique id to variable to use to keep track of player data
    playerKey = localStorage.userKey;
    
    console.log(playerKey);

  })

/****************************************
scorecard logic
****************************************/
  
  // getting data from player path in db using unique id
  golfdb.ref('/players/' + playerKey).on('value', function(snap) {
      console.log(playerKey)

      // getting current hole number from db to use in switch statement
      var holeNumber = snap.val().holeNumber;
      console.log(holeNumber)

      $('#hole-number').text(holeNumber);

    $('#submit').click(function() {
      // temporary solution to update hole number. was not updating without page reload
      location.reload()
      
      // getting score input from user
      var score = Number($('#score').val());
     
        switch (holeNumber) {
          case 1:
            golfdb.ref('/players/' + playerKey).update({
              holeOne: score,
              holeNumber: holeNumber + 1          
            })            
            break;

          case 2:
            golfdb.ref('/players/' + playerKey).update({
              holeTwo: score,
              holeNumber: holeNumber + 1
            })       
            break;

          case 3:
            golfdb.ref('/players/' + playerKey).update({
              holeThree: score,
              holeNumber: holeNumber + 1
            })    
            break;

          case 4:
            golfdb.ref('/players/' + playerKey).update({
              holeFour: score,
              holeNumber: holeNumber + 1
            }) 
            break;

          case 5:
            golfdb.ref('/players/' + playerKey).update({
              holeFive: score,
              holeNumber: holeNumber + 1
            }) 
            break;

          case 6:
            golfdb.ref('/players/' + playerKey).update({
              holeSix: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 7:
            golfdb.ref('/players/' + playerKey).update({
              holeSeven: score,
              holeNumber: holeNumber + 1
            })
            break;

          case 8:
            golfdb.ref('/players/' + playerKey).update({
              holeEight: score,
              holeNumber: holeNumber + 1
            })  
            break;

          case 9:
            golfdb.ref('/players/' + playerKey).update({
              holeNine: score,
              holeNumber: holeNumber + 1
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
  ref.on('child_added', function(snap) {
    
    // will change this to a loop
    var holeOne = snap.val().holeOne;
    var holeTwo = snap.val().holeTwo;
    var holeThree = snap.val().holeThree;
    var holeFour = snap.val().holeFour;
    var holeFive = snap.val().holeFive;
    var holeSix = snap.val().holeSix;
    var holeSeven = snap.val().holeSeven;
    var holeEight = snap.val().holeEight;
    var holeNine = snap.val().holeNine;

    var newPlayer = snap.val().name
    var score = $('<td id="boardScore">');
    var thru = $('<td id="thru">');
    var tableRow = $('<tr>');
    score.text(holeOne + holeTwo + holeThree + holeFour + holeFive + holeSix + holeSeven + holeEight + holeNine);
    thru.text(snap.val().holeNumber - 1);
    
    
    $('#tbody').append(tableRow);
    tableRow.append('<td>' + newPlayer);
    tableRow.append(score);
    tableRow.append(thru);

  })

});

 // PGA Tour Twitter feed

 $.ajax({
  url: "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=PGATour&count=3",
  method: "GET" 
 }) .done(function(response){
    console.log(response);
 });

//  function loadTweets(){
//     var _url = 'https://api.twitter.com/1/statuses/user_timeline/CypressNorth.json?callback=?&count=1';
//     $.getJSON(_url,function(data){
//         var tweet = data[0].text;
//         $("#localHeatMap").html('<p>'+tweet+'</p>');
//     });
// }  



