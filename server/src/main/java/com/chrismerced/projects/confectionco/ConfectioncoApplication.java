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
// Need to figure out texting system
// Create a high level layout for the website (in total what pages need to be made)
//  - context wrap the cart from local storage 
//		- Header containing cart info
//			- Main page for ordering
//   			- - - main content that shows menu with clickthrough to ordering
//   			- - - set cart to local storage which will be an array of items with the same order number
//				- - - - Each item will contain full information on order with description and inspo
// 				- - - - Orders cannot be for two seperate locations or events
// 			- Cart Page for completing order

@SpringBootApplication
public class ConfectioncoApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConfectioncoApplication.class, args);
	}

}
