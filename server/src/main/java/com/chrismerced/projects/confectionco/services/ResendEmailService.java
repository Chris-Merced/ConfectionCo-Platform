package com.chrismerced.projects.confectionco.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.chrismerced.projects.confectionco.exceptions.EmailServiceException;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;

@Service
public class ResendEmailService implements EmailService {

    private final Resend resend;
    private final String from = "no-reply@confectioncobakery.com";

    ResendEmailService(@Value("${RESEND_API_KEY}") String apiKey) {
        this.resend = new Resend(apiKey);
    }

    @Override
    public void sendOrderConfirmation(String recipient) {
        send(recipient,
                "We've Received Your Order!",
                "<p>Hi there!</p>" +
                "<p>Thank you for placing your order with <strong>Confection Co. Bakery</strong>. " +
                "We've received your request and it is currently awaiting our review.</p>" +
                "<p>You should receive a text message shortly with your order confirmation. " +
                "If you didn't receive one, feel free to reach out to us at " +
                "<a href=\"mailto:hello@confectioncobakery.com\">hello@confectioncobakery.com</a> " +
                "with your order ID and we'll make sure you're taken care of.</p>" +
                "<p>We can't wait to create something sweet for you!</p>" +
                "<p>— The Confection Co. Team</p>");
    }

    @Override
    public void sendDepositReceipt(String recipient) {
        send(recipient,
                "Deposit Payment Received",
                "<p>Hi there!</p>" +
                "<p>We've received your deposit payment — thank you! Your order is now <strong>in progress</strong>.</p>" +
                "<p>We'll be in touch when your final payment is due.</p>" +
                "<p>— The Confection Co. Team</p>");
    }

    @Override
    public void sendFullPaymentConfirmation(String recipient) {
        send(recipient,
                "Payment Received in Full",
                "<p>Hi there!</p>" +
                "<p>We've received your final payment. Your order with <strong>Confection Co. Bakery</strong> " +
                "is now <strong>paid in full</strong>.</p>" +
                "<p>We'll be in touch shortly with updates on your order. Thank you so much!</p>" +
                "<p>— The Confection Co. Team</p>");
    }

    @Override
    public void sendRefundConfirmation(String recipient) {
        send(recipient,
                "Your Refund Has Been Processed",
                "<p>Hi there!</p>" +
                "<p>We wanted to let you know that your refund from <strong>Confection Co. Bakery</strong> " +
                "has been successfully processed.</p>" +
                "<p>Please allow 5–10 business days for the funds to appear back in your account, " +
                "depending on your bank or card issuer.</p>" +
                "<p>If you have any questions, don't hesitate to reach out — we're happy to help.</p>" +
                "<p>— The Confection Co. Team</p>");
    }

    @Override
    public void sendReceipt(String recipient, String receipt) {
        send(recipient,
                "Confection Co. Order Receipt",
                "<p>Thank you for shopping with Confection Co. Bakery!</p>" +
                "<p>Here are the details of your order:</p><p>" + receipt + "</p>");
    }

    private static final String FOOTER =
            "<hr style=\"margin-top:32px\">" +
            "<p style=\"font-size:13px;color:#555\">If there is ever a problem with your order or you have not " +
            "received a payment link, feel free to contact us at " +
            "<a href=\"tel:8506307355\">850-630-7355</a>.</p>";

    private void send(String recipient, String subject, String html) {
        try {
            resend.emails().send(CreateEmailOptions.builder()
                    .from(from)
                    .to(recipient)
                    .subject(subject)
                    .html(html + FOOTER)
                    .build());
        } catch (ResendException e) {
            throw new EmailServiceException("Failed to send email: " + e.getMessage());
        }
    }
}
