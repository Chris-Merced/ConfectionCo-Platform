package com.chrismerced.projects.confectionco.api;

import java.util.Map;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

//TODO: Modify CORS to ENV variables between prod and dev
@CrossOrigin(origins = "http://localhost:5173")

@RestController
public class BaseController {
    
    @GetMapping("/api/base")
    public Map<String, String> base(){
        return Map.of("status", "ok");
    }
}
