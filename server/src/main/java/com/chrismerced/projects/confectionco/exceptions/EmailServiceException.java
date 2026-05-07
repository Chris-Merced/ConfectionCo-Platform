package com.chrismerced.projects.confectionco.exceptions;

public class EmailServiceException extends RuntimeException{
    public EmailServiceException(String message){
        super(message);
    }
}