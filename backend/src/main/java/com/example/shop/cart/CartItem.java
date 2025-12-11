package com.example.shop.cart;

import com.example.shop.product.Product;
import com.example.shop.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(
        name = "cart_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"})
)
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Пользователь нам не нужен на фронте, поэтому просто скрываем его из JSON
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JsonIgnore
    private User user;

    // Product будет сериализоваться, а служебные поля Hibernate мы игнорируем в самом классе Product
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    public CartItem() {
    }

    public CartItem(Long id, User user, Product product, Integer quantity) {
        this.id = id;
        this.user = user;
        this.product = product;
        this.quantity = quantity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
