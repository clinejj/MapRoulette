package com.pixeltron.maproulette.servlets;

import java.util.List;
import java.util.concurrent.Future;

import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.common.collect.Lists;

import fi.foyt.foursquare.api.entities.CompactVenue;
import fi.foyt.foursquare.api.entities.RecommendationGroup;

public class FoursquareVenueList extends VenueList {

    @Override
    public List<CompactVenue> createVenueList() {
        List<Future<HTTPResponse>> responses = Lists.newArrayList();
        List<RecommendationGroup> foursquareResults = Lists.newArrayList();
        List<CompactVenue> venueResults = Lists.newArrayList();

        // for (LatLng waypoint : waypoints) {
        //     fetch = URLFetchServiceFactory.getURLFetchService();
        //     parameters.waypoint = waypoint;
        //     responses.add(fetch.fetchAsync(new URL(request_maker.makeFoursquareRequest(parameters))));
        // }
        
        // for (Future<HTTPResponse> futureFsqresp : responses) {
        //     try {
        //         HTTPResponse fsqresp = futureFsqresp.get();
        //         FoursquareApiRequestResponse response = handleApiResponse(
        //                         new Response(new String(fsqresp.getContent(), "UTF-8"), 
        //                         fsqresp.getResponseCode(), 
        //                         null));
            
        //         if (response.getMeta().getCode() == 200) {
        //             RecommendationGroup[] groups = (RecommendationGroup[]) JSONFieldParser.parseEntities(
        //                             RecommendationGroup.class, 
        //                             response.getResponse().getJSONArray("groups"), 
        //                             true);
        //             if (groups.length > 0) {
        //                 if (groups[0].getItems().length > 0)
        //                     foursquareResults.add(groups[0]);
        //             }
                    
        //         }
        //     } catch (Exception e) {
        //         e.printStackTrace();
        //     }
        // }
        
        // for (RecommendationGroup result : foursquareResults) {
        //         Recommendation[] venues = result.getItems();
        //         List<CompactVenue> venueData = Lists.newArrayList();
        //         for (Recommendation venue : venues) {
        //             venueData.add(venue.getVenue());
        //         }
        //         int random = rand.nextInt(venues.length);
        //         CompactVenue currentVenue = venueData.get(random);
        //         venueData.remove(random);
        //         while (venueResults.contains(currentVenue) && !venueData.isEmpty()) {
        //             random = rand.nextInt(venueData.size());
        //             currentVenue = venueData.get(random);
        //             venueData.remove(random);
        //         }
        //         venueResults.add(currentVenue);
        // }

        return venueResults;
    }
}
