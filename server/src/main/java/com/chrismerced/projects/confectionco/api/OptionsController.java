package com.chrismerced.projects.confectionco.api;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.model.ButtercreamOption;
import com.chrismerced.projects.confectionco.model.FillingOption;
import com.chrismerced.projects.confectionco.model.FlavorOption;
import com.chrismerced.projects.confectionco.repository.ButtercreamOptionRepository;
import com.chrismerced.projects.confectionco.repository.FillingOptionRepository;
import com.chrismerced.projects.confectionco.repository.FlavorOptionRepository;
import com.chrismerced.projects.confectionco.util.InputSanitizer;

@RestController
public class OptionsController {

    private final FlavorOptionRepository flavorRepo;
    private final FillingOptionRepository fillingRepo;
    private final ButtercreamOptionRepository buttercreamRepo;

    OptionsController(FlavorOptionRepository flavorRepo, FillingOptionRepository fillingRepo,
            ButtercreamOptionRepository buttercreamRepo) {
        this.flavorRepo = flavorRepo;
        this.fillingRepo = fillingRepo;
        this.buttercreamRepo = buttercreamRepo;
    }

    // --- Public GET endpoints ---

    @GetMapping("/api/options/flavors")
    public List<Map<String, Object>> getFlavors() {
        return flavorRepo.findAll().stream()
                .map(o -> Map.<String, Object>of("id", o.getId(), "name", o.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/api/options/fillings")
    public List<Map<String, Object>> getFillings() {
        return fillingRepo.findAll().stream()
                .map(o -> Map.<String, Object>of("id", o.getId(), "name", o.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/api/options/buttercreams")
    public List<Map<String, Object>> getButtercreams() {
        return buttercreamRepo.findAll().stream()
                .map(o -> Map.<String, Object>of("id", o.getId(), "name", o.getName()))
                .collect(Collectors.toList());
    }

    // --- Admin POST endpoints ---

    @PostMapping("/api/admin/options/flavors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addFlavor(@RequestBody Map<String, String> body) {
        String name = InputSanitizer.stripHtml(body.get("name"));
        if (name == null || name.isBlank()) return ResponseEntity.badRequest().build();
        FlavorOption o = new FlavorOption();
        o.setName(name);
        FlavorOption saved = flavorRepo.save(o);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName()));
    }

    @PostMapping("/api/admin/options/fillings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addFilling(@RequestBody Map<String, String> body) {
        String name = InputSanitizer.stripHtml(body.get("name"));
        if (name == null || name.isBlank()) return ResponseEntity.badRequest().build();
        FillingOption o = new FillingOption();
        o.setName(name);
        FillingOption saved = fillingRepo.save(o);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName()));
    }

    @PostMapping("/api/admin/options/buttercreams")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addButtercream(@RequestBody Map<String, String> body) {
        String name = InputSanitizer.stripHtml(body.get("name"));
        if (name == null || name.isBlank()) return ResponseEntity.badRequest().build();
        ButtercreamOption o = new ButtercreamOption();
        o.setName(name);
        ButtercreamOption saved = buttercreamRepo.save(o);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName()));
    }

    // --- Admin DELETE endpoints ---

    @DeleteMapping("/api/admin/options/flavors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFlavor(@PathVariable Long id) {
        if (!flavorRepo.existsById(id)) return ResponseEntity.notFound().build();
        flavorRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/admin/options/fillings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFilling(@PathVariable Long id) {
        if (!fillingRepo.existsById(id)) return ResponseEntity.notFound().build();
        fillingRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/admin/options/buttercreams/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteButtercream(@PathVariable Long id) {
        if (!buttercreamRepo.existsById(id)) return ResponseEntity.notFound().build();
        buttercreamRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
