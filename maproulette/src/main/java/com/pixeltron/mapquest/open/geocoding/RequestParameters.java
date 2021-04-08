package com.pixeltron.mapquest.open.geocoding;

import javax.servlet.http.HttpServletRequest;

public class RequestParameters {
    public String start;
    public String end;
    public String categories;
    public String search;
    public String checkNew;
    public String checkOld;
    public String oauth_token;
    public String responseBody;
    public LatLng waypoint;
    public int rad;

    public RequestParameters(HttpServletRequest req) {
        this.start = req.getParameter("start");
        this.end = req.getParameter("end");
        this.categories = req.getParameter("categories");
        this.search = req.getParameter("search");
        this.checkNew = req.getParameter("new");
        this.checkOld = req.getParameter("old");
        this.oauth_token = req.getParameter("oauth_token");
        this.responseBody = "";
        this.waypoint = null;
        this.rad = -1;
    }
}
