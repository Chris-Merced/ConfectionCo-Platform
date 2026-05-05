package com.chrismerced.projects.confectionco.repository;

import com.chrismerced.projects.confectionco.model.Order;

public class OrderRepository {
    //used to find all order information within db by id and return it
    // OrderRepository creates an Order model and returns it

    public Order findByID(Long id){
        //search db for id and construct a new order
        
        return new Order();
    }

    public void save(Order order){
        //save the order passed through in db
    }
}
