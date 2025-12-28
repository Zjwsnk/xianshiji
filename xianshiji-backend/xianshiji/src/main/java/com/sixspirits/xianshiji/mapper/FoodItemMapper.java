package com.sixspirits.xianshiji.mapper;

import com.sixspirits.xianshiji.entity.FoodItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FoodItemMapper {

    List<FoodItem> findByUserId(@Param("userId") Long userId);

    List<FoodItem> findByUserIdAndCategory(@Param("userId") Long userId, @Param("category") String category);

    List<FoodItem> findByUserIdAndKeyword(@Param("userId") Long userId, @Param("keyword") String keyword);

    FoodItem findById(@Param("id") Long id);

    int insert(FoodItem foodItem);

    int updateById(FoodItem foodItem);

    int softDeleteById(@Param("id") Long id);
}
