package com.pixeltron.maproulette.servlets;

import java.util.List;

import fi.foyt.foursquare.api.entities.CompactVenue;
import fi.foyt.foursquare.api.entities.RecommendationGroup;

public abstract class VenueList {
    protected abstract List<CompactVenue> createVenueList(List<RecommendationGroup> foursquareResults);
}
