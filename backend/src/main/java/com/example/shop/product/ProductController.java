package com.example.shop.product;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class ProductController {

    private final ProductRepository products;

    public ProductController(ProductRepository products) {
        this.products = products;
    }

    @GetMapping
    public List<Product> getAll() {
        return products.findAll();
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return products.findById(id).orElseThrow();
    }
}
