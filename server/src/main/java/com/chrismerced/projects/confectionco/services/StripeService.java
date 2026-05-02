package com.chrismerced.projects.confectionco.services;

public class StripeService implements PaymentService{
    

    StripeService(){

   }

   //Generates Link to be sent through Twilio Service
   public String generateLink(){
        return ("Dummy Text");
   }

   //Need to add webhook to be used to send messages to Isabel on payment processed
}
