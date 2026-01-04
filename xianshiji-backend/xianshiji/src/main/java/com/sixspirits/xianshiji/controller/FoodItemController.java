package com.sixspirits.xianshiji.controller;

import com.sixspirits.xianshiji.entity.FoodItem;
import com.sixspirits.xianshiji.service.FoodItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/food-items")
public class FoodItemController {

    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserFoodItems(@PathVariable Long userId) {
        try {
            List<FoodItem> items = foodItemService.getUserFoodItems(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}/category/{category}")
    public ResponseEntity<Map<String, Object>> getUserFoodItemsByCategory(
            @PathVariable Long userId,
            @PathVariable String category) {
        try {
            List<FoodItem> items = foodItemService.getUserFoodItemsByCategory(userId, category);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}/search")
    public ResponseEntity<Map<String, Object>> searchUserFoodItems(
            @PathVariable Long userId,
            @RequestParam String keyword) {
        try {
            List<FoodItem> items = foodItemService.searchUserFoodItems(userId, keyword);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<Map<String, Object>> getUserFoodItemsByStatus(
            @PathVariable Long userId,
            @PathVariable String status) {
        try {
            List<FoodItem> items = foodItemService.getUserFoodItemsByStatus(userId, status);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", items);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/user/{userId}/statistics")
    public ResponseEntity<Map<String, Object>> getFoodStatistics(@PathVariable Long userId) {
        try {
            java.util.Map<String, Integer> stats = foodItemService.getFoodStatistics(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> addFoodItem(@RequestBody FoodItem foodItem) {
        try {
            FoodItem savedItem = foodItemService.addFoodItem(foodItem);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", savedItem);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/quantity")
    public ResponseEntity<Map<String, Object>> updateQuantity(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        Long userId = Long.parseLong(request.get("userId").toString());
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());

        try {
            boolean success = foodItemService.updateQuantity(id, quantity, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            if (!success) {
                response.put("message", "更新失败，食材不存在或无权限");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/min-quantity")
    public ResponseEntity<Map<String, Object>> updateMinQuantity(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        System.out.println("收到更新保底数量请求: id=" + id + ", request=" + request);

        Long userId = Long.parseLong(request.get("userId").toString());
        BigDecimal minQuantity = request.get("minQuantity") != null
                ? new BigDecimal(request.get("minQuantity").toString())
                : null;

        try {
            System.out.println("开始执行更新: id=" + id + ", userId=" + userId + ", minQuantity=" + minQuantity);
            
            boolean success = foodItemService.updateMinQuantity(id, minQuantity, userId);
            
            System.out.println("更新结果: " + success);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            if (!success) {
                response.put("message", "更新失败，食材不存在或无权限");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("更新保底数量时发生错误: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateFoodItem(
            @PathVariable Long id,
            @RequestBody FoodItem foodItem) {

        System.out.println("收到更新食材信息请求: id=" + id + ", foodItem=" + foodItem);

        Long userId = foodItem.getUserId();

        try {
            System.out.println("开始执行更新: id=" + id + ", userId=" + userId);
            
            boolean success = foodItemService.updateFoodItem(id, foodItem, userId);
            
            System.out.println("更新结果: " + success);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            if (!success) {
                response.put("message", "更新失败，食材不存在或无权限");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("更新食材信息时发生错误: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteFoodItem(
            @PathVariable Long id,
            @RequestParam Long userId) {
        try {
            boolean success = foodItemService.deleteFoodItem(id, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            if (!success) {
                response.put("message", "删除失败，食材不存在或无权限");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
