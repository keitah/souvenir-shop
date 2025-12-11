package com.example.shop.order;

import java.util.List;

public record CreateOrderRequest(
        List<Long> cartItemIds
) { }
