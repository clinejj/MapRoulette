package com.pixeltron.mapquest.open.geocoding;

import java.io.UnsupportedEncodingException;

public interface Request<T> {
    String buildUrl(T parameters) throws UnsupportedEncodingException;
}
