package com.pixeltron.maproulette.models;

import com.pixeltron.mapquest.open.geocoding.LatLng;

public class EndpointModel {
	public String name;
	public LatLng location;
	
	public EndpointModel(String name, LatLng location) {
		this.name = name;
		this.location = location;
	}
}
