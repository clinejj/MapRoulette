var map;
var initialLocation = new google.maps.LatLng(41.2, -112);
var Geostart = "";
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var geoJSON = "http://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCXAjl_EPBIDiPzgd2Kzsn4ExvlUidESPA&sensor=true&address=";
var transMethod;
var start, end;
var startLL, endLL;
var geocoder = new google.maps.Geocoder();
var waypoints;
var waynames;
var maxWaypoints = 6;
var numWaypoints;
var convMiLL = 69;              // 69 miles = 1 latitude/longitude (average)
var convLLMi = 0.000621371192;  // conversion factor for lat/long to miles
var convMim = 1760;             // rough miles to meters
var rise, run, distance, wpDist, risestep, runstep, rad;
var isDev;
var notifications;
var yelpparameters;
var ycats;
var yqry;

var yelpauth = {
    //
    // Update with your auth tokens.
    //
    consumerKey: "ga7nws5hpwm2dOFhDvxWyQ",
    consumerSecret: "uTPBOGvhlIlboyznoRy1ZyhZOp4",
    accessToken: "A2E6JGryDKnqjI5Upfi7HOpzrAjl1dOq",
    // This example is a proof of concept, for how to use the Yelp v2 API with javascript.
    // You wouldn't actually want to expose your access token secret like this in a real application.
    accessTokenSecret: "LNGWueJjPSgIRpadyH7PbBdVvNM",
    serviceProvider: {
        signatureMethod: "HMAC-SHA1"
    }
};

var yelpaccessor = {
    consumerSecret: yelpauth.consumerSecret,
    tokenSecret: yelpauth.accessTokenSecret
};

function initialize() {
    isDev = false;
    var pgurl = document.URL;
    if (pgurl.indexOf("localhost") != -1) {
        isDev = true;
    }
    //directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
    directionsDisplay = new google.maps.DirectionsRenderer();
    var mapOptions = {
        zoom: 12,
        center: initialLocation,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));

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
                        document.getElementById('regstart').value = lname;
                    }
                } else {
                    if (!isDev) {
                        document.getElementById('regstart').value = Geostart;
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

    $("#notifications").hide('fast');
    $("#progressbar").hide('fast');
}

function getRoute(form) {
    document.getElementById("gobtn").disabled = true;
    $("#notifications").hide('fast');
    notifications = "";
    waypoints = new Array();
    waynames = new Array();
    start = $.trim(form.start.value);
    end = $.trim(form.end.value);
    transMethod = form.transport.value;
    if ((start == "") || (end == "")) {
        $("#notifications").show('fast');
        $("#notifications").html("whoops! please enter both start and end points!");
        document.getElementById("gobtn").disabled = false;
    } else {
        yelpparameters = [];
        //yelpparameters.push(['term', terms]);
        //yelpparameters.push(['location', near]);
        yelpparameters.push(['callback', 'cb']);
        yelpparameters.push(['oauth_consumer_key', yelpauth.consumerKey]);
        yelpparameters.push(['oauth_consumer_secret', yelpauth.consumerSecret]);
        yelpparameters.push(['oauth_token', yelpauth.accessToken]);
        yelpparameters.push(['oauth_signature_method', 'HMAC-SHA1']);
        yelpparameters.push(['ll', '']);
        yelpparameters.push(['limit', '5']);
        yelpparameters.push(['radius_filter', '']);
        ycats = form.regcategories[form.regcategories.selectedIndex].value;
        if (ycats != "all") {
            yelpparameters.push(['category_filter', ycats]);
        }
        yqry = $.trim(form.regsearch.value);
        if (yqry != "") {
            yelpparameters.push(['term', yqry]);
        }
        loadWaypoints(start, end);
        //getDirections();
    }
}

function loadWaypoints(orig, dest) {
    numWaypoints = getRandomInt(1, maxWaypoints);
    $("#progressbar").show('fast');
    $("#progressbar").progressbar({ value: 0 });
    //waypoints[0] = orig;
    //waypoints[numWaypoints - 1] = dest;

    geocoder.geocode({ 'address': orig }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            startLL = results[0].geometry.location;
            nextWaypoint(startLL, 0);
        } else {
            console.log("Geocode start was not successful: " + status);
            $.ajax({
                url: geoJSON + orig,
                dataType: 'json',
                success: function (data) {
                    if (data.status == google.maps.GeocoderStatus.OK) {
                        startLL = data.results[0].geometry.location;
                        nextWaypoint(startLL, 0);
                    } else {
                        console.log("Geocode start URL failed:" + data.status);
                        $("#notifications").show('fast');
                        $("#notifications").html("whoops! couldn't geocode start. try again!");
                        document.getElementById("gobtn").disabled = false;
                    }
                },
                error: function (data) {
                    errfunc(data);
                }
            });
        }
    });
}

