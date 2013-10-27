var map;
var initialLocation = new google.maps.LatLng(39.3722, -104.856);
var Geostart = "";
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var start, end;
var transMethod;
var geocoder = new google.maps.Geocoder();
var waypoints;
var waypointsFull;
var waynames;
var wayMarkers;
var fsq_token;
var isDev;
var isAuth;
var notifications;
var goSpinner;
var routeSpinner;

var fsqconfig = {
    //dev
    apiKeyDev: 'GWCCYYFINDKJ1A3JUY0KMUAEXX5UQ0EGHTQPPGUGLTVAKNUK',
    apiSecDev: 'JYUTNCPVW4K0JLGFYS3ROLHHDEFPZOJSPP2R0RJHZBTOCQJO',
    // prod
    apiKey: 'UMGTNRDSNZV2WY1TE5WWLSLMS1UAMH4YCYJFXHEPSKKXVHYA',
    apiSec: 'FYO552JTH34WSCYK0OZUMVMZUHTNCTOB02CVCWRPYPADP1CC',
    authUrl: 'https://foursquare.com/',
    apiUrl: 'https://api.foursquare.com/'
};

function doAuthRedirect() {
    var pgurl = document.URL;
    var redirect = window.location.href.replace(window.location.hash, '');
    var url = fsqconfig.authUrl + 'oauth2/authenticate?response_type=token&client_id=';
    if (pgurl.indexOf("localhost") != -1) {
        url += fsqconfig.apiKeyDev;
    } else {
        url += fsqconfig.apiKey;
    }
    url += '&redirect_uri=' + encodeURIComponent(redirect);
    window.location.href = url;
};

function initialize() {
    isDev = false;
    var pgurl = document.URL;
    if (pgurl.indexOf('access_token') != -1) {
        var splitres = pgurl.split('access_token=');
        fsq_token = splitres[1];
        if (window.sessionStorage) {
            sessionStorage.setItem("oauth_token", fsq_token);
        }
        window.location.hash = '';
        $('div.foursquare').html('<a href="http://www.foursquare.com/"><img src="img/poweredbyfsq.png" width=200 height=50 alt="powered by foursquare"></a>');
        $('#oauth_token').val(fsq_token);
        isAuth = true;
    }
    if (window.sessionStorage && !isAuth) {
        var token = sessionStorage.getItem("oauth_token");
        if (token && token != '') {
            fsq_token = token;
            $('div.foursquare').html('<a href="http://www.foursquare.com/"><img src="img/poweredbyfsq.png" width=200 height=50 alt="powered by foursquare"></a>');
            $('#oauth_token').val(fsq_token);
            isAuth = true;
        }
    }
    if (pgurl.indexOf("localhost") != -1) {
        isDev = true;
    }
    
    if (window.mobilecheck && window.mobilecheck()) {
      var newurl = "http://maproulette.appspot.com";
      if (isDev) {
        newurl = "http://localhost:8888";
      }
      if (pgurl.indexOf('access_token') != -1) {
        window.location.replace(newurl + "/mobile.html" + pgurl.substring(pgurl.indexOf('#')));
      } else {
        window.location.replace(newurl + "/mobile.html");
      }
    }
    
    if (pgurl.indexOf("mobile") != -1) {
        $('#tabs a:first').tab('show');
        addMobileStyle();
    }
    
    directionsDisplay = new google.maps.DirectionsRenderer();
    var mapOptions = {
        zoom: 12,
        center: initialLocation,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directions-panel"));

    // Try W3C Geolocation (Preferred)
    if (navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function (position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);
            Geostart = initialLocation.toUrlValue();
            var lname = 'Your location';
            geocoder.geocode({ 'latLng': initialLocation }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    lname = results[0].formatted_address;
                    if (!isDev) {
                        document.getElementById('fsqstart').value = lname;
                    }
                } else {
                    lname = Geostart;
                    if (!isDev) {
                        document.getElementById('fsqstart').value = Geostart;
                    }
                }
            })

            marker = new google.maps.Marker({
                position: initialLocation,
                map: map,
                title: lname
            });
           
        }, function () {
            map.setCenter(initialLocation);
        });
    } else {
        map.setCenter(initialLocation);
    }

    if (isAuth) {
        $("#recbuttons").css("display", "inline-block");
    }

    wayMarkers = [];
    goSpinner = Ladda.create($('#gobtn')[0]);
    routeSpinner = Ladda.create($('#routebtn')[0]);
}

$("#fsqroute").submit(function (event) {
    event.preventDefault();
    document.getElementById("gobtn").disabled = true;
    goSpinner.start();
    $("#notifications").hide('fast');
    $('#fsqform').css('margin-bottom', '0px');
    notifications = "";
    start = $.trim(this.start.value);
    end = $.trim(this.end.value);
    if ((start == "") || (end == "")) {
        $("#notifications").show('fast');
        $('#fsqform').css('margin-bottom', '6px');
        $("#notifications").html("whoops! please enter both start and end points!");
        goSpinner.stop();
        document.getElementById("gobtn").disabled = false;
    } else {
        clearMarkers();
        var posting = $.post('/ajax/roulette', $(this).serialize());

        posting.done(function (data) {
            response = JSON.parse(data);
            if (response.isOK) {
                waynames = response.data.waypointNames;
                waypoints = response.data.waypoints;
                waypointsFull = response.data.fullWaypoints;
                showResults();
            } else {
                errfunc(response.errors);
            }
        });
    }
});

