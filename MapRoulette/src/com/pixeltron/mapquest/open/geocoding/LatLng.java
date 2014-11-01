package com.pixeltron.mapquest.open.geocoding;

import java.math.BigDecimal;

public class LatLng {
	public BigDecimal lng;
	public BigDecimal lat;
	public static final int DEFAULT_PRECISION = 6;
	
	/**
     * @return Returns a string of the form "lat,lng" for this LatLng. We round the lat/lng values to 6 decimal places by default.
     */
    public String toUrlValue() {
        return toUrlValue(DEFAULT_PRECISION);
    }

    /**
     * @param precision We round the lat/lng values
     * @return Returns a string of the form "lat,lng" for this LatLng.
     */
    public String toUrlValue(int precision) {
        return lat.setScale(precision, BigDecimal.ROUND_HALF_EVEN).toString() + "," + lng.setScale(precision, BigDecimal.ROUND_HALF_EVEN).toString();
    }
    
    public String toString() {
    	return toUrlValue();
    }
}
