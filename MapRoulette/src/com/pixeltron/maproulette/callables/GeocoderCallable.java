package com.pixeltron.maproulette.callables;

import java.util.concurrent.Callable;

import com.google.code.geocoder.Geocoder;
import com.google.code.geocoder.GeocoderRequestBuilder;
import com.google.code.geocoder.model.GeocodeResponse;
import com.google.code.geocoder.model.GeocoderRequest;
import com.google.code.geocoder.model.GeocoderStatus;
import com.google.code.geocoder.model.LatLng;

public class GeocoderCallable implements Callable<LatLng> {

	private final String address;
	
	public GeocoderCallable(String address) {
		this.address = address;
	}
	
	@Override
	public LatLng call() throws Exception {
		final Geocoder geocoder = new Geocoder();
		GeocoderRequest geocoderRequest = new GeocoderRequestBuilder().setAddress(address).setLanguage("en").getGeocoderRequest();
		GeocodeResponse geocoderResponse = geocoder.geocode(geocoderRequest);
		if (geocoderResponse.getStatus().equals(GeocoderStatus.OK)) {
			return geocoderResponse.getResults().get(0).getGeometry().getLocation();
		} else {
			return null;
		}
	}

}