$("#results-form").submit(function (event) {
    event.preventDefault();
    transMethod = this.transport.value;
    document.getElementById("routebtn").disabled = true;
    routeSpinner.start();
    getDirections();
});

function getDirections() {
    var dirrequest = {
        origin: start,
        destination: end,
        waypoints: this.waypoints,
        provideRouteAlternatives: false,
        travelMode: google.maps.TravelMode.DRIVING
    };
    if (transMethod == "driving") {
        dirrequest['travelMode'] = google.maps.TravelMode.DRIVING;
    } else if (transMethod == "transit") {
        dirrequest['travelMode'] = google.maps.TravelMode.TRANSIT;
    } else if (transMethod == "biking") {
        dirrequest['travelMode'] = google.maps.TravelMode.BICYCLING;
    } else if (transMethod == "walking") {
        dirrequest['travelMode'] = google.maps.TravelMode.WALKING;
    }

    directionsService.route(dirrequest, function (dirresult, dirstatus) {
        if (dirstatus == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(modAddresses(dirresult));
            if (notifications != "") {
                $("#notifications").show('fast');
                $("#notifications").html(notifications);
            }
        } else {
            $("#notifications").show('fast');
            $("#notifications").html("whoops! couldn't get directions. try again!");
            console.log("Directions was not successful for the following reason: " + dirstatus);
        }
    });
    routeSpinner.stop();
    document.getElementById("routebtn").disabled = false;
}

function modAddresses(dirresult) {
    var modResult = dirresult;
    for (var i = 0; i < dirresult.routes[0].legs.length; i++) {
        // check for waynames != n/a
        if (waypoints[i] != undefined) {
            if (i == 0) {
                modResult.routes[0].legs[i].start_address = start;
                modResult.routes[0].legs[i].end_address = getWaypointDisplay(i);
            } else if (i == (dirresult.routes[0].legs.length - 1)) {
                modResult.routes[0].legs[i].end_address = getWaypointDisplay(i - 1);
                modResult.routes[0].legs[i].end_address = end;
            } else {
                modResult.routes[0].legs[i].end_address = getWaypointDisplay(i - 1);
                modResult.routes[0].legs[i].end_address = getWaypointDisplay(i);
            }
        }
    }
    return modResult;
}

function getWaypointDisplay(index) {
    var dispName = waypointsFull[index].name;
    dispName += ", " + waypointsFull[index]['location']['address'];
    dispName += ", " + waypointsFull[index]['location']['city'];
    dispName += ", " + waypointsFull[index]['location']['state'];

    return dispName;
}

function showResults() {
    wayMarkers = [];
    for (var i = 0; i < waypointsFull.length; i++) {
        displayWaypoint(waypointsFull[i]);
        var waypointHTML = generateWaypointFormHTML(waypointsFull[i], i);
        $('#results-list').append(waypointHTML);
    }
    $('#results-form').show();
    $("#results-panel").animate({width:'220px'},350);
    goSpinner.stop();
    document.getElementById("gobtn").disabled = false;
}

function displayWaypoint(waypoint) {
    var latlng = new google.maps.LatLng(waypoint.location.lat, waypoint.location.lng);
    var prefixSplit = waypoint.categories[0].icon.prefix.split('/');
    var imageUrl = 'https://foursquare.com/img/categories/' + prefixSplit[prefixSplit.length - 2] + '/' + prefixSplit[prefixSplit.length - 1];
    imageUrl = imageUrl + '32' + waypoint.categories[0].icon.suffix;
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: waypoint.name,
        icon: imageUrl
    });

    wayMarkers.push(marker);
}

function generateWaypointFormHTML(waypoint, index) {
    /*
        <div class="checkbox">
        <address>
        <label>
        <input type="checkbox" value="">
            <strong>Twitter, Inc.</strong><br>
            795 Folsom Ave, Suite 600<br>
            San Francisco, CA 94107<br>
        </label>
        </address>
    </div>
    */

    var html = '<div class="checkbox"><address><label>';
    html = html + '<input type="checkbox" name="' + index + '" value="' + index + '"/>';
    html = html + '<strong>' + waypoint.name + '</strong><br>'
    html = html + waypoint.location.address + '<br>';
    html = html + waypoint.location.city + ', ' + waypoint.location.state;
    html = html + ' ' + waypoint.location.postalCode + '<br>';
    html = html + '</label></address></div>';
    return html;
}

function clearMarkers() {
    for (var i = 0; i < wayMarkers.length; i++) {
        wayMarkers[i].setMap(null);
    }
    $("#results-panel").animate({width:'0px'},0);
}

function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
}

function errfunc(data) {
    goSpinner.stop();
    console.log(data);
    $('#fsqform').css('margin-bottom', '6px');
    $("#notifications").show('fast');
    $("#notifications").html("whoops! we ran into an error. try again!");
    document.getElementById("gobtn").disabled = false;
}

function addMobileStyle() {
    var currTabElem = document.getElementById("map-canvas");

    currTabElem.setAttribute("style", "width: "+window.innerWidth+"px;height: "+window.innerHeight*.65+"px;");
}

$('#toggle-options').on('click', function (event) {
    event.preventDefault();
    if ($('#search-options').css('display') == 'block') {
        $('#search-options').slideUp('fast');
    } else {
        $('#search-options').slideDown('fast');
    }   
});

google.maps.event.addDomListener(window, 'load', initialize);