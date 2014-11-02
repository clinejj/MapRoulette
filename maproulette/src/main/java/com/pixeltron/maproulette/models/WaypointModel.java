package com.pixeltron.maproulette.models;

import fi.foyt.foursquare.api.entities.CompactVenue;

public class WaypointModel {
	public String location;
	public boolean stopover;
	
	public WaypointModel(CompactVenue venue) {	
		StringBuilder sb = new StringBuilder();
		sb.append(venue.getLocation().getLat());
		sb.append(", ");
		sb.append(venue.getLocation().getLng());		
		location = sb.toString();
		stopover = true;
	}
}
