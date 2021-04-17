package com.pixeltron.mapquest.open.geocoding;

import javax.servlet.http.HttpServletRequest;

public class FoursquareRequestParameters extends RequestParameters {
    public String categories;
    public String search;
    public String checkNew;
    public String checkOld;
    public String oauth_token;

    public FoursquareRequestParameters(HttpServletRequest req) {
        super(req);
        this.categories = req.getParameter("categories");
        this.search = req.getParameter("search");
        this.checkNew = req.getParameter("new");
        this.checkOld = req.getParameter("old");
        this.oauth_token = req.getParameter("oauth_token");
    }
}
