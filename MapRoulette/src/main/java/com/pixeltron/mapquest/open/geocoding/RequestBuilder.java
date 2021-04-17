package com.pixeltron.mapquest.open.geocoding;

public class RequestBuilder {

    private RequestParameters parameters;
    private Request geoReq, fsReq;

    public RequestBuilder(RequestParameters parameters) {
        this.parameters = parameters;
        this.geoReq = new GeocodingRequest();
        this.fsReq = new FoursquareRequest();
    }

    public String buildGeocodingRequest() {
        String ret_val = null;

        try {
            ret_val = this.geoReq.buildUrl(this.parameters);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return ret_val;
    }

    public String buildFoursquareRequest() {
        String ret_val = null;

        try {
            ret_val = this.fsReq.buildUrl(this.parameters);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return ret_val;
    }
}
