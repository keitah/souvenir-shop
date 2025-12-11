package com.example.shop.cart;

import com.example.shop.product.Product;
import com.example.shop.product.ProductRepository;
import com.example.shop.user.User;
import com.example.shop.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class CartController {

    private final CartItemRepository cartItems;
    private final UserRepository users;
    private final ProductRepository products;

    public CartController(
            CartItemRepository cartItems,
            UserRepository users,
            ProductRepository products
    ) {
        this.cartItems = cartItems;
        this.users = users;
        this.products = products;
    }

    private User currentUser(Authentication auth) {
        String username = auth.getName();
        return users.findByUsername(username).orElseThrow();
    }

    @GetMapping
    public List<CartItem> getCart(Authentication auth) {
        return cartItems.findByUser(currentUser(auth));
    }

    private int maxAvailable(Product product) {
        Integer stock = product.getStock();
        if (stock == null || stock < 0) {
            return Integer.MAX_VALUE;
        }
        return stock;
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addToCart(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") Integer quantity,
            Authentication auth
    ) {
        var user = currentUser(auth);
        var product = products.findById(productId).orElseThrow();

        int requested = (quantity == null || quantity <= 0) ? 1 : quantity;
        int stockLimit = maxAvailable(product);

        if (stockLimit <= 0) {
            // Товара совсем нет – просто не даём добавить в корзину
            return ResponseEntity.badRequest().build();
        }

        var existingOpt = cartItems.findByUserAndProductId(user, productId);

        CartItem item = existingOpt.orElse(null);
        int currentQty = item != null ? item.getQuantity() : 0;

        int newQty = currentQty + requested;
        if (newQty > stockLimit) {
            newQty = stockLimit;
        }

        if (item == null) {
            item = new CartItem();
            item.setUser(user);
            item.setProduct(product);
            item.setQuantity(newQty);
        } else {
            item.setQuantity(newQty);
        }

        cartItems.save(item);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/set/{productId}")
    public ResponseEntity<?> setQuantity(
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            Authentication auth
    ) {
        var user = currentUser(auth);
        var item = cartItems.findByUserAndProductId(user, productId)
                .orElseThrow();

        if (quantity == null || quantity <= 0) {
            cartItems.delete(item);
            return ResponseEntity.ok().build();
        }

        var product = products.findById(productId).orElseThrow();
        int stockLimit = maxAvailable(product);

        if (stockLimit <= 0) {
            // Нет остатка – удаляем товар из корзины
            cartItems.delete(item);
            return ResponseEntity.ok().build();
        }

        int newQty = quantity;
        if (newQty > stockLimit) {
            newQty = stockLimit;
        }

        item.setQuantity(newQty);
        cartItems.save(item);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> remove(
            @PathVariable Long productId,
            Authentication auth
    ) {
        var user = currentUser(auth);
        cartItems.findByUserAndProductId(user, productId)
                .ifPresent(cartItems::delete);
        return ResponseEntity.ok().build();
    }
}
