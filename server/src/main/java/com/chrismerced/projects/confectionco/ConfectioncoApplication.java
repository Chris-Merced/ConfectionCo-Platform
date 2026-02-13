package com.chrismerced.projects.confectionco;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


// TODO:
// 	Set up the db to utilize an email system rather than a user account system
//  we can have an email table with the email and points
//  hash email on storage
// 	email table will be tied to orders table, orders will have
//      order # (uuid), total_payment, payment_made, payment_pending, date_ordered, date_delivery, item_number, inspiration, description
// items table - item number (unique identifier), and list_ordered number (what order the item appears on the website) 
//      need to be different for visual ordering on website, description, img_url 
// will have to use S3 to store user photos
// use Stripe for payments


@SpringBootApplication
public class ConfectioncoApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConfectioncoApplication.class, args);
	}

}
