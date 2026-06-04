package com.chrismerced.projects.confectionco.api;

import java.math.BigDecimal;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chrismerced.projects.confectionco.model.ButtercreamOption;
import com.chrismerced.projects.confectionco.model.CheesecakeCrustOption;
import com.chrismerced.projects.confectionco.model.FillingOption;
import com.chrismerced.projects.confectionco.model.FixedProduct;
import com.chrismerced.projects.confectionco.model.FlavorOption;
import com.chrismerced.projects.confectionco.model.ItemSize;
import com.chrismerced.projects.confectionco.model.PieStyleOption;
import com.chrismerced.projects.confectionco.repository.ButtercreamOptionRepository;
import com.chrismerced.projects.confectionco.repository.CheesecakeCrustOptionRepository;
import com.chrismerced.projects.confectionco.repository.FillingOptionRepository;
import com.chrismerced.projects.confectionco.repository.FixedProductRepository;
import com.chrismerced.projects.confectionco.repository.FlavorOptionRepository;
import com.chrismerced.projects.confectionco.repository.ItemSizeRepository;
import com.chrismerced.projects.confectionco.repository.PieStyleOptionRepository;
import com.chrismerced.projects.confectionco.util.InputSanitizer;

@RestController
public class OptionsController {

    private final FlavorOptionRepository flavorRepo;
    private final FillingOptionRepository fillingRepo;
    private final ButtercreamOptionRepository buttercreamRepo;
    private final PieStyleOptionRepository pieStyleRepo;
    private final CheesecakeCrustOptionRepository cheesecakeCrustRepo;
    private final ItemSizeRepository sizeRepo;
    private final FixedProductRepository fixedProductRepo;

    OptionsController(FlavorOptionRepository flavorRepo, FillingOptionRepository fillingRepo,
            ButtercreamOptionRepository buttercreamRepo, PieStyleOptionRepository pieStyleRepo,
            CheesecakeCrustOptionRepository cheesecakeCrustRepo, ItemSizeRepository sizeRepo,
            FixedProductRepository fixedProductRepo) {
        this.flavorRepo = flavorRepo;
        this.fillingRepo = fillingRepo;
        this.buttercreamRepo = buttercreamRepo;
        this.pieStyleRepo = pieStyleRepo;
        this.cheesecakeCrustRepo = cheesecakeCrustRepo;
        this.sizeRepo = sizeRepo;
        this.fixedProductRepo = fixedProductRepo;
    }

    // ── Public GET endpoints ──────────────────────────────────────────────────

