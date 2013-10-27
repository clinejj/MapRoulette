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
var fsq_token;
var isDev;
var isAuth;
var notifications;
var spinner;

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
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directions-panel"));

    // Try W3C Geolocation (Preferred)
    if (navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function (position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);
            Geostart = initialLocation.toUrlValue();
            geocoder.geocode({ 'latLng': initialLocation }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var lname = results[0].formatted_address;
                    if (!isDev) {
                        document.getElementById('fsqstart').value = lname;
                    }
                } else {
                    if (!isDev) {
                        document.getElementById('fsqstart').value = Geostart;
                    }
                }
            })

            marker = new google.maps.Marker({
                position: initialLocation,
                map: map
            });
        }, function () {
            map.setCenter(initialLocation);
        });
    } else {
        map.setCenter(initialLocation);
    }


    var control = document.getElementById('control');
    control.style.display = 'block';

    //click to add a marker
    /*
    google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(event.latLng);
    });
    */
    if (!isAuth) {
        $("#newrec").css("display", "none");
        $("#newreclbl").css("display", "none");
        $("#oldrec").css("display", "none");
        $("#oldreclbl").css("display", "none");
        $("#recbuttons").css("display", "none");
    }

    $("#notifications").hide('fast');

    spinner = Ladda.create($('#gobtn')[0]); //Ladda.bind( 'input[type=submit]' );//
}

$("#fsqroute").submit(function (event) {
    event.preventDefault();
    document.getElementById("gobtn").disabled = true;
    spinner.start();
    $("#notifications").hide('fast');
    notifications = "";
    start = $.trim(this.start.value);
    end = $.trim(this.end.value);
    if ((start == "") || (end == "")) {
        $("#notifications").show('fast');
        $("#notifications").html("whoops! please enter both start and end points!");
        spinner.stop();
        document.getElementById("gobtn").disabled = false;
    } else {
        transMethod = this.transport.value;
        
        var posting = $.post('/ajax/roulette', $(this).serialize());

        posting.done(function (data) {
            response = JSON.parse(data);
            if (response.isOK) {
                waynames = response.data.waypointNames;
                waypoints = response.data.waypoints;
                waypointsFull = response.data.fullWaypoints;
                getDirections();
            } else {
                errfunc(response.errors);
            }
        });
    }
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
    spinner.stop();
    document.getElementById("gobtn").disabled = false;
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

function placeMarker(location) {
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    map.setCenter(location);
}

function errfunc(data) {
    console.log(data);
    $("#notifications").show('fast');
    $("#notifications").html("whoops! we ran into an error. try again!");
    spinner.stop();
    document.getElementById("gobtn").disabled = false;
}

function addMobileStyle() {
    var currTabElem = document.getElementById("map_canvas");

    currTabElem.setAttribute("style", "width: "+window.innerWidth+"px;height: "+window.innerHeight*.65+"px;");
}

google.maps.event.addDomListener(window, 'load', initialize);