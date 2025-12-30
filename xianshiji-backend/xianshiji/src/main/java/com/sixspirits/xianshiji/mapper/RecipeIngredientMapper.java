package com.sixspirits.xianshiji.mapper;

import com.sixspirits.xianshiji.entity.RecipeIngredient;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RecipeIngredientMapper {

    List<RecipeIngredient> findByRecipeId(@Param("recipeId") Long recipeId);

    int insert(RecipeIngredient recipeIngredient);

    int deleteByRecipeId(@Param("recipeId") Long recipeId);
}