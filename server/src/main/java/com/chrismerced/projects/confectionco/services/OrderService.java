package com.chrismerced.projects.confectionco.services;

import org.springframework.stereotype.Service;

import com.stripe.model.Event;
import com.stripe.model.checkout.Session;

import com.chrismerced.projects.confectionco.model.Order;
import com.chrismerced.projects.confectionco.repository.OrderRepository;

@Service
public class OrderService {

    OrderRepository orderRepository;
    
    OrderService(OrderRepository repository){
        this.orderRepository = repository;
    }

    public void handleStripeEvent(Event event) {

        switch (event.getType()) {

            case "checkout.session.completed" -> {
                var deserializer = event.getDataObjectDeserializer();

                if (deserializer.getObject().isEmpty()) {
                    System.out.println("Failed to deserialize event: " + event.getId());
                    return;
                }

                Session session = (Session) deserializer.getObject().get();

                handleStripeCheckoutCompleted(session);
            }

            default -> {
                System.out.println("Unhandled event: " + event.getType());
            }
        }

    }

    public void handleStripeCheckoutCompleted(Session session) {

        
        Long orderId = Long.valueOf(session.getMetadata().get("orderId"));
        String orderType = session.getMetadata().get("orderType");

        Order order = orderRepository.findById(orderId)
        .orElseThrow(() -> new RuntimeException("Order not found"));


        //order.setDepositPaid(true);
        //order.setFullPaymentPaid(true);
        //order.setStatus(OrderStatus.IN_PROGRESS);

        //orderRepository.save(order)
    }
}