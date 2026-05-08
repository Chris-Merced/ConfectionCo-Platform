package com.chrismerced.projects.confectionco.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;

import jakarta.annotation.PostConstruct;

@Service
public class StripeService {

    @Value("${stripe.api.key}")
    private String apiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = apiKey;
    }

    public Session createDepositCheckout(Long orderId, long amountInCents) throws Exception {
        return createCheckoutSession(orderId, amountInCents, "deposit", "Order Deposit");
    }

    public Session createFinalPaymentCheckout(Long orderId, long amountInCents) throws Exception {
        return createCheckoutSession(orderId, amountInCents, "final", "Final Payment");
    }

    public String getSessionUrl(String sessionId) throws Exception {
        return Session.retrieve(sessionId).getUrl();
    }

    public void createRefund(String sessionId, long amountInCents) throws Exception {
        Session session = Session.retrieve(sessionId);
        String paymentIntentId = session.getPaymentIntent();

        Refund.create(RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .setAmount(amountInCents)
                .build());
    }

    private Session createCheckoutSession(Long orderId, long amountInCents, String orderType, String productName)
            throws Exception {

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setClientReferenceId(String.valueOf(orderId))
                .putMetadata("orderId", String.valueOf(orderId))
                .putMetadata("orderType", orderType)
                .setSuccessUrl("http://localhost:5173/payment-success?orderId=" + orderId)
                .setCancelUrl("http://localhost:5173/payment-cancel")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(productName)
                                                                .build())
                                                .build())
                                .build())
                .build();

        return Session.create(params);
    }
}
