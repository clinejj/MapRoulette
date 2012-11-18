var map;
var initialLocation = new google.maps.LatLng(41.2, -112);
var Geostart = "";
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var geoJSON = "http://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCXAjl_EPBIDiPzgd2Kzsn4ExvlUidESPA&sensor=true&address=";
var fsq = "https://api.foursquare.com/v2/venues/explore?ll=";
var fsqpoints = "&limit=";
var fsqcaturl = "&section=";
var fsqcats;
var fsqqryurl = "&query=";
var fsqqry;
var fsqrecurl = "&novelty=";
var fsqrec;
var transMethod;
var start, end;
var startLL, endLL;
var geocoder = new google.maps.Geocoder();
var waypoints;
var waypointsFull;
var waynames;
var maxWaypoints = 6;
var numWaypoints;
var convMiLL = 69;              // 69 miles = 1 latitude/longitude (average)
var convLLMi = 0.000621371192;  // conversion factor for lat/long to miles
var convMim = 1760;             // rough miles to meters
var rise, run, distance, wpDist, risestep, runstep, rad;
var fsq_token;
var isDev;
var isAuth;
var notifications;
var version = "&v=20121017";

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
        $('div.foursquare').html('<a href="http://www.foursquare.com/"><img src="img/poweredbyfsq.png" width=200 height=50 alt="powered by foursquare"></a>');
        isAuth = true;
    }
    if (pgurl.indexOf("localhost") != -1) {
        isDev = true;
    }
    if ((jQuery.browser.mobile)) {
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
        //$j('#map_canvas').addClass('mobile');
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
    $("#progressbar").hide('fast');
}

function getRoute(form) {
    document.getElementById("gobtn").disabled = true;
    $("#notifications").hide('fast');
    notifications = "";
    waypoints = new Array();
    waynames = new Array();
    waypointsFull = new Array();
    start = $.trim(form.start.value);
    end = $.trim(form.end.value);
    transMethod = form.transport.value;
    if ((start == "") || (end == "")) {
        $("#notifications").show('fast');
        $("#notifications").html("whoops! please enter both start and end points!");
        document.getElementById("gobtn").disabled = false;
    } else {
        fsqcats = form.categories[form.categories.selectedIndex].value;
        fsqqry = $.trim(form.search.value);
        if (form.newrec.checked) {
            if (form.oldrec.checked) {
                fsqrec = "both";
            } else {
                fsqrec = form.newrec.value;
            }
        } else {
            fsqrec = form.oldrec.value;
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

        // Foursquare API plugin, must be authenticated with oAuth
        var fsqurl = fsq + newPoint.toUrlValue() + fsqpoints + maxWaypoints;
        if (isAuth) {
            fsqurl += '&oauth_token=' + fsq_token + version;
        } else {
            //fsqurl = fsqurl.replace("explore", "search");
            if (isDev) {
                fsqurl += '&client_id=' + fsqconfig.apiKey + '&client_secret=' + fsqconfig.apiSec + version;
            } else {
                fsqurl += '&client_id=' + fsqconfig.apiKeyDev + '&client_secret=' + fsqconfig.apiSecDev + version;
            }
        }
        if (fsqcats != "all") {
            fsqurl += fsqcaturl + fsqcats;
            //rad = rad * 2;
        }
        if (fsqqry != "") {
            fsqurl += fsqqryurl + encodeURIComponent(fsqqry);
            //rad = rad * 2;
        }
        if (fsqrec != "both") {
            fsqurl += fsqrecurl + fsqrec;
        }
        fsqurl += "&radius=" + rad;
        $.ajax({
            url: fsqurl,
            dataType: 'json',
            success: function (data) {
                if (typeof data['response']['warning'] != "undefined") {
                    //console.log(data['response']['warning']);
                    console.log("trying again, with bigger radius");
                    var splitres = fsqurl.split('&radius=');
                    newurl = splitres[0];
                    newurl += "&radius=" + (rad * 2).toString();
                    //newurl.replace(rad.toString, (rad * 2));
                    $.ajax({
                        url: newurl,
                        dataType: 'json',
                        success: function (newdata) {
                            if (typeof newdata['response']['warning'] != "undefined") {
                                //console.log(newdata['response']['warning']);
                                if (notifications == "") {
                                    notifications = "we couldn't as many waypoints as we wanted. try changing your search!";
                                }
                                /*
                                waynames[cur - 1] = "N/A";
                                waypoints[cur - 1] = {
                                location: newPoint.toUrlValue(),
                                stopover: true
                                };
                                */
                            } else {
                                storeFsqWaypoint(newdata, cur);
                            }
                            nextWaypoint(nextWP, cur + 1);
                        },
                        error: function (newdata) {
                            errfunc(newdata);
                        }
                    });
                } else {
                    storeFsqWaypoint(data, cur);
                    nextWaypoint(nextWP, cur + 1);
                }
            },
            error: function (data) {
                errfunc(data);
            }
        });
    }
}

function getDirections() {
    //if (!isFSQ) {
    //waypoints.splice(0, 1);
    //waypoints.splice(waypoints.length - 1, 1);
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
        //console.log(waypoints);
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

function storeFsqWaypoint(data, cur) {
    var pl;
    if (data['response']['groups'][0]['items'].length == 1) {
        pl = 0;
    } else {
        pl = getRandomInt(0, (data['response']['groups'][0]['items'].length - 1));
    }
    var name = data['response']['groups'][0]['items'][pl]['venue']['name'];
    var origpl = pl;

    if (waynames.indexOf(name) != -1) {
        while ((waynames.indexOf(name) != -1)) {
            pl++;
            if (pl >= data['response']['groups'][0]['items'].length) {
                pl = -1;
            } else if (pl == origpl) {
                return;
            } else {
                name = data['response']['groups'][0]['items'][pl]['venue']['name'];
            }
        }
    }

    var loc = data['response']['groups'][0]['items'][pl]['venue']['name'];
    loc += ", " + data['response']['groups'][0]['items'][pl]['venue']['location']['address'];
    loc += ", " + data['response']['groups'][0]['items'][pl]['venue']['location']['city'];
    loc += ", " + data['response']['groups'][0]['items'][pl]['venue']['location']['state'];
    loc += ", " + data['response']['groups'][0]['items'][pl]['venue']['location']['cc'];

    waynames.push(name);
    waypoints.push({ location: loc, stopover: true });
    waypointsFull.push(data['response']['groups'][0]['items'][pl])
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

function addMobileStyle() {
    var currTabElem = document.getElementById("map_canvas");

    currTabElem.setAttribute("style", "width: "+window.innerWidth+"px;height: "+window.innerHeight*.65+"px;");
}

google.maps.event.addDomListener(window, 'load', initialize);