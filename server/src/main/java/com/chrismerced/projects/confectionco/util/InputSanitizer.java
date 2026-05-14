package com.chrismerced.projects.confectionco.util;

import java.util.regex.Pattern;

public class InputSanitizer {

    private static final Pattern HTML_TAGS = Pattern.compile("<[^>]*>");

    public static String stripHtml(String input) {
        if (input == null) return null;
        return HTML_TAGS.matcher(input.trim()).replaceAll("");
    }

    /**
     * Strips non-digit characters and normalizes 11-digit numbers (leading "1") to 10 digits.
     * Returns a digit-only string, or null if input is null.
     */
    public static String sanitizePhone(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() == 11 && digits.startsWith("1")) {
            digits = digits.substring(1);
        }
        return digits;
    }
}
