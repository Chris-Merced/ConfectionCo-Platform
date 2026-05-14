package com.chrismerced.projects.confectionco.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class InputSanitizerTest {

    // --- stripHtml ---

    @Test
    void stripHtml_removesBasicTags() {
        assertEquals("hello world", InputSanitizer.stripHtml("<b>hello</b> world"));
    }

    @Test
    void stripHtml_removesNestedTags() {
        assertEquals("text", InputSanitizer.stripHtml("<div><p>text</p></div>"));
    }

    @Test
    void stripHtml_removesScriptTag() {
        assertEquals("", InputSanitizer.stripHtml("<script>alert('xss')</script>"));
    }

    @Test
    void stripHtml_removesTagWithAttributes() {
        assertEquals("click here", InputSanitizer.stripHtml("<a href=\"http://evil.com\">click here</a>"));
    }

    @Test
    void stripHtml_trimsWhitespace() {
        assertEquals("hello", InputSanitizer.stripHtml("  hello  "));
    }

    @Test
    void stripHtml_returnsNullForNull() {
        assertNull(InputSanitizer.stripHtml(null));
    }

    @Test
    void stripHtml_passesPlainTextUnchanged() {
        assertEquals("plain text", InputSanitizer.stripHtml("plain text"));
    }

    @Test
    void stripHtml_handlesEmptyString() {
        assertEquals("", InputSanitizer.stripHtml(""));
    }

    // --- sanitizePhone ---

    @Test
    void sanitizePhone_stripsDashes() {
        assertEquals("5555555555", InputSanitizer.sanitizePhone("555-555-5555"));
    }

    @Test
    void sanitizePhone_stripsParenthesesAndSpaces() {
        assertEquals("5555555555", InputSanitizer.sanitizePhone("(555) 555-5555"));
    }

    @Test
    void sanitizePhone_stripsDots() {
        assertEquals("5555555555", InputSanitizer.sanitizePhone("555.555.5555"));
    }

    @Test
    void sanitizePhone_normalizesElevenDigitWithLeadingOne() {
        assertEquals("5555555555", InputSanitizer.sanitizePhone("15555555555"));
    }

    @Test
    void sanitizePhone_normalizesElevenDigitWithPlusOne() {
        assertEquals("5555555555", InputSanitizer.sanitizePhone("+15555555555"));
    }

    @Test
    void sanitizePhone_doesNotTrimLeadingOneIfNotElevenDigits() {
        assertEquals("155555555", InputSanitizer.sanitizePhone("155555555"));
    }

    @Test
    void sanitizePhone_passesCleanTenDigitsUnchanged() {
        assertEquals("5555555555", InputSanitizer.sanitizePhone("5555555555"));
    }

    @Test
    void sanitizePhone_returnsNullForNull() {
        assertNull(InputSanitizer.sanitizePhone(null));
    }
}
