package com.sixspirits.xianshiji.service;

import com.sixspirits.xianshiji.entity.FoodItem;
import com.sixspirits.xianshiji.mapper.FoodItemMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class FoodItemService {

    private final FoodItemMapper foodItemMapper;

    public FoodItemService(FoodItemMapper foodItemMapper) {
        this.foodItemMapper = foodItemMapper;
    }

    public List<FoodItem> getUserFoodItems(Long userId) {
        List<FoodItem> items = foodItemMapper.findByUserId(userId);
        // 更新状态
        for (FoodItem item : items) {
            updateStatus(item);
        }
        return items;
    }

    public List<FoodItem> getUserFoodItemsByStatus(Long userId, String status) {
        List<FoodItem> items;
        switch (status) {
            case "NEAR_EXPIRY":
                items = foodItemMapper.findByUserId(userId).stream()
                        .filter(item -> "NEAR_EXPIRY".equals(item.getStatus()))
                        .collect(java.util.stream.Collectors.toList());
                break;
            case "INSUFFICIENT":
                items = foodItemMapper.findByUserId(userId).stream()
                        .filter(item -> "INSUFFICIENT".equals(item.getStatus()))
                        .collect(java.util.stream.Collectors.toList());
                break;
            case "EXPIRED":
                items = foodItemMapper.findByUserId(userId).stream()
                        .filter(item -> "EXPIRED".equals(item.getStatus()))
                        .collect(java.util.stream.Collectors.toList());
                break;
            default:
                items = foodItemMapper.findByUserId(userId);
                break;
        }

        // 更新状态
        for (FoodItem item : items) {
            updateStatus(item);
        }
        return items;
    }

    public java.util.Map<String, Integer> getFoodStatistics(Long userId) {
        List<FoodItem> allItems = getUserFoodItems(userId);
        java.util.Map<String, Integer> stats = new java.util.HashMap<>();

        int totalCategories = (int) allItems.stream()
                .map(FoodItem::getCategory)
                .distinct()
                .count();

        int nearExpiry = (int) allItems.stream()
                .filter(item -> "NEAR_EXPIRY".equals(item.getStatus()))
                .count();

        int insufficient = (int) allItems.stream()
                .filter(item -> "INSUFFICIENT".equals(item.getStatus()))
                .count();

        int expired = (int) allItems.stream()
                .filter(item -> "EXPIRED".equals(item.getStatus()))
                .count();

        int totalItems = allItems.size();

        stats.put("totalCategories", totalCategories);
        stats.put("nearExpiry", nearExpiry);
        stats.put("insufficient", insufficient);
        stats.put("expired", expired);
        stats.put("totalItems", totalItems);

        return stats;
    }

    public List<FoodItem> getUserFoodItemsByCategory(Long userId, String category) {
        List<FoodItem> items = foodItemMapper.findByUserIdAndCategory(userId, category);
        for (FoodItem item : items) {
            updateStatus(item);
        }
        return items;
    }

    public List<FoodItem> searchUserFoodItems(Long userId, String keyword) {
        List<FoodItem> items = foodItemMapper.findByUserIdAndKeyword(userId, keyword);
        for (FoodItem item : items) {
            updateStatus(item);
        }
        return items;
    }

    public FoodItem getFoodItemById(Long id) {
        FoodItem item = foodItemMapper.findById(id);
        if (item != null) {
            updateStatus(item);
        }
        return item;
    }

    public FoodItem addFoodItem(FoodItem foodItem) {
        foodItem.setStatus(calculateStatus(foodItem));
        foodItem.setIsDeleted(0);
        foodItem.setCreatedAt(LocalDateTime.now());
        foodItem.setUpdatedAt(LocalDateTime.now());

        foodItemMapper.insert(foodItem);
        return foodItem;
    }

    public boolean updateQuantity(Long id, BigDecimal newQuantity, Long userId) {
        FoodItem item = foodItemMapper.findById(id);
        if (item == null || !item.getUserId().equals(userId)) {
            return false;
        }

        item.setQuantity(newQuantity);
        item.setUpdatedAt(LocalDateTime.now());
        item.setStatus(calculateStatus(item)); // 更新状态

        // 如果数量为0，软删除
        if (newQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            foodItemMapper.softDeleteById(id);
        } else {
            foodItemMapper.updateById(item);
        }

        return true;
    }

    public boolean updateMinQuantity(Long id, BigDecimal minQuantity, Long userId) {
        System.out.println("Service层：查找食材，id=" + id);
        
        FoodItem item = foodItemMapper.findById(id);
        
        if (item == null) {
            System.out.println("Service层：未找到食材，id=" + id);
            return false;
        }
        
        System.out.println("Service层：找到食材，id=" + id + ", userId=" + item.getUserId());
        
        if (!item.getUserId().equals(userId)) {
            System.out.println("Service层：权限验证失败，食材userId=" + item.getUserId() + ", 请求userId=" + userId);
            return false;
        }

        item.setMinQuantity(minQuantity);
        item.setUpdatedAt(LocalDateTime.now());
        item.setStatus(calculateStatus(item)); // 更新状态

        System.out.println("Service层：更新前的食材信息：" + item);
        
        int rowsUpdated = foodItemMapper.updateById(item);
        System.out.println("Service层：影响的行数：" + rowsUpdated);
        
        return rowsUpdated > 0;
    }

    public boolean updateFoodItem(Long id, FoodItem foodItem, Long userId) {
        System.out.println("Service层：查找食材，id=" + id);
        
        FoodItem item = foodItemMapper.findById(id);
        
        if (item == null) {
            System.out.println("Service层：未找到食材，id=" + id);
            return false;
        }
        
        System.out.println("Service层：找到食材，id=" + id + ", userId=" + item.getUserId());
        
        if (!item.getUserId().equals(userId)) {
            System.out.println("Service层：权限验证失败，食材userId=" + item.getUserId() + ", 请求userId=" + userId);
            return false;
        }

        // 更新食材信息
        item.setName(foodItem.getName());
        item.setCategory(foodItem.getCategory());
        item.setQuantity(foodItem.getQuantity());
        item.setUnit(foodItem.getUnit());
        item.setMinQuantity(foodItem.getMinQuantity());
        item.setPurchaseDate(foodItem.getPurchaseDate());
        item.setExpiryDate(foodItem.getExpiryDate());
        item.setImageUrl(foodItem.getImageUrl());
        item.setUpdatedAt(LocalDateTime.now());
        item.setStatus(calculateStatus(item)); // 更新状态

        System.out.println("Service层：更新前的食材信息：" + item);
        
        int rowsUpdated = foodItemMapper.updateById(item);
        System.out.println("Service层：影响的行数：" + rowsUpdated);
        
        return rowsUpdated > 0;
    }

    public boolean deleteFoodItem(Long id, Long userId) {
        FoodItem item = foodItemMapper.findById(id);
        if (item == null || !item.getUserId().equals(userId)) {
            return false;
        }

        foodItemMapper.softDeleteById(id);
        return true;
    }

    private void updateStatus(FoodItem item) {
        item.setStatus(calculateStatus(item));
        foodItemMapper.updateById(item);
    }

    private String calculateStatus(FoodItem item) {
        LocalDate expiryDate = item.getExpiryDate();
        BigDecimal quantity = item.getQuantity();

        // 计算有效数量：如果是已过期，则有效数量为0；否则为当前数量
        BigDecimal validQuantity;
        if (expiryDate != null) {
            LocalDate today = LocalDate.now();
            long daysUntilExpiry = ChronoUnit.DAYS.between(today, expiryDate);

            if (daysUntilExpiry < 0) {
                validQuantity = BigDecimal.ZERO; // 已过期，无效数量
            } else {
                validQuantity = quantity; // 未过期，有效数量等于当前数量
            }
        } else {
            validQuantity = quantity; // 无过期日期，默认为有效
        }

        // 首先判断数量不足状态（优先级最高）
        if (item.getMinQuantity() != null &&
                quantity.compareTo(item.getMinQuantity()) <= 0 &&
                quantity.compareTo(BigDecimal.ZERO) > 0) {
            return "INSUFFICIENT";
        }

        // 然后判断过期状态
        if (expiryDate != null) {
            LocalDate today = LocalDate.now();
            long daysUntilExpiry = ChronoUnit.DAYS.between(today, expiryDate);

            if (daysUntilExpiry < 0) {
                return "EXPIRED";
            } else if (daysUntilExpiry <= 3) {
                return "NEAR_EXPIRY";
            }
        }

        return "NORMAL";
    }

    private boolean isLowStock(FoodItem item) {
        if (item.getQuantity() == null) {
            return false;
        }

        // 根据不同类别设置不同的最低库存阈值
        String category = item.getCategory();
        BigDecimal quantity = item.getQuantity();

        switch (category) {
            case "水果":
                return quantity.compareTo(BigDecimal.valueOf(3)) <= 0;
            case "蔬菜":
                return quantity.compareTo(BigDecimal.valueOf(2)) <= 0;
            case "肉类":
                return quantity.compareTo(BigDecimal.valueOf(1)) <= 0;
            case "乳制品":
                return quantity.compareTo(BigDecimal.valueOf(2)) <= 0;
            case "谷物":
                return quantity.compareTo(BigDecimal.valueOf(5)) <= 0;
            case "调料":
                return quantity.compareTo(BigDecimal.valueOf(1)) <= 0;
            case "饮料":
                return quantity.compareTo(BigDecimal.valueOf(3)) <= 0;
            case "蛋类":
                return quantity.compareTo(BigDecimal.valueOf(6)) <= 0;
            default:
                return quantity.compareTo(BigDecimal.valueOf(2)) <= 0;
        }
    }
}
