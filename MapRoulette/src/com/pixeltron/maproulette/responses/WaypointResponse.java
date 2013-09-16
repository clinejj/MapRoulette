package com.pixeltron.maproulette.responses;

import java.util.List;

import com.pixeltron.maproulette.models.WaypointModel;

import fi.foyt.foursquare.api.entities.CompactVenue;

public class WaypointResponse {
	public CompactVenue[] fullWaypoints;
	public String[] waypointNames;
	public WaypointModel[] waypoints;
	
	public WaypointResponse(List<CompactVenue> venues) {
		int size = venues.size();
		
		CompactVenue[] venueData = new CompactVenue[size];
		String[] venueNames = new String[size];
		WaypointModel[] waypointInfo = new WaypointModel[size];
		for (int i=0;i<size;i++) {
			CompactVenue venue = venues.get(i);
			venueData[i] = venue;
			venueNames[i] = venue.getName();
			waypointInfo[i] = new WaypointModel(venue);
		}
		
		fullWaypoints = venueData;
		waypointNames = venueNames;
		waypoints = waypointInfo;
	}
}
