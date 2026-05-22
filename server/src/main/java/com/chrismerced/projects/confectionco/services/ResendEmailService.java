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
        send(recipient, "We've Received Your Order!", wrap(
            h2("We've Received Your Order!") +
            p("Thank you for placing your order with <strong>Confection Co. Bakery</strong>. " +
              "We've received your request and it is currently awaiting our review.") +
            p("Once reviewed and accepted, we'll send your deposit payment link to this email. " +
              "In the meantime, feel free to reach out at " +
              link("mailto:hello@confectioncobakery.com", "hello@confectioncobakery.com") + ".") +
            p("We can't wait to create something sweet for you!")
        ));
    }

    @Override
    public void sendDepositPaymentLink(String recipient, String url) {
        send(recipient, "Your Deposit Payment Link — Confection Co. Bakery", wrap(
            h2("Your Order Has Been Accepted!") +
            p("Great news! Please use the button below to pay your deposit and get your order started:") +
            button(url, "Pay Deposit") +
            pSmall("Or copy this link into your browser: " + link(url, url))
        ));
    }

    @Override
    public void sendFinalPaymentLink(String recipient, String url) {
        send(recipient, "Your Final Payment Link — Confection Co. Bakery", wrap(
            h2("Your Final Payment Is Ready") +
            p("Your order is almost complete! Please use the button below to submit your final payment:") +
            button(url, "Complete Payment") +
            pSmall("Or copy this link into your browser: " + link(url, url))
        ));
    }

    @Override
    public void sendDepositReceipt(String recipient) {
        send(recipient, "Deposit Payment Received — Confection Co. Bakery", wrap(
            h2("Deposit Received — Thank You!") +
            p("We've received your deposit payment. Your order is now <strong>in progress</strong>.") +
            p("We'll be in touch when your final payment is due.")
        ));
    }

    @Override
    public void sendFullPaymentConfirmation(String recipient) {
        send(recipient, "Payment Received in Full — Confection Co. Bakery", wrap(
            h2("You're All Paid Up!") +
            p("We've received your final payment. Your order with <strong>Confection Co. Bakery</strong> " +
              "is now <strong>paid in full</strong>.") +
            p("We'll be in touch shortly with updates on your order. Thank you so much!")
        ));
    }

    @Override
    public void sendRefundConfirmation(String recipient) {
        send(recipient, "Your Refund Has Been Processed — Confection Co. Bakery", wrap(
            h2("Your Refund Is on Its Way") +
            p("Your refund from <strong>Confection Co. Bakery</strong> has been successfully processed.") +
            p("Please allow 5–10 business days for the funds to appear in your account, " +
              "depending on your bank or card issuer.") +
            p("If you have any questions, don't hesitate to reach out — we're happy to help.")
        ));
    }

    @Override
    public void sendReceipt(String recipient, String receipt) {
        send(recipient, "Your Confection Co. Bakery Receipt", wrap(
            h2("Order Receipt") +
            p("Thank you for your order! Here are the details:") +
            "<div style=\"background:#f9f4f0;border-radius:6px;padding:16px 20px;margin:0 0 16px;\">" + receipt + "</div>"
        ));
    }

    // --- Template ---

    private String wrap(String content) {
        return "<!DOCTYPE html><html lang=\"en\">" +
            "<head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1.0\"></head>" +
            "<body style=\"margin:0;padding:0;background:#f9f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\">" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">" +
            "<tr><td align=\"center\" style=\"padding:40px 16px;\">" +
            "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\" style=\"max-width:580px;\">" +
            // Header
            "<tr><td style=\"background:#e0849a;border-radius:8px 8px 0 0;padding:32px 40px;text-align:center;\">" +
            "<h1 style=\"margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:0.3px;\">Confection Co. Bakery</h1>" +
            "<p style=\"margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;\">Handcrafted with love</p>" +
            "</td></tr>" +
            // Body
            "<tr><td style=\"background:#fff;padding:40px;\">" +
            content +
            // Footer
            "<hr style=\"border:none;border-top:1px solid #f0e8e4;margin:32px 0 24px;\">" +
            "<p style=\"margin:0;font-size:12px;color:#aaa;text-align:center;line-height:1.8;\">Questions? Reach us at " +
            "<a href=\"mailto:hello@confectioncobakery.com\" style=\"color:#e0849a;text-decoration:none;\">hello@confectioncobakery.com</a>" +
            " or <a href=\"tel:8506307355\" style=\"color:#e0849a;text-decoration:none;\">850-630-7355</a><br>" +
            "<span style=\"color:#ccc;\">&copy; Confection Co. Bakery</span></p>" +
            "</td></tr>" +
            "</table></td></tr></table>" +
            "</body></html>";
    }

    private String h2(String text) {
        return "<h2 style=\"margin:0 0 16px;color:#2d2d2d;font-size:22px;font-weight:700;\">" + text + "</h2>";
    }

    private String p(String text) {
        return "<p style=\"margin:0 0 16px;color:#555;line-height:1.7;font-size:15px;\">" + text + "</p>";
    }

    private String pSmall(String text) {
        return "<p style=\"margin:16px 0 0;font-size:13px;color:#aaa;line-height:1.6;word-break:break-all;\">" + text + "</p>";
    }

    private String button(String url, String label) {
        return "<p style=\"margin:24px 0;text-align:center;\">" +
               "<a href=\"" + url + "\" style=\"background:#e0849a;color:#fff;padding:14px 32px;" +
               "border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;font-size:15px;\">" +
               label + "</a></p>";
    }

    private String link(String href, String label) {
        return "<a href=\"" + href + "\" style=\"color:#e0849a;text-decoration:none;\">" + label + "</a>";
    }

    private void send(String recipient, String subject, String html) {
        try {
            resend.emails().send(CreateEmailOptions.builder()
                    .from(from)
                    .to(recipient)
                    .subject(subject)
                    .html(html)
                    .build());
        } catch (ResendException e) {
            throw new EmailServiceException("Failed to send email: " + e.getMessage());
        }
    }
}
