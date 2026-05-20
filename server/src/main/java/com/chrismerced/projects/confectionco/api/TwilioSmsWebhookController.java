package com.chrismerced.projects.confectionco.api;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.repository.OrderRepository;
import com.chrismerced.projects.confectionco.util.InputSanitizer;
import com.twilio.security.RequestValidator;

@RestController
@RequestMapping("/api/sms")
public class TwilioSmsWebhookController {

    private static final Set<String> OPT_OUT_KEYWORDS = Set.of(
            "STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT");

    @Value("${TWILIO_AUTH_TOKEN}")
    private String authToken;

    @Value("${app.base-url}")
    private String appBaseUrl;

    private final OrderRepository orderRepository;

    TwilioSmsWebhookController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @PostMapping(value = "/inbound",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE,
            produces = MediaType.TEXT_XML_VALUE)
    public ResponseEntity<String> handleInbound(
            @RequestHeader("X-Twilio-Signature") String twilioSignature,
            @RequestParam Map<String, String> params) {

        String url = appBaseUrl + "/api/sms/inbound";
        RequestValidator validator = new RequestValidator(authToken);
        if (!validator.validate(url, params, twilioSignature)) {
            return ResponseEntity.status(403).body("<Response/>");
        }

        String from = params.get("From");
        String body = params.get("Body");
        if (from == null || body == null) {
            return ResponseEntity.ok("<Response/>");
        }

        String keyword = body.trim().toUpperCase();
        if (OPT_OUT_KEYWORDS.contains(keyword)) {
            String normalizedPhone = InputSanitizer.sanitizePhone(from);
            List<Order> orders = orderRepository.findByPhoneNumber(normalizedPhone);
            orders.forEach(o -> o.setSmsConsent(false));
            orderRepository.saveAll(orders);
        }

        return ResponseEntity.ok("<Response/>");
    }
}
