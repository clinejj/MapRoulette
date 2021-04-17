package com.pixeltron.mapquest.open.geocoding;

import javax.servlet.http.HttpServletRequest;

public abstract class RequestParameters {
    public String start;
    public String end;
    public String responseBody;
    public LatLng waypoint;
    public int rad;

    public RequestParameters(HttpServletRequest req) {
        this.start = req.getParameter("start");
        this.end = req.getParameter("end");
        this.responseBody = "";
        this.waypoint = null;
        this.rad = -1;
    }
}
