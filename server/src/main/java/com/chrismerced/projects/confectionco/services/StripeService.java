package com.chrismerced.projects.confectionco.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
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

        public String createDepositCheckout(Long orderId, long amountInCents, String orderType) throws Exception {

                SessionCreateParams params = SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .putMetadata("orderId", String.valueOf(orderId))
                        .putMetadata("orderType", orderType)
                        .setSuccessUrl("http://localhost:5173/payment-success?orderId=" + orderId)
                        .setCancelUrl("http://localhost:5173/payment-cancel")
                        .addLineItem(
                                SessionCreateParams.LineItem.builder()
                                        .setQuantity(1L)
                                        .setPriceData(
                                                SessionCreateParams.LineItem.PriceData
                                                        .builder()
                                                        .setCurrency("usd")
                                                        .setUnitAmount(amountInCents)
                                                        .setProductData(
                                                                SessionCreateParams.LineItem.PriceData.ProductData
                                                                                .builder()
                                                                                .setName("Order Deposit")
                                                                                .build())
                                                        .build())
                                                .build())
                        .build();

                Session session = Session.create(params);

                return session.getUrl();
        }
}