package com.chrismerced.projects.confectionco.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

@Service
public class ResendEmailService implements EmailService {
    @Value("${RESEND_API_KEY}")
    private String apiKey;

    private final Resend resend;

    ResendEmailService() {
        this.resend = new Resend(apiKey);
    }

    public void sendEmail() {
        try {
            CreateEmailOptions sendEmailRequest = CreateEmailOptions.builder()
                    .from("onboarding@resend.dev")
                    .to("christopher.r.merced@gmail.com")
                    .subject("Hello World")
                    .html("<p>Congrats on sending your <strong>first email</strong>!</p>")
                    .build();

            CreateEmailResponse data = resend.emails().send(sendEmailRequest);
            System.out.println("Resend Email Data: ");
            System.out.println(data);
        } catch (ResendException e) {
            System.err.println(e);
        }
    }

    public void sendReceipt() {
        try {
            CreateEmailOptions sendEmailRequest = CreateEmailOptions.builder()
                    .from("onboarding@resend.dev")
                    .to("christopher.r.merced@gmail.com")
                    .subject("Confection Company Order Confirmation")
                    .html("<p>Thank you for shopping with Confection company!</p><p>Here are the results of your order: </p><p>Custom Cake: 2 <strong>BILLION</strong> dollars</p>")
                    .build();

            CreateEmailResponse data = resend.emails().send(sendEmailRequest);
            System.out.println("Resend Email Data: ");
            System.out.println(data);
        } catch (ResendException e) {
            System.err.println(e);
        }
    }

}
