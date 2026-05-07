package com.chrismerced.projects.confectionco.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.chrismerced.projects.confectionco.exceptions.EmailServiceException;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

@Service
public class ResendEmailService implements EmailService {
    
    private final Resend resend;
    private final String confectionCo = "@confectioncobakery.com";

    ResendEmailService(@Value("${RESEND_API_KEY}") String apiKey) {
        this.resend = new Resend(apiKey);
    }

    public void sendReceipt(String recipient, String receipt) {
        try {
            System.out.println("made it to send receipt");
            CreateEmailOptions sendEmailRequest = CreateEmailOptions.builder()
                    .from("no-reply" + confectionCo)
                    .to(recipient)
                    .subject("Confection Company Order Confirmation")
                    .html("<p>Thank you for shopping with Confection company!</p><p>Here are the results of your order: </p><p>" + receipt + "</p>")
                    .build();

            CreateEmailResponse data = resend.emails().send(sendEmailRequest);
            System.out.println("Resend Email Data: ");
            System.out.println(data);
        } catch (ResendException e) {
            throw new EmailServiceException("Something went wrong sending the receipt: " + e.getMessage());
        }
    }

}
