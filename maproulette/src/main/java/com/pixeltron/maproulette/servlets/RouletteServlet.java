package com.pixeltron.maproulette.servlets;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;
import java.util.Random;
import java.util.concurrent.Future;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;
import com.google.common.collect.Lists;
import com.google.common.primitives.Ints;
import com.google.gson.Gson;
import com.pixeltron.mapquest.open.geocoding.FoursquareRequestParameters;
import com.pixeltron.mapquest.open.geocoding.GeocodingRequestParameters;
import com.pixeltron.mapquest.open.geocoding.GeocodingResponse;
import com.pixeltron.mapquest.open.geocoding.LatLng;
import com.pixeltron.mapquest.open.geocoding.RequestBuilder;
import com.pixeltron.mapquest.open.geocoding.RequestParameters;
import com.pixeltron.maproulette.models.EndpointModel;
import com.pixeltron.maproulette.models.FoursquareApiRequestResponse;
import com.pixeltron.maproulette.responses.WaypointResponse;

import fi.foyt.foursquare.api.JSONFieldParser;
import fi.foyt.foursquare.api.ResultMeta;
import fi.foyt.foursquare.api.entities.CompactVenue;
import fi.foyt.foursquare.api.entities.Recommendation;
import fi.foyt.foursquare.api.entities.RecommendationGroup;
import fi.foyt.foursquare.api.io.Response;

@SuppressWarnings("serial")
public class RouletteServlet extends HttpServlet {
	
	public static final String FOURSQUARE_API_KEY_DEV = "GWCCYYFINDKJ1A3JUY0KMUAEXX5UQ0EGHTQPPGUGLTVAKNUK";
	public static final String FOURSQUARE_API_SECRET_DEV = "JYUTNCPVW4K0JLGFYS3ROLHHDEFPZOJSPP2R0RJHZBTOCQJO";
	public static final String FOURSQUARE_API_KEY_PROD = "UMGTNRDSNZV2WY1TE5WWLSLMS1UAMH4YCYJFXHEPSKKXVHYA";
	public static final String FOURSQUARE_API_SECRET_PROD = "FYO552JTH34WSCYK0OZUMVMZUHTNCTOB02CVCWRPYPADP1CC";
	
