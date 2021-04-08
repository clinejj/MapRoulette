package com.pixeltron.maproulette.servlets;

import java.util.List;
import java.util.Random;

import com.google.common.collect.Lists;
import com.pixeltron.mapquest.open.geocoding.LatLng;

import fi.foyt.foursquare.api.entities.CompactVenue;
import fi.foyt.foursquare.api.entities.Recommendation;
import fi.foyt.foursquare.api.entities.RecommendationGroup;

public class FoursquareVenueList extends VenueList {

    @Override
    public List<CompactVenue> createVenueList(List<LatLng> waypoints, List<RecommendationGroup> foursquareResults) {
        List<CompactVenue> venueResults = Lists.newArrayList();
        for (RecommendationGroup result : foursquareResults) {
                Recommendation[] venues = result.getItems();
                List<CompactVenue> venueData = Lists.newArrayList();
                for (Recommendation venue : venues) {
                    venueData.add(venue.getVenue());
                }
                Random rand = new Random();
                int random = rand.nextInt(venues.length);
                CompactVenue currentVenue = venueData.get(random);
                venueData.remove(random);
                while (venueResults.contains(currentVenue) && !venueData.isEmpty()) {
                    random = rand.nextInt(venueData.size());
                    currentVenue = venueData.get(random);
                    venueData.remove(random);
                }
                venueResults.add(currentVenue);
        }

        return venueResults;
    }
}
