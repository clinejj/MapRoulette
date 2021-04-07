package com.pixeltron.mapquest.open.geocoding;

public class RequestMaker {

    private Request geoReq, fsReq;

    public RequestMaker() {
        this.geoReq = new GeocodingRequest();
        this.fsReq = new FoursquareRequest();
    }

    public String makeGeocodingRequest(RequestParameters parameters) {
        String ret_val = null;

        try {
            ret_val = this.geoReq.buildUrl(parameters);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return ret_val;
    }

    public String makeFoursquareRequest(RequestParameters parameters) {
        String ret_val = null;

        try {
            ret_val = this.fsReq.buildUrl(parameters);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return ret_val;
    }
}
