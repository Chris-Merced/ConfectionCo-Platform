package com.chrismerced.projects.confectionco.services;

import org.springframework.stereotype.Service;

@Service
public class OrderService {

    public void markDepositPaid(Long orderId) {
        System.out.println("Deposit paid for order: " + orderId);

        // TODO next step:
        // 1. fetch order from DB
        // 2. update deposit_paid = true
        // 3. update status = IN_PROGRESS or AWAITING_FINAL_PAYMENT
    }
}