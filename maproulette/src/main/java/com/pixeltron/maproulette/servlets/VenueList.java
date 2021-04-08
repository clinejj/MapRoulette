package com.pixeltron.maproulette.servlets;

import java.util.List;

import com.pixeltron.mapquest.open.geocoding.LatLng;

import fi.foyt.foursquare.api.entities.CompactVenue;
import fi.foyt.foursquare.api.entities.RecommendationGroup;

public abstract class VenueList {
    protected abstract List<CompactVenue> createVenueList(List<LatLng> waypoints, List<RecommendationGroup> foursquareResults);
}
