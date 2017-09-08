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
      $('#logout-nav').click(function(event){
        auth.signOut();
        window.location.replace('index.html');
      })

      // What happens when someone logs in
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
        $('#createModal').modal('hide');
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
  
  // getting data from player path in db using unique id
  golfdb.ref('/games/' + gameKey + '/players/' + playerKey).on('value', function(snap) {
      console.log('Player Key: ',playerKey)

      // getting current hole number from db to use in switch statement  
      var holeNumber = snap.val().holeNumber;
      $('#hole-number').text(holeNumber);

    // Need to disable button if nothing is entered
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
              holeNumber: 0
            })
            break;

        }
      
        // setting scorecard back to blank after submit
        var score = Number($('#score').val(''));

    });

    $('#submit').keypress(function(e) {
      if(e.which == 13) {
        // Enter Function Name to run
      }
    });

    var frontNineScores = [snap.val().holeOne, snap.val().holeTwo, snap.val().holeThree, snap.val().holeFour, snap.val().holeFive, snap.val().holeSix, snap.val().holeSeven, snap.val().holeEight, snap.val().holeNine];
    var backNineScores = [snap.val().holeTen, snap.val().holeEleven, snap.val().holeTwelve, snap.val().holeThirteen, snap.val().holeFourteen, snap.val().holeFifteen, snap.val().holeSixteen, snap.val().holeSeventeen, snap.val().holeEighteen];

    var frontNine = 0;
    var backNine = 0;

    for (var i = 0; i < frontNineScores.length; i++) {
      if (frontNineScores[i] != 0) {
        $('#front').find('td').eq(i).text(frontNineScores[i])
      }
    }

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
      
  }, function(errorObject) {
      console.log('the read failed ' + errorObject.code)
  });

  
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

});



 // Google Maps User Location...

// var map, infoWindow;
//       function initMap() {
//         map = new google.maps.Map(document.getElementById('map'), {
//           center: {lat: -34.397, lng: 150.644},
//           zoom: 6
//         });
//         infoWindow = new google.maps.InfoWindow;

//         // Try HTML5 geolocation.
//         if (navigator.geolocation) {
//           navigator.geolocation.getCurrentPosition(function(position) {
//             var pos = {
//               lat: position.coords.latitude,
//               lng: position.coords.longitude
//             };

//             infoWindow.setPosition(pos);
//             infoWindow.setContent('Location found.');
//             infoWindow.open(map);
//             map.setCenter(pos);
//           }, function() {
//             handleLocationError(true, infoWindow, map.getCenter());
//           });
//         } else {
//           // Browser doesn't support Geolocation
//           handleLocationError(false, infoWindow, map.getCenter());
//         }
//       }

