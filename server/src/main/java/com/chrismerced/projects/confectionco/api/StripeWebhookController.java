package com.chrismerced.projects.confectionco.api;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.services.OrderService;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private final OrderService orderService;

    public StripeWebhookController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/webhook")
    public void handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) throws Exception {

        String endpointSecret = "Put secret here later";

        Event event = Webhook.constructEvent(
                payload,
                sigHeader,
                endpointSecret);

        switch (event.getType()) {

            case "checkout.session.completed" -> {
                Session session = (Session) event.getDataObjectDeserializer()
                        .getObject()
                        .orElse(null);

                if (session != null) {
                    String orderId = session.getClientReferenceId();

                    System.out.println("Payment succeeded for order: " + orderId);

                    orderService.markDepositPaid(Long.valueOf(orderId));
                }
            }

            default -> {
                System.out.println("Unhandled event: " + event.getType());
            }
        }
    }
}