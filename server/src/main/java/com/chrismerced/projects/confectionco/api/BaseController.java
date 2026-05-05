package com.chrismerced.projects.confectionco.api;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.authentication.LoginRequest;
import com.chrismerced.projects.confectionco.services.EmailService;
import com.chrismerced.projects.confectionco.services.TextingService;

//TODO: --> ConfectionCoApplication.java    
//     Properly seperate api from authenticated and non-authenticated routes in securityconfig
//     Continue from OrderService.java and work on idempotency then how to actually interact with DB
@CrossOrigin(origins = { "http://localhost:5173" })

@RestController
public class BaseController {

    private final EmailService email;
    private final TextingService messenger;

    BaseController(EmailService email, TextingService textingService) {
        this.email = email;
        this.messenger = textingService;
    }

    @GetMapping("/api/base")
    public Map<String, String> base() {
        // email.sendEmail();
        // messenger.sendText();
        return Map.of("status", "ok");
    }

    @GetMapping("/api/resend")
    public Map<String, Boolean> sendEmail() {
        try {
            // email.sendReceipt();

            return Map.of("success", true);
        } catch (Exception error) {
            return Map.of("success", false);
        }
    }

    @PostMapping("/api/login")
    public Map<String, String> login(@RequestBody LoginRequest request) {
        String user = request.getUsername();
        String pass = request.getPassword();

        System.out.println(user);
        System.out.println(pass);
        return Map.of("status", "okay");
    }

    // Authenticate account and retrieve orders
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/authentication")
    public Map<String, String> auth() {

        

        return Map.of("Success", "ok");

    }

}
