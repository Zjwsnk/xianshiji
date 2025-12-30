package com.sixspirits.xianshiji.service;

import com.sixspirits.xianshiji.entity.Recipe;
import com.sixspirits.xianshiji.entity.RecipeIngredient;
import com.sixspirits.xianshiji.mapper.RecipeIngredientMapper;
import com.sixspirits.xianshiji.mapper.RecipeMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecipeService {

    private final RecipeMapper recipeMapper;
    private final RecipeIngredientMapper recipeIngredientMapper;

    public RecipeService(RecipeMapper recipeMapper, RecipeIngredientMapper recipeIngredientMapper) {
        this.recipeMapper = recipeMapper;
        this.recipeIngredientMapper = recipeIngredientMapper;
    }

    public List<Recipe> getAllRecipes() {
        return recipeMapper.findAll();
    }

    public List<Recipe> getRecipesByCuisineType(String cuisineType) {
        return recipeMapper.findByCuisineType(cuisineType);
    }

    public List<Recipe> searchRecipes(String keyword) {
        return recipeMapper.findByKeyword(keyword);
    }

    public Recipe getRecipeById(Long id) {
        return recipeMapper.findById(id);
    }

    public List<RecipeIngredient> getRecipeIngredients(Long recipeId) {
        return recipeIngredientMapper.findByRecipeId(recipeId);
    }

    @Transactional
    public Recipe addRecipe(Recipe recipe, List<RecipeIngredient> ingredients) {
        recipe.setCreatedAt(LocalDateTime.now());
        recipeMapper.insert(recipe);

        // 插入配料信息
        if (ingredients != null && !ingredients.isEmpty()) {
            for (RecipeIngredient ingredient : ingredients) {
                ingredient.setRecipeId(recipe.getId());
                recipeIngredientMapper.insert(ingredient);
            }
        }

        return recipe;
    }

    @Transactional
    public Recipe updateRecipe(Recipe recipe, List<RecipeIngredient> ingredients) {
        recipeMapper.updateById(recipe);

        // 删除旧的配料信息
        recipeIngredientMapper.deleteByRecipeId(recipe.getId());

        // 插入新的配料信息
        if (ingredients != null && !ingredients.isEmpty()) {
            for (RecipeIngredient ingredient : ingredients) {
                ingredient.setRecipeId(recipe.getId());
                recipeIngredientMapper.insert(ingredient);
            }
        }

        return recipe;
    }

    @Transactional
    public boolean deleteRecipe(Long id) {
        // 删除配料信息
        recipeIngredientMapper.deleteByRecipeId(id);
        // 删除菜谱
        recipeMapper.deleteById(id);
        return true;
    }
}