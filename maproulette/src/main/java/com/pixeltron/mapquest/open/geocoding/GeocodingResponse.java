package com.pixeltron.mapquest.open.geocoding;

public class GeocodingResponse {
	public GeocodingResultsGroup[] results;
	public GeocodingOptions options;
	public GeocodingInfo info;
	
	public String toString() {
		return this.results.toString();
	}
}
