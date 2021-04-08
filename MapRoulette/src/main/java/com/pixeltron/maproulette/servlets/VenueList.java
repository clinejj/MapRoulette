package com.pixeltron.maproulette.servlets;

import java.util.List;

import fi.foyt.foursquare.api.entities.CompactVenue;

public abstract class VenueList {
    protected abstract List<CompactVenue> createVenueList();
}
