package com.pixeltron.maproulette.servlets;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;

import com.google.code.geocoder.Geocoder;
import com.google.code.geocoder.GeocoderRequestBuilder;
import com.google.code.geocoder.model.GeocodeResponse;
import com.google.code.geocoder.model.GeocoderRequest;
import com.google.code.geocoder.model.GeocoderStatus;
import com.google.code.geocoder.model.LatLng;
import com.google.common.collect.Lists;
import com.google.common.primitives.Ints;
import com.google.gson.Gson;
import com.pixeltron.maproulette.responses.WaypointResponse;

import fi.foyt.foursquare.api.FoursquareApi;
import fi.foyt.foursquare.api.FoursquareApiException;
import fi.foyt.foursquare.api.Result;
import fi.foyt.foursquare.api.entities.CompactVenue;
import fi.foyt.foursquare.api.entities.Recommendation;
import fi.foyt.foursquare.api.entities.RecommendationGroup;
import fi.foyt.foursquare.api.entities.Recommended;

@SuppressWarnings("serial")
public class RouletteServlet extends HttpServlet {
	
	public static final String FOURSQUARE_API_KEY_DEV = "GWCCYYFINDKJ1A3JUY0KMUAEXX5UQ0EGHTQPPGUGLTVAKNUK";
	public static final String FOURSQUARE_API_SECRET_DEV = "JYUTNCPVW4K0JLGFYS3ROLHHDEFPZOJSPP2R0RJHZBTOCQJO";
	public static final String FOURSQUARE_API_KEY_PROD = "UMGTNRDSNZV2WY1TE5WWLSLMS1UAMH4YCYJFXHEPSKKXVHYA";
	public static final String FOURSQUARE_API_SECRET_PROD = "FYO552JTH34WSCYK0OZUMVMZUHTNCTOB02CVCWRPYPADP1CC";
	
