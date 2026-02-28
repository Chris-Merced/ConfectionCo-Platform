package com.chrismerced.projects.confectionco;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


// TODO:
// 	Set up the db to utilize an email system rather than a user account system
//  -  Email will be used to house phone number, points and associate orders
//  -  Email will be used to track order histories
//  we can have an email table with the email and points
//  hash email on storage
// 	email table will be tied to orders table, orders will have
//      order # (uuid), total_payment, payment_made, payment_pending, date_ordered, date_delivery, item_number, inspiration, description
// items table - item number (unique identifier), and list_ordered number (what order the item appears on the website) 
//      need to be different for visual ordering on website, description, img_url 
// will have to use S3 to store user photos - set expiration on the date of order, modify expiration on order change if necessary
// use Stripe for payments
// Need to figure out texting system
// Create a high level layout for the website (in total what pages need to be made)
//  - context wrap the cart from local storage 
//   			- - - set cart to local storage which will be an array of items with the same order number
//		- Header containing cart info
//			- Main page for ordering -> Small portfolio window, below this have a grid of item cards to order from
//   			- - - main content that shows menu items
//              - - - - - Each item with clickthrough to popup form for detailed ordering, then closes on cart addition 
// 							or "Go to Cart" button 
//				- - - - Each item will contain full information on order with description and inspo
//				- - - - - upon filling out an item, prompt user to go directly to cart or continue shopping
// 				- - - - Orders cannot be for two seperate locations or events
// 			- Cart Page for completing order
//  		- Portfolio page (set up to pull from instagram account)
// 				- Set up as gallery -> should probably have a preview window of this one the main page


@SpringBootApplication
public class ConfectioncoApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConfectioncoApplication.class, args);
	}

}