	private static int CONV_MI_LL = 69;              		// 69 miles = 1 latitude/longitude (average)
	//private static double CONV_LL_MI = 0.000621371192;  	// conversion factor for lat/long to miles
	private static int CONV_MI_M = 1760;             		// rough miles to meters
	
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException {		
		RequestParameters parameters = new GeocodingRequestParameters(req);
		RequestBuilder requestBuilder = new RequestBuilder(parameters);
		
		Gson gson = new Gson();
		WaypointResponse wayResp = new WaypointResponse();
		
		if (StringUtils.isNotBlank(parameters.start) && StringUtils.isNotBlank(parameters.end)) {
			LatLng startLL = null;
			LatLng endLL = null;
			
			URLFetchService fetch = URLFetchServiceFactory.getURLFetchService();

			Future<HTTPResponse> geoFuture = fetch.fetchAsync(new URL(requestBuilder.buildGeocodingRequest()));
        	try {
        		HTTPResponse geoResp = geoFuture.get();
        		if (geoResp.getResponseCode() == 200) {
        			GeocodingResponse geoResults = gson.fromJson(new String(geoResp.getContent(), "UTF-8"), GeocodingResponse.class);
        			if (geoResults.results.length > 1) {
        				if (geoResults.results[0].locations.length > 0) {
        					startLL = geoResults.results[0].locations[0].latLng;
        				} else {
        					wayResp.addError("Did not get enough geocode results back for start.");
        				}
        				if (geoResults.results[1].locations.length > 0) {
        					endLL = geoResults.results[1].locations[0].latLng;
        				} else {
        					wayResp.addError("Did not get enough geocode results back for end.");
        				}
        			} else {
        				wayResp.addError("Did not get enough geocode results back.");
        			}
        		} else {
        			wayResp.addError("Error during geocode: " + Integer.toString(geoResp.getResponseCode()));
        		}	
			} catch (Exception e) {
				e.printStackTrace();
				wayResp.addError("Exception thrown during geocoding: " + e.getMessage());
			}
			
			parameters = new FoursquareRequestParameters(req);

			if (startLL != null && endLL != null) {
				// Set up math variables
				Random rand = new Random();
				int numWaypoints = rand.nextInt(6) + 1;
				
                double rise = startLL.lng.doubleValue() - endLL.lng.doubleValue();
                double run = startLL.lat.doubleValue() - endLL.lat.doubleValue();
                double risestep = rise / numWaypoints;
                double runstep = run / numWaypoints;
                double distance = Math.sqrt(rise * rise + run * run) * CONV_MI_LL;
                double wpDist = distance / numWaypoints;
                if (numWaypoints == 0) wpDist = distance;
                parameters.rad = Ints.checkedCast(Math.round(wpDist * CONV_MI_M) / 2);
                if (parameters.rad > 35000) parameters.rad = 35000;
                
                // Build waypoints
                LatLng nextWP = new LatLng();
                nextWP.lat = BigDecimal.valueOf(startLL.lat.doubleValue() - runstep);
                nextWP.lng = BigDecimal.valueOf(startLL.lng.doubleValue() - risestep);
                List<LatLng> waypoints = Lists.newArrayList();
                for (int i=0;i<numWaypoints;i++) {
                    double lat = nextWP.lat.doubleValue();
                    double lng = nextWP.lng.doubleValue();
                    nextWP = new LatLng();
                    nextWP.lat = BigDecimal.valueOf(lat - runstep);
                    nextWP.lng = BigDecimal.valueOf(lng - risestep);

                    // Randomize lat/long
                    if (rand.nextDouble() > 0.5) {
                        lat = lat + (rand.nextDouble() * (runstep / 4));
                    } else {
                        lat = lat - (rand.nextDouble() * (runstep / 4));
                    }
                    if (Math.random() > 0.5) {
                        lng = lng + (rand.nextDouble() * (risestep / 4));
                    } else {
                        lng = lng - (rand.nextDouble() * (risestep / 4));
                    }
                    
                    LatLng curWP = new LatLng();
                    curWP.lat = BigDecimal.valueOf(lat);
                    curWP.lng = BigDecimal.valueOf(lng);
                    waypoints.add(curWP);
                }

				List<Future<HTTPResponse>> responses = Lists.newArrayList();
                for (LatLng waypoint : waypoints) {
                    fetch = URLFetchServiceFactory.getURLFetchService();
                    parameters.waypoint = waypoint;
                    responses.add(fetch.fetchAsync(new URL(requestBuilder.buildFoursquareRequest())));
                }

				List<RecommendationGroup> foursquareResults = Lists.newArrayList();
                for (Future<HTTPResponse> futureFsqresp : responses) {
                	try {
	                	HTTPResponse fsqresp = futureFsqresp.get();
	                	FoursquareApiRequestResponse response = handleApiResponse(
			                			new Response(new String(fsqresp.getContent(), "UTF-8"), 
			                			fsqresp.getResponseCode(), 
			                			null));
	             	
	                    if (response.getMeta().getCode() == 200) {
							RecommendationGroup[] groups = (RecommendationGroup[]) JSONFieldParser.parseEntities(
											RecommendationGroup.class, 
											response.getResponse().getJSONArray("groups"), 
											true);
							if (groups.length > 0) {
								if (groups[0].getItems().length > 0)
									foursquareResults.add(groups[0]);
							}
	                    	
	                    }
                	} catch (Exception e) {
                		e.printStackTrace();
                	}
                }

				List<CompactVenue> venueResults = Lists.newArrayList();
                VenueListFactory venueListFactory = new VenueListFactory();
				VenueList venueList = venueListFactory.getVenueList("FOURSQUARE");
				venueResults = venueList.createVenueList(waypoints, foursquareResults);
                
                if (venueResults.size() > 0) {
                	wayResp.setData(venueResults);
                    wayResp.setEndpoints(new EndpointModel(parameters.start, startLL), new EndpointModel(parameters.end, endLL));
                } else {
                	wayResp.addError("Venue results was size 0");
                }
			} else {
				wayResp.addError("Did not get valid start and end lat/lngs");
			}
		} else {
			wayResp.addError("Must specify a valid start and end address.");
		}
		
		wayResp.prepareForTransport();
		parameters.responseBody = gson.toJson(wayResp);
		resp.setCharacterEncoding("UTF-8");
		resp.getOutputStream().println(parameters.responseBody);
	}

	/**
	 * Handles normal API request response
	 * 
	 * @param response raw response
	 * @return ApiRequestResponse
	 * @throws JSONException when JSON parsing error occurs
	 */
	private FoursquareApiRequestResponse handleApiResponse(Response response) throws JSONException {
		JSONObject responseJson = null;
		JSONArray notificationsJson = null;
		String errorDetail = null;
		if (response.getResponseCode() == 200) {
			JSONObject responseObject = new JSONObject(response.getResponseContent());
			responseJson = responseObject.getJSONObject("response");
			notificationsJson = responseObject.optJSONArray("notifications");
		} else {
		  errorDetail = response.getMessage();
		}
	
		return new FoursquareApiRequestResponse(new ResultMeta(response.getResponseCode(), "", errorDetail), responseJson, notificationsJson);
	}
}

