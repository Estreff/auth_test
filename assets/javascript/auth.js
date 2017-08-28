$(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAtRMKj4TBfFGKWT2O9j2GRKpNQEErUJEA",
    authDomain: "test-auth-37723.firebaseapp.com",
    databaseURL: "https://test-auth-37723.firebaseio.com",
    projectId: "test-auth-37723",
    storageBucket: "test-auth-37723.appspot.com",
    messagingSenderId: "206272245401"
  };
  firebase.initializeApp(config);

  // FirebaseUI config.
      var uiConfig = {
        signInSuccessUrl: '<url-to-redirect-to-on-success>',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID

        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>'
      };

      // Initialize the FirebaseUI Widget using Firebase.
      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
   
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