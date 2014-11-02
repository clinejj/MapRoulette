package com.pixeltron.maproulette.responses;

import java.util.List;

import com.google.common.collect.Lists;
import com.pixeltron.maproulette.models.EndpointModel;

import fi.foyt.foursquare.api.entities.CompactVenue;

public class WaypointResponse {
	public boolean isOK;
	public WaypointResponseData data;
	public List<String> errors;
	
	public WaypointResponse() {
		isOK = false;
	}
	
	public void setData(List<CompactVenue> venues) {
		if (data == null) {
			data = new WaypointResponseData(venues);
		} else {
			data.setWaypoints(venues);
		}
	}
	
	public void setEndpoints(EndpointModel start, EndpointModel end) {
		if (data == null) {
			data = new WaypointResponseData(start, end);
		} else {
			data.setEndpoints(start, end);
		}
	}
	
	public void addError(String error) {
		if (errors == null) {
			errors = Lists.newArrayList();
		}
		errors.add(error);
	}
	
	public void prepareForTransport() {
		if (errors != null && !errors.isEmpty()) {
			isOK = false;
		} else {
			isOK = true;
		}
	}
}
