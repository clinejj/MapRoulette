package com.pixeltron.mapquest.open.geocoding;

import java.io.UnsupportedEncodingException;

public interface Request {
    String buildUrl(RequestParameters parameters) throws UnsupportedEncodingException;
}
