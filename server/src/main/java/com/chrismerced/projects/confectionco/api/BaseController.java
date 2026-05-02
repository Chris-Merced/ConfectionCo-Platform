package com.chrismerced.projects.confectionco.api;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.services.EmailService;
import com.chrismerced.projects.confectionco.services.TextingService;

//TODO: --> ConfectionCoApplication.java    
//     Start setting up auth0, only proof of concept to log in, set up route in react
@CrossOrigin(origins = "http://localhost:5173")

@RestController
public class BaseController {

    private final EmailService email;
    private final TextingService textingService;

    BaseController(EmailService email, TextingService textingService) {
        this.email = email;
        this.textingService = textingService;
    }

    @GetMapping("/api/base")
    public Map<String, String> base() {
        // email.sendEmail();
        textingService.sendText();
        return Map.of("status", "ok");
    }

    @GetMapping("/api/resend")
    public Map<String, Boolean> sendEmail() {
        try {
            //email.sendReceipt();

            return Map.of("success", true);
        } catch (Exception error) {
            return Map.of("success", false);
        }
    }
}
