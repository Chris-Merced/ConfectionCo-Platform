package com.chrismerced.projects.confectionco.api;

import java.util.Map;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("api/admin")
public class AdminController {

    AdminController(){

    }

    // Authenticate account and retrieve orders
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/authentication")
    public Map<String, String> auth() {

        

        return Map.of("Success", "ok");

    }


}
