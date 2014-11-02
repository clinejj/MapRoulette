package com.pixeltron.maproulette.responses;

import java.util.List;

import com.pixeltron.maproulette.models.EndpointModel;
import com.pixeltron.maproulette.models.WaypointModel;

import fi.foyt.foursquare.api.entities.CompactVenue;

public class WaypointResponseData {
	public CompactVenue[] fullWaypoints;
	public String[] waypointNames;
	public WaypointModel[] waypoints;
	public EndpointModel start;
	public EndpointModel end;
	
	public WaypointResponseData(EndpointModel start, EndpointModel end) {
		this.start = start;
		this.end = end;
	}
	
	public void setEndpoints(EndpointModel start, EndpointModel end) {
		this.start = start;
		this.end = end;
	}
	
	public WaypointResponseData(List<CompactVenue> venues) {
		setWaypoints(venues);
	}
	
	public void setWaypoints(List<CompactVenue> venues) {
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
