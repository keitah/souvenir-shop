package com.example.shop.product;

import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class AdminProductController {

    private final ProductRepository products;

    public AdminProductController(ProductRepository products) {
        this.products = products;
    }

    private static final BigDecimal MAX_PRICE = new BigDecimal("10000000000");
    private static final int MAX_STOCK = 10_000;

    /**
     * Приводим цену и остаток к допустимым границам,
     * чтобы защититься от ошибок/спама на фронте.
     */
    
    private Product applyLimits(Product p) {
        if (p == null) {
            return null;
        }

        // Безопасно обрезаем и нормализуем название
        String name = p.getName();
        if (name != null) {
            name = name.trim();
            if (name.length() > 255) {
                name = name.substring(0, 255);
            }
        } else {
            name = "";
        }
        if (name.isEmpty()) {
            name = "Без названия";
        }
        p.setName(name);

        // Обрезаем описание до разумной длины
        String description = p.getDescription();
        if (description != null) {
            description = description.trim();
            if (description.length() > 2000) {
                description = description.substring(0, 2000);
            }
        }
        p.setDescription(description);

        BigDecimal price = p.getPrice();
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            price = BigDecimal.ZERO;
        }
        if (price.compareTo(MAX_PRICE) > 0) {
            price = MAX_PRICE;
        }
        p.setPrice(price);

        Integer stock = p.getStock();
        if (stock == null || stock < 0) {
            stock = 0;
        }
        if (stock > MAX_STOCK) {
            stock = MAX_STOCK;
        }
        p.setStock(stock);

        return p;
    }
@GetMapping
    public List<Product> list() {
        return products.findAll();
    }

    @PostMapping
    public Product create(@RequestBody Product p) {
        p.setId(null);
        applyLimits(p);
        return products.save(p);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product p) {
        var existing = products.findById(id).orElseThrow();
        existing.setName(p.getName());
        existing.setDescription(p.getDescription());
        existing.setPrice(p.getPrice());
        existing.setImageUrl(p.getImageUrl());
        existing.setStock(p.getStock());
        applyLimits(existing);
        return products.save(existing);
    }

    

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        products.deleteById(id);
        return ResponseEntity.ok().build();
    }
}