function nextWaypoint(point, cur) {
    var lat;
    var lng;

    if (cur == (numWaypoints + 2)) {
        $("#progressbar").progressbar({ value: 100 });
        getDirections();
    } else if (cur == 0) {
        geocoder.geocode({ 'address': end }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                endLL = results[0].geometry.location;
                rise = (startLL.lng() - endLL.lng());
                run = (startLL.lat() - endLL.lat());
                slope = rise / run;
                risestep = rise / numWaypoints;
                runstep = run / numWaypoints;
                distance = Math.sqrt(rise * rise + run * run) * convMiLL;
                wpDist = distance / numWaypoints;
                if (numWaypoints == 0) wpDist = distance;
                rad = Math.round(wpDist * convMim) / 2;
                if (rad > 35000) rad = 35000;
                $("#progressbar").progressbar({ value: Math.round((cur / (numWaypoints + 2)) * 100) });
                nextWaypoint(point, 1);
            } else {
                console.log("Geocode dest failed:" + data.status);
                $.ajax({
                    url: geoJSON + end,
                    dataType: 'json',
                    success: function (data) {
                        if (data.status == google.maps.GeocoderStatus.OK) {
                            endLL = data.results[0].geometry.location;
                            rise = (startLL.lng() - endLL.lng());
                            run = (startLL.lat() - endLL.lat());
                            slope = rise / run;
                            risestep = rise / numWaypoints;
                            runstep = run / numWaypoints;
                            distance = Math.sqrt(rise * rise + run * run) * convMiLL;
                            wpDist = distance / numWaypoints;
                            if (numWaypoints == 0) wpDist = distance;
                            rad = Math.round(wpDist * convMim) / 2;
                            if (rad > 35000) rad = 35000;
                            $("#progressbar").progressbar({ value: Math.round((cur / (numWaypoints + 2)) * 100) });
                            nextWaypoint(point, 1);
                        } else {
                            console.log("Geocode URL dest failed:" + data.status);
                            $("#notifications").show('fast');
                            $("#notifications").html("whoops! couldn't geocode end. try again!");
                            document.getElementById("gobtn").disabled = false;
                        }
                    },
                    error: function (data) {
                        errfunc(data);
                    }
                });
            }
        });
    } else {
        $("#progressbar").progressbar({ value: Math.round((cur / (numWaypoints + 2)) * 100) });
        lat = point.lat();
        lng = point.lng();
        nextWP = new google.maps.LatLng(lat - runstep, lng - risestep);

        // Randomize lat/long
        if (Math.random() > 0.5) {
            lat = lat + (Math.random() * (runstep / 4));
        } else {
            lat = lat - (Math.random() * (runstep / 4));
        }
        if (Math.random() > 0.5) {
            lng = lng + (Math.random() * (risestep / 4));
        } else {
            lng = lng - (Math.random() * (risestep / 4));
        }
        newPoint = new google.maps.LatLng(lat, lng);

        yelpparameters.valueOf()
        yelpparameters[5][1] = newPoint.toUrlValue();
        yelpparameters[7][1] = rad;
        var message = {
            'action': 'http://api.yelp.com/v2/search',
            'method': 'GET',
            'parameters': yelpparameters
        };

        OAuth.setTimestampAndNonce(message);
        OAuth.SignatureMethod.sign(message, yelpaccessor);

        var parameterMap = OAuth.getParameterMap(message.parameters);
        parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
        //console.log(parameterMap);

        $.ajax({
            url: message.action,
            data: parameterMap,
            cache: true,
            dataType: 'jsonp',
            'jsonpCallback': 'cb',
            statusCode: {
                400: function (data) {
                    console.log("400 code");
                    console.log(data);
                    nextWaypoint(nextWP, cur + 1);
                }
            },
            success: function (yelpdata) {
                //console.log(yelpdata);
                if (yelpdata['businesses'].length > 0) {
                    storeYelpWaypoint(yelpdata, cur);
                    nextWaypoint(nextWP, cur + 1);
                } else {
                    console.log("trying again, with bigger radius");
                    yelpparameters.valueOf()
                    yelpparameters[7][1] = rad * 2;
                    message = {
                        'action': 'http://api.yelp.com/v2/search',
                        'method': 'GET',
                        'parameters': yelpparameters
                    };

                    OAuth.setTimestampAndNonce(message);
                    OAuth.SignatureMethod.sign(message, yelpaccessor);

                    var parameterMap = OAuth.getParameterMap(message.parameters);
                    parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature)
                    //console.log(parameterMap);

                    $.ajax({
                        url: message.action,
                        data: parameterMap,
                        cache: true,
                        dataType: 'jsonp',
                        'jsonpCallback': 'cb',
                        statusCode: {
                            400: function (data) {
                                console.log("400 code");
                                console.log(data);
                                nextWaypoint(nextWP, cur + 1);
                            }
                        },
                        success: function (yelpdata) {
                            if (yelpdata['businesses'].length > 0) {
                                storeYelpWaypoint(yelpdata, cur);
                            } else {
                                if (notifications == "") {
                                    notifications = "we couldn't as many waypoints as we wanted. try changing your search!";
                                }
                            }
                            nextWaypoint(nextWP, cur + 1);
                        },
                        error: function (yelpdata) {
                            errfunc(yelpdata);
                        }
                    })
                }
            },
            error: function (yelpdata) {
                errfunc(yelpdata);
            }
        });
    }
}

