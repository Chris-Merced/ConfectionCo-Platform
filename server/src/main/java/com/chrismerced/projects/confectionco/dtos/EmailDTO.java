package com.chrismerced.projects.confectionco.dtos;

public class EmailDTO {

    private String recipient;
    private String receipt;

    public EmailDTO(String recipient, String receipt){
        this.recipient = recipient;
        this.receipt = receipt;
    }

    public void setRecipient(String recipient){
        this.recipient = recipient;
    }
    public String getRecipient(){
        return this.recipient;
    }
    public void setReceipt(String receipt){
        this.receipt = receipt;
    }
    public String getReceipt(){
        return this.receipt;
    }
}