	private static int CONV_MI_LL = 69;              		// 69 miles = 1 latitude/longitude (average)
	private static double CONV_LL_MI = 0.000621371192;  	// conversion factor for lat/long to miles
	private static int CONV_MI_M = 1760;             		// rough miles to meters
	
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
	throws IOException {		
		String strResp = "";
		String start = req.getParameter("start");
		String end = req.getParameter("end");
		String categories = req.getParameter("categories");
		String search = req.getParameter("search");
		String checkNew = req.getParameter("new");
		String checkOld = req.getParameter("old");
		String  transport = req.getParameter("transport");
		String responseBody = "";
		
		Gson gson = new Gson();
		
		if (StringUtils.isNotBlank(start) && StringUtils.isNotBlank(end)) {
//			HttpClient httpclient = HttpClients.createDefault();   
//			HttpGet getLL = new HttpGet("http://maps.googleapis.com/maps/api/geocode/json?address=" + URLEncoder.encode(start, "utf-8") + "&sensor=false");
//			HttpResponse response = httpclient.execute(getLL);
//			responseBody = EntityUtils.toString(response.getEntity());
//			getLL.releaseConnection();

			final Geocoder geocoder = new Geocoder();
			GeocoderRequest geocoderRequest = new GeocoderRequestBuilder().setAddress(start).setLanguage("en").getGeocoderRequest();
			GeocodeResponse geocoderResponse = geocoder.geocode(geocoderRequest);
			LatLng startLL = (geocoderResponse.getStatus().equals(GeocoderStatus.OK) ? geocoderResponse.getResults().get(0).getGeometry().getLocation() : null);
			geocoderRequest = new GeocoderRequestBuilder().setAddress(end).setLanguage("en").getGeocoderRequest();
			geocoderResponse = geocoder.geocode(geocoderRequest);
			LatLng endLL = (geocoderResponse.getStatus().equals(GeocoderStatus.OK) ? geocoderResponse.getResults().get(0).getGeometry().getLocation() : null);
			
			if (startLL != null && endLL != null) {
				// Set up math variables
				Random rand = new Random();
				int numWaypoints = rand.nextInt(6) + 1;
				
                double rise = startLL.getLng().doubleValue() - endLL.getLng().doubleValue();
                double run = startLL.getLat().doubleValue() - endLL.getLat().doubleValue();
                double slope = rise / run;
                double risestep = rise / numWaypoints;
                double runstep = run / numWaypoints;
                double distance = Math.sqrt(rise * rise + run * run) * CONV_MI_LL;
                double wpDist = distance / numWaypoints;
                if (numWaypoints == 0) wpDist = distance;
                int rad = Ints.checkedCast(Math.round(wpDist * CONV_MI_M) / 2);
                if (rad > 35000) rad = 35000;
                
                // Build waypoints
                LatLng nextWP = new LatLng();
                nextWP.setLat(BigDecimal.valueOf(startLL.getLat().doubleValue() - runstep));
                nextWP.setLng(BigDecimal.valueOf(startLL.getLng().doubleValue() - risestep));
                List<LatLng> waypoints = Lists.newArrayList();
                for (int i=0;i<numWaypoints;i++) {
                    double lat = nextWP.getLat().doubleValue();
                    double lng = nextWP.getLng().doubleValue();
                    nextWP = new LatLng();
                    nextWP.setLat(BigDecimal.valueOf(lat - runstep));
                    nextWP.setLng(BigDecimal.valueOf(lng - risestep));

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
                    curWP.setLat(BigDecimal.valueOf(lat));
                    curWP.setLng(BigDecimal.valueOf(lng));
                    waypoints.add(curWP);
                }
                
                List<RecommendationGroup> foursquareResults = Lists.newArrayList();
                List<CompactVenue> venueResults = Lists.newArrayList();
                FoursquareApi foursquareApi = new FoursquareApi(FOURSQUARE_API_KEY_DEV, FOURSQUARE_API_SECRET_DEV, "http://maproulette.appspot.com/");
                for (LatLng waypoint : waypoints) {
                	try {
	                	Result<Recommended> result = foursquareApi.venuesExplore(waypoint.toUrlValue(), null, null, null, rad, categories, search, 5, null);
	            	    boolean success = false;
	            	    
	            	    if (result.getMeta().getCode() == 200) {
	            	    	if (result.getResult().getWarning() == null) {
	            	    		success = true;
	            	    	} else {
	            	    		result = foursquareApi.venuesExplore(waypoint.toUrlValue(), null, null, null, rad * 2, categories, search, 5, null);
	            	    		if (result.getMeta().getCode() == 200) {
	            	    			if (result.getResult().getWarning() == null) {
	            	    				success = true;
	            	    			}			
	            	    		}
	            	    	}
	            	    }
	            	    
	            	    if (success) {
	            		    RecommendationGroup[] group = result.getResult().getGroups();
	            		    if (group.length > 0) {
	            		    	if (group[0].getItems().length > 0)
	            		    		foursquareResults.add(group[0]);
	            		    }
	            	    }
                	} catch (FoursquareApiException e) {
                		e.printStackTrace();
                	}
                }
                
                for (RecommendationGroup result : foursquareResults) {
                		Recommendation[] venues = result.getItems();
                		List<CompactVenue> venueData = Lists.newArrayList();
                		for (Recommendation venue : venues) {
                			venueData.add(venue.getVenue());
                		}
                		int random = rand.nextInt(venues.length);
                		CompactVenue currentVenue = venueData.get(random);
                		venueData.remove(random);
                		while (venueResults.contains(currentVenue) && !venueData.isEmpty()) {
                			random = rand.nextInt(venueData.size());
                			currentVenue = venueData.get(random);
                			venueData.remove(random);
                		}
                		venueResults.add(currentVenue);
                }
                
                if (venueResults.size() > 0) {
                	responseBody = gson.toJson(new WaypointResponse(venueResults));
                }
			}
		}
		resp.getOutputStream().println(responseBody);
	}
}
