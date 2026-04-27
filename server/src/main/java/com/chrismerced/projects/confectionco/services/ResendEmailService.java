package com.chrismerced.projects.confectionco.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

interface Email {
    void sendEmail();
}

@Service
public class ResendEmailService implements Email {
    @Value("${RESEND_API_KEY}")
    private String apiKey;

    public void sendEmail() {
        Resend resend = new Resend(apiKey);

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

}