    @GetMapping("/api/options/flavors")
    public List<Map<String, Object>> getFlavors(@RequestParam String itemType) {
        return flavorRepo.findByItemTypeAndActiveTrue(itemType.toUpperCase()).stream()
                .map(o -> Map.<String, Object>of("id", o.getId(), "name", o.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/api/options/fillings")
    public List<Map<String, Object>> getFillings() {
        return fillingRepo.findByActiveTrue().stream()
                .map(o -> Map.<String, Object>of("id", o.getId(), "name", o.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/api/options/buttercreams")
    public List<Map<String, Object>> getButtercreams() {
        return buttercreamRepo.findByActiveTrue().stream()
                .map(o -> Map.<String, Object>of("id", o.getId(), "name", o.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/api/options/pie-styles")
    public List<Map<String, Object>> getPieStyles(@RequestParam String pieType) {
        return pieStyleRepo.findByPieTypeAndActiveTrue(pieType.toUpperCase()).stream()
                .map(o -> Map.<String, Object>of("id", o.getId(), "name", o.getName()))
                .collect(Collectors.toList());
    }

    @GetMapping("/api/options/cheesecake-crusts")
    public List<Map<String, Object>> getCheesecakeCrusts() {
        return cheesecakeCrustRepo.findByActiveTrue().stream()
                .map(o -> Map.<String, Object>of(
                        "id", o.getId(), "name", o.getName(), "glutenFree", o.isGlutenFree()))
                .collect(Collectors.toList());
    }

    @GetMapping("/api/options/sizes")
    public List<Map<String, Object>> getSizes(@RequestParam String itemType) {
        return sizeRepo.findByItemTypeAndActiveTrue(itemType.toUpperCase()).stream()
                .map(o -> Map.<String, Object>of(
                        "id", o.getId(), "label", o.getLabel(),
                        "description", o.getDescription() != null ? o.getDescription() : "",
                        "price", o.getPrice()))
                .collect(Collectors.toList());
    }

    @GetMapping("/api/options/fixed-products")
    public List<Map<String, Object>> getFixedProducts() {
        return fixedProductRepo.findByActiveTrue().stream()
                .map(o -> Map.<String, Object>of(
                        "id", o.getId(), "name", o.getName(),
                        "description", o.getDescription() != null ? o.getDescription() : "",
                        "price", o.getPrice(),
                        "unitDescription", o.getUnitDescription() != null ? o.getUnitDescription() : ""))
                .collect(Collectors.toList());
    }

    // ── Admin POST endpoints ──────────────────────────────────────────────────

    @PostMapping("/api/admin/options/flavors")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addFlavor(@RequestBody Map<String, String> body) {
        String name = InputSanitizer.stripHtml(body.get("name"));
        String itemType = InputSanitizer.stripHtml(body.get("itemType"));
        if (name == null || name.isBlank() || itemType == null || itemType.isBlank())
            return ResponseEntity.badRequest().build();
        FlavorOption o = new FlavorOption();
        o.setName(name);
        o.setItemType(itemType.toUpperCase());
        FlavorOption saved = flavorRepo.save(o);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName(), "itemType", saved.getItemType()));
    }

    @PostMapping("/api/admin/options/fillings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addFilling(@RequestBody Map<String, String> body) {
        String name = InputSanitizer.stripHtml(body.get("name"));
        if (name == null || name.isBlank())
            return ResponseEntity.badRequest().build();
        FillingOption o = new FillingOption();
        o.setName(name);
        FillingOption saved = fillingRepo.save(o);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName()));
    }

    @PostMapping("/api/admin/options/buttercreams")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addButtercream(@RequestBody Map<String, String> body) {
        String name = InputSanitizer.stripHtml(body.get("name"));
        if (name == null || name.isBlank())
            return ResponseEntity.badRequest().build();
        ButtercreamOption o = new ButtercreamOption();
        o.setName(name);
        ButtercreamOption saved = buttercreamRepo.save(o);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName()));
    }

    @PostMapping("/api/admin/options/pie-styles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addPieStyle(@RequestBody Map<String, String> body) {
        String pieType = InputSanitizer.stripHtml(body.get("pieType"));
        String name = InputSanitizer.stripHtml(body.get("name"));
        if (pieType == null || pieType.isBlank() || name == null || name.isBlank())
            return ResponseEntity.badRequest().build();
        PieStyleOption o = new PieStyleOption();
        o.setPieType(pieType.toUpperCase());
        o.setName(name);
        PieStyleOption saved = pieStyleRepo.save(o);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "pieType", saved.getPieType(), "name", saved.getName()));
    }

    @PostMapping("/api/admin/options/cheesecake-crusts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addCheesecakeCrust(@RequestBody Map<String, Object> body) {
        String name = InputSanitizer.stripHtml((String) body.get("name"));
        if (name == null || name.isBlank())
            return ResponseEntity.badRequest().build();
        boolean glutenFree = Boolean.TRUE.equals(body.get("glutenFree"));
        CheesecakeCrustOption o = new CheesecakeCrustOption();
        o.setName(name);
        o.setGlutenFree(glutenFree);
        CheesecakeCrustOption saved = cheesecakeCrustRepo.save(o);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName(), "glutenFree", saved.isGlutenFree()));
    }

    @PostMapping("/api/admin/options/sizes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addSize(@RequestBody Map<String, Object> body) {
        String itemType = InputSanitizer.stripHtml((String) body.get("itemType"));
        String label = InputSanitizer.stripHtml((String) body.get("label"));
        if (itemType == null || itemType.isBlank() || label == null || label.isBlank())
            return ResponseEntity.badRequest().build();
        String description = InputSanitizer.stripHtml((String) body.get("description"));
        BigDecimal price = body.get("price") != null
                ? new BigDecimal(body.get("price").toString())
                : BigDecimal.ZERO;
        ItemSize o = new ItemSize();
        o.setItemType(itemType.toUpperCase());
        o.setLabel(label);
        o.setDescription(description);
        o.setPrice(price);
        ItemSize saved = sizeRepo.save(o);
        return ResponseEntity.ok(Map.of(
                "id", saved.getId(), "itemType", saved.getItemType(),
                "label", saved.getLabel(), "price", saved.getPrice()));
    }

    @PostMapping("/api/admin/options/fixed-products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> addFixedProduct(@RequestBody Map<String, Object> body) {
        String name = InputSanitizer.stripHtml((String) body.get("name"));
        if (name == null || name.isBlank())
            return ResponseEntity.badRequest().build();
        String description = InputSanitizer.stripHtml((String) body.get("description"));
        String unitDescription = InputSanitizer.stripHtml((String) body.get("unitDescription"));
        BigDecimal price = body.get("price") != null
                ? new BigDecimal(body.get("price").toString())
                : BigDecimal.ZERO;
        FixedProduct o = new FixedProduct();
        o.setName(name);
        o.setDescription(description);
        o.setPrice(price);
        o.setUnitDescription(unitDescription);
        FixedProduct saved = fixedProductRepo.save(o);
        return ResponseEntity.ok(Map.of("id", saved.getId(), "name", saved.getName(), "price", saved.getPrice()));
    }

    // ── Admin DELETE endpoints (soft-delete via is_active) ────────────────────

    @DeleteMapping("/api/admin/options/flavors/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFlavor(@PathVariable Long id) {
        return softDelete(flavorRepo.findById(id).orElse(null),
                o -> { o.setActive(false); flavorRepo.save(o); });
    }

    @DeleteMapping("/api/admin/options/fillings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFilling(@PathVariable Long id) {
        return softDelete(fillingRepo.findById(id).orElse(null),
                o -> { o.setActive(false); fillingRepo.save(o); });
    }

    @DeleteMapping("/api/admin/options/buttercreams/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteButtercream(@PathVariable Long id) {
        return softDelete(buttercreamRepo.findById(id).orElse(null),
                o -> { o.setActive(false); buttercreamRepo.save(o); });
    }

    @DeleteMapping("/api/admin/options/pie-styles/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePieStyle(@PathVariable Long id) {
        return softDelete(pieStyleRepo.findById(id).orElse(null),
                o -> { o.setActive(false); pieStyleRepo.save(o); });
    }

    @DeleteMapping("/api/admin/options/cheesecake-crusts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCheesecakeCrust(@PathVariable Long id) {
        return softDelete(cheesecakeCrustRepo.findById(id).orElse(null),
                o -> { o.setActive(false); cheesecakeCrustRepo.save(o); });
    }

    @DeleteMapping("/api/admin/options/sizes/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSize(@PathVariable Long id) {
        return softDelete(sizeRepo.findById(id).orElse(null),
                o -> { o.setActive(false); sizeRepo.save(o); });
    }

    @DeleteMapping("/api/admin/options/fixed-products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFixedProduct(@PathVariable Long id) {
        return softDelete(fixedProductRepo.findById(id).orElse(null),
                o -> { o.setActive(false); fixedProductRepo.save(o); });
    }

    private <T> ResponseEntity<Void> softDelete(T entity, java.util.function.Consumer<T> deactivate) {
        if (entity == null) return ResponseEntity.notFound().build();
        deactivate.accept(entity);
        return ResponseEntity.noContent().build();
    }
}
