package com.pixeltron.mapquest.open.geocoding;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import org.apache.commons.lang3.StringUtils;

public class GeocodingRequest implements Request {
	
	private String API_KEY = "Fmjtd%7Cluubnu0zl9%2Caa%3Do5-9u1g0y";
	private String BASE_URL = "http://open.mapquestapi.com/geocoding/v1/batch";
	private Boolean THUMB_MAPS = false;

	public String buildUrl(RequestParameters parameters) throws UnsupportedEncodingException {
		StringBuilder urlBuilder = new StringBuilder(BASE_URL);
		urlBuilder.append("?key=").append(API_KEY);
		urlBuilder.append("&inFormat=kvp&outFormat=json");
		if (StringUtils.isNotBlank(parameters.start)) {
			urlBuilder.append("&location=").append(URLEncoder.encode(parameters.start, "UTF-8"));
		} else {
			return null;
		}
		if (StringUtils.isNotBlank(parameters.end)) {
			urlBuilder.append("&location=").append(URLEncoder.encode(parameters.end, "UTF-8"));
		} else {
			return null;
		}
		if (THUMB_MAPS != null) {
			urlBuilder.append("&thumbMaps=").append(THUMB_MAPS);
		}

		return urlBuilder.toString();
	}
	
}
