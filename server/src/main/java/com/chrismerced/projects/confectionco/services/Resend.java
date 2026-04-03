package com.chrismerced.projects.confectionco.services;

import org.springframework.stereotype.Service;

interface Email{
    String sendEmail();
}

@Service
public class Resend implements Email {
    public String sendEmail(){
        return "lol";
    }
}
