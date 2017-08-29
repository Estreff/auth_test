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

  // Add Login on click
    $('#login').click(function(event){
      // Get email and password
      var loginEmail = $('#email-login').val().trim();
      console.log(loginEmail);
      var loginPswd = $('#password-login').val().trim();
      console.log(loginPswd);

      event.preventDefault();

      // Login
      var promise = auth.signInWithEmailAndPassword(loginEmail, loginPswd);
      promise.catch(event => console.log(event.message));

    });

  // Add Signup on click 

    $('#createAcct').click(function(event){
      // Get email and password
// TODO: Check for valid Email
      var loginEmail = $('#email-input').val().trim();
      console.log(loginEmail);
      // var loginEmail = $('#fName-input').val().trim();
      // console.log(loginEmail);
      // var loginEmail = $('#lName-input').val().trim();
      // console.log(loginEmail);
      var loginPswd = $('#password-input').val().trim();
      console.log(loginPswd);
      // var loginPswd = $('#verifyPassword-input').val().trim();
      // console.log(loginPswd);

      event.preventDefault();

      // Create User
      var promise = auth.createUserWithEmailAndPassword(loginEmail, loginPswd);
      promise.catch(event => console.log(event.message));

    });

    // LogOut of Firebase
      $('#logout-nav').click(function(event){
        auth.signOut();
      })
  
    // Add a realtime listener

    firebase.auth().onAuthStateChanged(firebaseUser => {
      if(firebaseUser) {
        console.log('Valid User: ', firebaseUser);
        $('#logout-nav').removeClass('hide')
        $('#login-nav').addClass('hide');
        $('#signup-nav').addClass('hide');
        $('#login-form').addClass('hide')
        $('#signup-form').addClass('hide')
      } else {
        console.log('not logged in');
        $('#logout-nav').addClass('hide')
        $('#login-nav').removeClass('hide');
        $('#signup-nav').removeClass('hide');
      }
      
    });



});