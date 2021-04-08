package com.pixeltron.maproulette.servlets;

public class VenueListFactory {

    public VenueList getVenueList(String venueListType) {

        if (venueListType == null) {
            return null;
        }

        if (venueListType.equalsIgnoreCase("SIMPLE")) {
            // return new SimpleVenueList();
        }

        if (venueListType.equalsIgnoreCase("FOURSQUARE")) {
            return new FoursquareVenueList();
        }

        return null;
    }
}
