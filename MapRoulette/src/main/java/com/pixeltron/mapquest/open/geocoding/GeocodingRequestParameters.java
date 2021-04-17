package com.pixeltron.mapquest.open.geocoding;

import javax.servlet.http.HttpServletRequest;

public class GeocodingRequestParameters extends RequestParameters {
    public Boolean thumbMaps;

    public GeocodingRequestParameters(HttpServletRequest req) {
        super(req);
        this.thumbMaps = false;
    }
}
