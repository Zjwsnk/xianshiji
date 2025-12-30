package com.sixspirits.xianshiji.controller;

import com.sixspirits.xianshiji.entity.Recipe;
import com.sixspirits.xianshiji.entity.RecipeIngredient;
import com.sixspirits.xianshiji.service.RecipeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/recipes")
public class RecipeController {

    @Autowired
    private RecipeService recipeService;

    // 新增菜谱请求体
    static class RecipeRequest {
        private Recipe recipe;
        private List<RecipeIngredient> ingredients;

        public Recipe getRecipe() {
            return recipe;
        }

        public void setRecipe(Recipe recipe) {
            this.recipe = recipe;
        }

        public List<RecipeIngredient> getIngredients() {
            return ingredients;
        }

        public void setIngredients(List<RecipeIngredient> ingredients) {
            this.ingredients = ingredients;
        }
    }

    // 查询所有菜谱
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllRecipes() {
        try {
            List<Recipe> recipes = recipeService.getAllRecipes();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", recipes);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 按ID查询菜谱
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRecipeById(@PathVariable Integer id) {
        try {
            Recipe recipe = recipeService.getRecipeById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", recipe);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 查询菜谱的配料
    @GetMapping("/{id}/ingredients")
    public ResponseEntity<Map<String, Object>> getRecipeIngredients(@PathVariable Integer id) {
        try {
            List<RecipeIngredient> ingredients = recipeService.getRecipeIngredients(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", ingredients);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 新增菜谱
    @PostMapping
    public ResponseEntity<Map<String, Object>> addRecipe(@RequestBody RecipeRequest request) {
        try {
            Recipe savedRecipe = recipeService.addRecipe(request.getRecipe(), request.getIngredients());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", savedRecipe);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 更新菜谱
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRecipe(@PathVariable Integer id, @RequestBody RecipeRequest request) {
        try {
            request.getRecipe().setId(id);
            Recipe updatedRecipe = recipeService.updateRecipe(request.getRecipe(), request.getIngredients());
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", updatedRecipe);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 删除菜谱
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRecipe(@PathVariable Integer id) {
        try {
            recipeService.deleteRecipe(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}