package com.chrismerced.projects.confectionco.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class BaseController {
    
    @GetMapping("/api/base")
    public String base(){
        return "ok";
    }
}
