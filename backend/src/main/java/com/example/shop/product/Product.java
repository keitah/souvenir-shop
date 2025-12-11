package com.example.shop.product;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
// Игнорируем служебные поля Hibernate, чтобы не падала сериализация прокси Hibernate
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 63)
    private String name;

    /**
     * Описание товара, до 1000 символов.
     */
    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    /**
     * Путь к изображению (URL, который отдаём на фронт).
     */
    private String imageUrl;

    /**
     * Остаток товара на складе. Может быть null (без ограничения).
     */
    private Integer stock;

    public Product() {
    }

    public Product(Long id, String name, String description, BigDecimal price, String imageUrl, Integer stock) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.stock = stock;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
}