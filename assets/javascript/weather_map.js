//weather.js
//This script calls openweather.org API for current local wather conditions and displays the location, temperature, and a weather condition icon.

var wxIcon; //Wx icon code
var wxIconPath; //path to Wx icon
var apiKey = "b1d8243e585e458550ec2db368435c82";

var lat;// = 40;
var long;// = -105;

var test = false;

getLocation();

$("#testWx").on("click",function(){
  test = true;
})

//whenever thise is a click on the screen, the weather alert updates
$(document).click(function(event){
    getLocation();
});

function getLocation(){ 
    if (navigator.geolocation){
        console.log("Geolocation found");
        navigator.geolocation.getCurrentPosition(myPosition);
    } else {
        console.log("Geolocation may not be available on this device");
    };
};

function myPosition(position){
    console.log(position.coords)
    lat = position.coords.latitude;
    console.log("lat: ", lat);
    long = position.coords.longitude
    console.log("long: ", long);

    runAjax();
};

//this funtion makes the ajax query
function runAjax(){

    var queryCurrentURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + long + "&units=imperial&appid=" + apiKey;
    $.ajax({
        url: queryCurrentURL,
        method: "GET"
    })
    .done(function(response) {//Run this code after API get is complete
        
        console.log(response);

        //create path weather icon
        wxIcon = response.weather[0].icon

        wxIconPath = "https://openweathermap.org/img/w/"+ wxIcon +".png";

        //display City
        $("#city").text(response.name)

        //Display temperature a s whole number with degree symbol
        $("#temperature").text(Math.round(response.main.temp)+String.fromCharCode(176));
        
        //Add weather Icon to page
        $("#weather-icon").html("<img src= " + wxIconPath + ">")

        //textual description of weather
        $("#weather-description").text(response.weather[0].main);
        //display windspeed
        $("#windspeed").text(Math.round(response.wind.speed) + "mph")
        
        //display wind direction arrow
        $("#wind-direction").html("<img src= 'assets/images/windIndicator.png'>")

        //rotate arrow into the wind using 3rd party plugin
        $("#wind-direction").rotate(response.wind.deg);

        if (test === false){
          var wxCurrent = response.weather[0].id;
        } else {
          wxCurrent = 211;//thunderstorm;
        }

        //Testing: 
        //weather condition codes: https://openweathermap.org/weather-conditions
        //var wxCurrent = 800//clear
        //var wxCurrent = 962//hurricane
       //var wxCurrent = 781//tornado
      //var wxCurrent = 211//thunderstorm
        //var wxCurrent = 952//breeze

        console.log(wxCurrent)
          if ((wxCurrent >= 200 && wxCurrent <= 232) || wxCurrent === 900 || wxCurrent === 781){
          console.log("WEATHER ALERT!!!");
          //wxAlert = true;
          $('#weather-modal').show();
        } else {
           console.log("Good Weather");
        }
    }); //end ajax.done
};
$('#wxCancel').on("click",function(){
    test = false;
    $('#weather-modal').hide();
});                    
      
    // Google Maps and searches

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
          mapTypeId: "terrain",
          mapTypeControl: true,
          panControl: false,
          zoomControl: false,
          streetViewControl: true
        });

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('You are Here');
            infoWindow.open(map);
            map.setCenter(pos);
            map.setZoom(15);
          }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
          });
        } else {
          // Browser doesn't support Geolocation
          handleLocationError(false, infoWindow, map.getCenter());
        }

        infoWindow = new google.maps.InfoWindow({
          content: document.getElementById('info-content')
        });

        // Create the autocomplete object and restrict the search to the default country.

        autocomplete = new google.maps.places.Autocomplete((document.getElementById('autocomplete')), {
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
          map.setZoom(16);
          search();
        } else {
          document.getElementById('autocomplete').placeholder = 'Enter a Course Name';
        }
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

      // Get the place details for a golf course or nearby hotel hotel. Show the information in an info window,
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
