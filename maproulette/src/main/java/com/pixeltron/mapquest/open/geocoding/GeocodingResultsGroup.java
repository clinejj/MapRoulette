package com.pixeltron.mapquest.open.geocoding;

public class GeocodingResultsGroup {
	public Location[] locations;
	public ProvidedLocation providedLocation;
	
	public String toString() {
		return this.locations.toString();
	}
}
