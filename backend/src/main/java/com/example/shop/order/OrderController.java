package com.example.shop.order;

import com.example.shop.cart.CartItem;
import com.example.shop.cart.CartItemRepository;
import com.example.shop.product.Product;
import com.example.shop.product.ProductRepository;
import com.example.shop.user.User;
import com.example.shop.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class OrderController {

    private final OrderRepository orders;
    private final CartItemRepository cartItems;
    private final UserRepository users;
    private final ProductRepository products;

    public OrderController(
            OrderRepository orders,
            CartItemRepository cartItems,
            UserRepository users,
            ProductRepository products
    ) {
        this.orders = orders;
        this.cartItems = cartItems;
        this.users = users;
        this.products = products;
    }

    private User currentUser(Authentication auth) {
        String username = auth.getName();
        return users.findByUsername(username).orElseThrow();
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody(required = false) CreateOrderRequest request,
            Authentication auth
    ) {
        User user = currentUser(auth);

        // Все позиции корзины пользователя
        List<CartItem> userItems = cartItems.findByUser(user);
        if (userItems.isEmpty()) {
            return ResponseEntity.badRequest().body("Корзина пуста");
        }

        // Если пришёл список id – фильтруем только их
        List<CartItem> itemsToOrder = userItems;
        if (request != null && request.cartItemIds() != null && !request.cartItemIds().isEmpty()) {
            Set<Long> ids = request.cartItemIds().stream().collect(Collectors.toSet());
            itemsToOrder = userItems.stream()
                    .filter(ci -> ids.contains(ci.getId()))
                    .collect(Collectors.toList());
        }

        if (itemsToOrder.isEmpty()) {
            return ResponseEntity.badRequest().body("Не выбрано ни одной позиции для оформления");
        }

        // Проверяем и уменьшаем остатки по каждому товару
        for (CartItem ci : itemsToOrder) {
            Product product = ci.getProduct();
            Integer stock = product.getStock();
            Integer qty = ci.getQuantity();

            if (qty == null || qty <= 0) {
                continue;
            }

            if (stock != null) {
                if (stock < qty) {
                    return ResponseEntity.badRequest()
                            .body("Недостаточно товара \"" + product.getName() + "\" на складе");
                }
            }
        }

        // Если проверки прошли, уменьшаем stock
        for (CartItem ci : itemsToOrder) {
            Product product = ci.getProduct();
            Integer stock = product.getStock();
            Integer qty = ci.getQuantity();

            if (qty == null || qty <= 0) {
                continue;
            }

            if (stock != null) {
                product.setStock(stock - qty);
                products.save(product);
            }
        }

        // Считаем итоговую сумму по выбранным позициям
        BigDecimal total = itemsToOrder.stream()
                .map(ci -> ci.getProduct().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b));

        Order order = new Order();
        order.setUser(user);
        order.setCreatedAt(Instant.now());
        order.setStatus("NEW");
        order.setTotalPrice(total);

        orders.save(order);

        // Удаляем из корзины только оформленные позиции
        cartItems.deleteAll(itemsToOrder);

        return ResponseEntity.ok(order);
    }

    @GetMapping
    public List<Order> myOrders(Authentication auth) {
        return orders.findByUser(currentUser(auth));
    }
}
