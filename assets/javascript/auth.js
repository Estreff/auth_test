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

  var email = "";
  var firstName = "";
  var lastName = "";
  var loginPswd = "";
  var uid = "";
  var gamesPlayed = [0];

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
      promise.catch(event => console.log(event.message));

      // $('#player').text('Username');

      $('#email-login').val("")
      $('#password-login').val("")

      $('#loginModal').modal('hide');      

    });

  // Add Signup on click 

    $('#createAcct').click(function(event){
      // Get email and password
      email = $('#email-input').val().trim();
      console.log(email);
      firstName = $('#fName-input').val().trim();
      console.log(firstName);
      lastName = $('#lName-input').val().trim();
      console.log(lastName);
      loginPswd = $('#password-input').val().trim();
      console.log(loginPswd);

      // $('#player').text('Username');

      // event.preventDefault();


      // Create User
      var promise = auth.createUserWithEmailAndPassword(email, loginPswd);
      promise.catch(event => console.log(event.message));

      var empsRef = golfdb.ref("users");

      empsRef.child(firstName + " " + lastName).set({
        playerId: playerId,
        firstname: firstName,
        lastName: lastName,
        email: email,
        games: gamesPlayed,
        dataAdded: firebase.database.ServerValue.TIMESTAMP
      })


      $('#email-input').val("");
      $('#fName-input').val("");
      $('#lName-input').val("");
      $('#password-input').val("");

      $('#createModal').modal('hide');

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
  
    // Add a realtime listener

    firebase.auth().onAuthStateChanged(firebaseUser => {
      if(firebaseUser) {
        console.log('Valid User: ', firebaseUser);
        $('#logout-nav').removeClass('hide');
        $('#login-nav').addClass('hide');
        $('#signup-nav').addClass('hide');
        $('#login-form').addClass('hide')
        $('#signup-form').addClass('hide')
        // $('#scorecard').removeClass('hide');
        // $('#leaderboard').removeClass('hide');
        // $('#games').removeClass('hide');
        
      } else {
        console.log('not logged in');
        $('#logout-nav').addClass('hide');
        $('#login-nav').removeClass('hide');
        $('#signup-nav').removeClass('hide');
        // $('#scorecard').addClass('hide');
        // $('#leaderboard').addClass('hide');
        // $('#games').addClass('hide');
      }
      
    });



      $('#signup-nav').on('shown.bs.modal', function () {
        $('#createModal').focus()
      })

});