//       function handleLocationError(browserHasGeolocation, infoWindow, pos) {
//         infoWindow.setPosition(pos);
//         infoWindow.setContent(browserHasGeolocation ?
//                               'Error: The Geolocation service failed.' :
//                               'Error: Your browser doesn\'t support geolocation.');
//         infoWindow.open(map);
//       }

      var map, places, infoWindow;
      var markers = [];
      var autocomplete;
      var countryRestrict = {'country': 'us'};
      var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
      var hostnameRegexp = new RegExp('^https?://.+?/');

      var countries = {
        'au': {
          center: {lat: -25.3, lng: 133.8},
          zoom: 4
        },
        'br': {
          center: {lat: -14.2, lng: -51.9},
          zoom: 3
        },
        'ca': {
          center: {lat: 62, lng: -110.0},
          zoom: 3
        },
        'fr': {
          center: {lat: 46.2, lng: 2.2},
          zoom: 5
        },
        'de': {
          center: {lat: 51.2, lng: 10.4},
          zoom: 5
        },
        'mx': {
          center: {lat: 23.6, lng: -102.5},
          zoom: 4
        },
        'nz': {
          center: {lat: -40.9, lng: 174.9},
          zoom: 5
        },
        'it': {
          center: {lat: 41.9, lng: 12.6},
          zoom: 5
        },
        'za': {
          center: {lat: -30.6, lng: 22.9},
          zoom: 5
        },
        'es': {
          center: {lat: 40.5, lng: -3.7},
          zoom: 5
        },
        'pt': {
          center: {lat: 39.4, lng: -8.2},
          zoom: 6
        },
        'us': {
          center: {lat: 37.1, lng: -95.7},
          zoom: 3
        },
        'uk': {
          center: {lat: 54.8, lng: -4.6},
          zoom: 5
        }
      };

      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: countries['us'].zoom,
          center: countries['us'].center,
          mapTypeControl: false,
          panControl: false,
          zoomControl: false,
          streetViewControl: false
        });

        infoWindow = new google.maps.InfoWindow({
          content: document.getElementById('info-content')
        });

        // Create the autocomplete object and associate it with the UI input control.
        // Restrict the search to the default country, and to place type "cities".
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */ (
                document.getElementById('autocomplete')), {
              types: ['establishment'],
              componentRestrictions: countryRestrict
            });
        places = new google.maps.places.PlacesService(map);

        autocomplete.addListener('place_changed', onPlaceChanged);

        // Add a DOM event listener to react when the user selects a country.
        document.getElementById('country').addEventListener(
            'change', setAutocompleteCountry);
      }

      // When the user selects a city, get the place details for the city and
      // zoom the map in on the city.
      function onPlaceChanged() {
        var place = autocomplete.getPlace();
        if (place.geometry) {
          map.panTo(place.geometry.location);
          map.setZoom(15);
          search();
        } else {
          document.getElementById('autocomplete').placeholder = 'Enter a Course Name';
        }
      }

      // Search for hotels in the selected city, within the viewport of the map.
      function search() {
        var search = {
          bounds: map.getBounds(),
          types: ['lodging']
        };

        places.nearbySearch(search, function(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearResults();
            clearMarkers();
            // Create a marker for each hotel found, and
            // assign a letter of the alphabetic to each marker icon.
            for (var i = 0; i < results.length; i++) {
              var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
              var markerIcon = MARKER_PATH + markerLetter + '.png';
              // Use marker animation to drop the icons incrementally on the map.
              markers[i] = new google.maps.Marker({
                position: results[i].geometry.location,
                animation: google.maps.Animation.DROP,
                icon: markerIcon
              });
              // If the user clicks a hotel marker, show the details of that hotel
              // in an info window.
              markers[i].placeResult = results[i];
              google.maps.event.addListener(markers[i], 'click', showInfoWindow);
              setTimeout(dropMarker(i), i * 100);
              addResult(results[i], i);
            }
          }
        });
      }

      function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
          if (markers[i]) {
            markers[i].setMap(null);
          }
        }
        markers = [];
      }

      // Set the country restriction based on user input.
      // Also center and zoom the map on the given country.
      function setAutocompleteCountry() {
        var country = document.getElementById('country').value;
        if (country == 'all') {
          autocomplete.setComponentRestrictions({'country': []});
          map.setCenter({lat: 15, lng: 0});
          map.setZoom(2);
        } else {
          autocomplete.setComponentRestrictions({'country': country});
          map.setCenter(countries[country].center);
          map.setZoom(countries[country].zoom);
        }
        clearResults();
        clearMarkers();
      }

      function dropMarker(i) {
        return function() {
          markers[i].setMap(map);
        };
      }

      function addResult(result, i) {
        var results = document.getElementById('results');
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        var markerIcon = MARKER_PATH + markerLetter + '.png';

        var tr = document.createElement('tr');
        tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
        tr.onclick = function() {
          google.maps.event.trigger(markers[i], 'click');
        };

        var iconTd = document.createElement('td');
        var nameTd = document.createElement('td');
        var icon = document.createElement('img');
        icon.src = markerIcon;
        icon.setAttribute('class', 'placeIcon');
        icon.setAttribute('className', 'placeIcon');
        var name = document.createTextNode(result.name);
        iconTd.appendChild(icon);
        nameTd.appendChild(name);
        tr.appendChild(iconTd);
        tr.appendChild(nameTd);
        results.appendChild(tr);
      }

      function clearResults() {
        var results = document.getElementById('results');
        while (results.childNodes[0]) {
          results.removeChild(results.childNodes[0]);
        }
      }

      // Get the place details for a hotel. Show the information in an info window,
      // anchored on the marker for the hotel that the user selected.
      function showInfoWindow() {
        var marker = this;
        places.getDetails({placeId: marker.placeResult.place_id},
            function(place, status) {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
              }
              infoWindow.open(map, marker);
              buildIWContent(place);
            });
      }

      // Load the place information into the HTML elements used by the info window.
      function buildIWContent(place) {
        document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
            'src="' + place.icon + '"/>';
        document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
            '">' + place.name + '</a></b>';
        document.getElementById('iw-address').textContent = place.vicinity;

        if (place.formatted_phone_number) {
          document.getElementById('iw-phone-row').style.display = '';
          document.getElementById('iw-phone').textContent =
              place.formatted_phone_number;
        } else {
          document.getElementById('iw-phone-row').style.display = 'none';
        }

        // Assign a five-star rating to the hotel, using a black star ('&#10029;')
        // to indicate the rating the hotel has earned, and a white star ('&#10025;')
        // for the rating points not achieved.
        if (place.rating) {
          var ratingHtml = '';
          for (var i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
              ratingHtml += '&#10025;';
            } else {
              ratingHtml += '&#10029;';
            }
          document.getElementById('iw-rating-row').style.display = '';
          document.getElementById('iw-rating').innerHTML = ratingHtml;
          }
        } else {
          document.getElementById('iw-rating-row').style.display = 'none';
        }

        // The regexp isolates the first part of the URL (domain plus subdomain)
        // to give a short URL for displaying in the info window.
        if (place.website) {
          var fullUrl = place.website;
          var website = hostnameRegexp.exec(place.website);
          if (website === null) {
            website = 'http://' + place.website + '/';
            fullUrl = website;
          }
          document.getElementById('iw-website-row').style.display = '';
          document.getElementById('iw-website').textContent = website;
        } else {
          document.getElementById('iw-website-row').style.display = 'none';
        }
      }  



