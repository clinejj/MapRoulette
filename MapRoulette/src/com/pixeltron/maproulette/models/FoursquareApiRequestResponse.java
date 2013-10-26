package com.pixeltron.maproulette.models;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import fi.foyt.foursquare.api.ResultMeta;

/**
 * Public version of the private class in FoursquareAPI.java
 * Class that holds API request response
 * 
 * @author Antti Leppä
 */
public class FoursquareApiRequestResponse {

    /**
     * Constructor
     * 
     * @param meta status information
     * @param response response JSON Object
     * @param notifications notifications JSON Object
     * @throws JSONException when JSON parsing error occurs
     */
    public FoursquareApiRequestResponse(ResultMeta meta, JSONObject response, JSONArray notifications) throws JSONException {
      this.meta = meta;
      this.response = response;
      this.notifications = notifications;
    }

    /**
     * Returns response JSON Object
     * 
     * @return response JSON Object
     */
    public JSONObject getResponse() {
      return response;
    }

    /**
     * Returns notifications JSON Object
     * 
     * @return notifications JSON Object
     */
    public JSONArray getNotifications() {
      return notifications;
    }

    /**
     * Returns status information
     * 
     * @return status information
     */
    public ResultMeta getMeta() {
      return meta;
    }

    private JSONObject response;
    private JSONArray notifications;
    private ResultMeta meta;
}
