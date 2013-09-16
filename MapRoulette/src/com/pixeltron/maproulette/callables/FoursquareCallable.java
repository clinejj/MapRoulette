package com.pixeltron.maproulette.callables;

import java.util.concurrent.Callable;

import org.apache.commons.lang3.StringUtils;

import com.google.code.geocoder.model.LatLng;
import com.pixeltron.maproulette.servlets.RouletteServlet;

import fi.foyt.foursquare.api.FoursquareApi;
import fi.foyt.foursquare.api.Result;
import fi.foyt.foursquare.api.entities.RecommendationGroup;
import fi.foyt.foursquare.api.entities.Recommended;

public class FoursquareCallable implements Callable<RecommendationGroup> {
	
	private final String ll;
	private final int radius;
	private final String section;
	private final String search;
	private final int limit = 5;
	
	public FoursquareCallable(LatLng latlng, int radius, String section, String search) {
		ll = latlng.toUrlValue();
		this.radius = radius;
		this.section = (StringUtils.isNotBlank(section) ? section : null);
		this.search = (StringUtils.isNotBlank(search) ? search : null);
	}
	
	
	@Override
	public RecommendationGroup call() throws Exception {
	    FoursquareApi foursquareApi = new FoursquareApi(RouletteServlet.FOURSQUARE_API_KEY_DEV, RouletteServlet.FOURSQUARE_API_SECRET_DEV, "http://maproulette.appspot.com/");
	    
	    Result<Recommended> result = foursquareApi.venuesExplore(ll, null, null, null, radius, section, search, limit, null);
	    boolean success = false;
	    
	    if (result.getMeta().getCode() == 200) {
	    	if (result.getResult().getWarning() == null) {
	    		success = true;
	    	} else {
	    		result = foursquareApi.venuesExplore(ll, null, null, null, radius * 2, section, search, limit, null);
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
		    		return group[0];
		    	else
		    		return null;
		    }
	    }
	    
	    return null;
	}

}
