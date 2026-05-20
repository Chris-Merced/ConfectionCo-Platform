package com.chrismerced.projects.confectionco.services;

public interface EmailService {
    void sendReceipt(String recipient, String receipt);
    void sendOrderConfirmation(String recipient);
    void sendDepositPaymentLink(String recipient, String url);
    void sendFinalPaymentLink(String recipient, String url);
    void sendDepositReceipt(String recipient);
    void sendFullPaymentConfirmation(String recipient);
    void sendRefundConfirmation(String recipient);
}
