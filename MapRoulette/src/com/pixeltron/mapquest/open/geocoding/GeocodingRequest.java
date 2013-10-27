package com.pixeltron.mapquest.open.geocoding;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import org.apache.commons.lang3.StringUtils;

public class GeocodingRequest {
	
	private String API_KEY = "Fmjtd%7Cluubnu0zl9%2Caa%3Do5-9u1g0y";
	private String BASE_URL = "http://open.mapquestapi.com/geocoding/v1/batch";
	
	public String buildUrl(String location1, String location2, Boolean thumbMaps) throws UnsupportedEncodingException {
		StringBuilder urlBuilder = new StringBuilder(BASE_URL);
		urlBuilder.append("?key=").append(API_KEY);
		urlBuilder.append("&inFormat=kvp&outFormat=json");
		if (StringUtils.isNotBlank(location1)) {
			urlBuilder.append("&location=").append(URLEncoder.encode(location1, "UTF-8"));
		} else {
			return null;
		}
		if (StringUtils.isNotBlank(location2)) {
			urlBuilder.append("&location=").append(URLEncoder.encode(location2, "UTF-8"));
		} else {
			return null;
		}
		if (thumbMaps != null) {
			urlBuilder.append("&thumbMaps=").append(thumbMaps);
		}
		System.out.println(urlBuilder.toString());
		return urlBuilder.toString();
	}
	
}
