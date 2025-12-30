package com.sixspirits.xianshiji.mapper;

import com.sixspirits.xianshiji.entity.Recipe;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RecipeMapper {

    List<Recipe> findAll();

    List<Recipe> findByCuisineType(@Param("cuisineType") String cuisineType);

    List<Recipe> findByKeyword(@Param("keyword") String keyword);

    Recipe findById(@Param("id") Long id);

    int insert(Recipe recipe);

    int updateById(Recipe recipe);

    int deleteById(@Param("id") Long id);
}