package com.pixeltron.mapquest.open.geocoding;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import org.apache.commons.lang3.StringUtils;

public class FoursquareRequest implements Request {

    private String BASE_URL = "https://api.foursquare.com/v2/venues/explore?ll=";
    private String DATA = "&limit=6&client_id=GWCCYYFINDKJ1A3JUY0KMUAEXX5UQ0EGHTQPPGUGLTVAKNUK&client_secret=JYUTNCPVW4K0JLGFYS3ROLHHDEFPZOJSPP2R0RJHZBTOCQJO&v=20131013";

    public String buildUrl(RequestParameters parameters) throws UnsupportedEncodingException {
        StringBuilder urlBuilder = new StringBuilder(BASE_URL);
        urlBuilder.append(parameters.waypoint.toUrlValue());
        urlBuilder.append(DATA);
        if (StringUtils.isNotBlank(parameters.categories)) {
            urlBuilder.append("&section=");
            urlBuilder.append(parameters.categories);
        }
        if (StringUtils.isNotBlank(parameters.search)) {
            urlBuilder.append("&query=");
            urlBuilder.append(URLEncoder.encode(parameters.search, "UTF-8"));
        }
        urlBuilder.append("&radius=");
        urlBuilder.append(parameters.rad);
        if (StringUtils.isNotBlank(parameters.oauth_token)) {
            urlBuilder.append("&oauth_token=");
            urlBuilder.append(URLEncoder.encode(parameters.oauth_token, "UTF-8"));
            urlBuilder.append("&novelty=");
            if (StringUtils.isNotBlank(parameters.checkNew)) {
                if (StringUtils.isNotBlank(parameters.checkOld)) {
                    urlBuilder.append("both");
                } else {
                    urlBuilder.append(parameters.checkNew);
                }
            } else {
                urlBuilder.append(parameters.checkOld);
            }
        }

        return urlBuilder.toString();
    }
}
