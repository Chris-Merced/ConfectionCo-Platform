package com.chrismerced.projects.confectionco.api;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.authentication.LoginRequest;
import com.chrismerced.projects.confectionco.services.EmailService;
import com.chrismerced.projects.confectionco.services.TextingService;

//TODO: --> ConfectionCoApplication.java    
//     Continue from OrderService.java and work on idempotency then how to actually interact with DB
@CrossOrigin(origins = { "http://localhost:5173" })

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final EmailService email;
    private final TextingService messenger;

    UserController(EmailService email, TextingService textingService) {
        this.email = email;
        this.messenger = textingService;
    }

    @GetMapping("/api/base")
    public Map<String, String> base() {
        // email.sendEmail();
         messenger.sendText();
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

}
