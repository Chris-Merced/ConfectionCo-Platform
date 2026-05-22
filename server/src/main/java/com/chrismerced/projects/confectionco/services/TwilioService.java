package com.chrismerced.projects.confectionco.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;

import jakarta.annotation.PostConstruct;

@Service
public class TwilioService implements TextingService {

    @Value("${TWILIO_ACCOUNT_SID}")
    private String accountSID;

    @Value("${TWILIO_AUTH_TOKEN}")
    private String authToken;

    @Value("${TWILIO_PHONE_NUMBER}")
    private String fromPhone;

    @PostConstruct
    public void init() {
        Twilio.init(accountSID, authToken);
    }

    @Override
    public void sendText(String to, String message) {
        /*  try {
            Message.creator(
                    new com.twilio.type.PhoneNumber(normalizePhone(to)),
                    new com.twilio.type.PhoneNumber(fromPhone),
                    message)
                    .create();
        } catch (Exception e) {
            System.err.println("Failed to send text to " + to + ": " + e.getMessage());
        }*/
    }

    private String normalizePhone(String phone) {
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.length() == 10) return "+1" + digits;
        if (digits.length() == 11 && digits.startsWith("1")) return "+" + digits;
        return "+" + digits;
    }
}
