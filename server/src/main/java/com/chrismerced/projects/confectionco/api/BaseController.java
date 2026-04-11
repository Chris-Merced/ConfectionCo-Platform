package com.chrismerced.projects.confectionco.api;

import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.chrismerced.projects.confectionco.services.ResendEmailService;

//TODO: --> ConfectionCoApplication.java    
//     Change constructor for DI
@CrossOrigin(origins = "http://localhost:5173")

@RestController
public class BaseController {
    
    private final ResendEmailService resend;

    BaseController(ResendEmailService resend) {
        this.resend = resend;
    }

    @GetMapping("/api/base")
    public Map<String, String> base(){
        //resend.sendEmail();        
        return Map.of("status", "ok");
    }
}
