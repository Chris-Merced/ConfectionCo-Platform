package com.chrismerced.projects.confectionco.services;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
   
    Email email;

    EmailService(Email email){
        this.email = email;
    }

    public void sendEmail(){
        
    }
}