function getDirections() {

    //if (!isFSQ) {
    waypoints.splice(0, 1);
    waypoints.splice(waypoints.length - 1, 1);
    //}
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
            //if (isFSQ) {
            directionsDisplay.setDirections(modAddresses(dirresult));
            /*
            } else {
            directionsDisplay.setDirections(dirresult);
            }*/
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
    $("#progressbar").hide('fast');
    document.getElementById("gobtn").disabled = false;
}

function storeYelpWaypoint(data, cur) {
    var pl;
    if (data['businesses'].length == 1) {
        pl = 0;
    } else {
        pl = getRandomInt(0, (data['businesses'].length - 1));
    }
    var name = data['businesses'][pl]['name'];
    var origpl = pl;

    if (waynames.indexOf(name) != -1) {
        while ((waynames.indexOf(name) != -1)) {
            pl++;
            if (pl >= data['businesses'].length) {
                pl = -1;
            } else if (pl == origpl) {
                return;
            } else {
                name = data['businesses'][pl]['name'];
            }
        }
    }

    var loc = data['businesses'][pl]['name'];
    loc += ", " + data['businesses'][pl]['location']['address'][0];
    loc += ", " + data['businesses'][pl]['location']['city'];
    loc += ", " + data['businesses'][pl]['location']['state_code'];
    loc += ", " + data['businesses'][pl]['location']['country_code'];

    waynames.push(name);
    waypoints.push({ location: loc, stopover: true });
}

function modAddresses(dirresult) {
    var modResult = dirresult;
    for (var i = 0; i < dirresult.routes[0].legs.length; i++) {
        // check for waynames != n/a
        if (waypoints[i] != undefined) {
            if (i == 0) {
                modResult.routes[0].legs[i].start_address = start;
                modResult.routes[0].legs[i].end_address = waypoints[i].location;
            } else if (i == (dirresult.routes[0].legs.length - 1)) {
                modResult.routes[0].legs[i].start_address = waypoints[i - 1].location;
                modResult.routes[0].legs[i].end_address = end;
            } else {
                modResult.routes[0].legs[i].start_address = waypoints[i - 1].location;
                modResult.routes[0].legs[i].end_address = waypoints[i].location;
            }
        }
    }
    return modResult;
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
    $("#progressbar").hide('fast');
    $("#notifications").show('fast');
    $("#notifications").html("whoops! we ran into an error. try again!");
    document.getElementById("gobtn").disabled = false;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

google.maps.event.addDomListener(window, 'load', initialize);