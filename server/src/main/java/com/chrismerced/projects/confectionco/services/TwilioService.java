package com.chrismerced.projects.confectionco.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;

@Service
public class TwilioService implements TextingService {

  @Value("${TWILIO_ACCOUNT_SID}")
  private String accountSID;

  @Value("${TWILIO_AUTH_TOKEN}")
  private String authToken;

  public void sendText() {
    System.out.println("Invoked sendText");

    Twilio.init(accountSID, authToken);

    Message message = Message.creator(
        new com.twilio.type.PhoneNumber("+18777804236"),
        "MG8e2f4b9c6edc84900475493a6d36573e",
        "Message from application").create();
    System.out.println(message.getSid());
  }
}
