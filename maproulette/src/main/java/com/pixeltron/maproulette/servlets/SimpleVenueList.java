package com.pixeltron.maproulette.servlets;

import java.math.BigDecimal;
import java.util.List;
import com.google.common.collect.Lists;

import com.pixeltron.mapquest.open.geocoding.LatLng;
import fi.foyt.foursquare.api.entities.CompactVenue;
import fi.foyt.foursquare.api.entities.Location;
import fi.foyt.foursquare.api.entities.RecommendationGroup;

public class SimpleVenueList extends VenueList{
	
	/**
	 * Creates a List of CompactVenues with only latitude/longitude coordinates
	 * @param waypoints List of latitude/longitude coordinates to create CompactVenues
	 * @return List of CompactVenues with only latitude/longitude coordinates
	 */
	@Override
	public List<CompactVenue> createVenueList(List<LatLng> waypoints, List<RecommendationGroup> foursquareResults){
		List<CompactVenue> simpleVenues = Lists.newArrayList();
		
		//Populate list
		for(LatLng waypoint : waypoints) {
			CompactVenue venue = new CompactVenue();
			Location venueLocation = new Location();
			
			//Set latitude/longitude coordinates of CompactVenue Location
			venueLocation.setLat(new Double(waypoint.lat.doubleValue()));
			venueLocation.setLng(new Double(waypoint.lng.doubleValue()));
			
			venue.setLocation(venueLocation);
			
			//Add CompactVenue to list
			simpleVenues.add(venue);
		}
		
		return simpleVenues;
	}
}
