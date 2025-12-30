package com.sixspirits.xianshiji.controller;

import com.sixspirits.xianshiji.entity.Recipe;
import com.sixspirits.xianshiji.entity.RecipeIngredient;
import com.sixspirits.xianshiji.service.RecipeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

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

    @GetMapping("/cuisine/{cuisineType}")
    public ResponseEntity<Map<String, Object>> getRecipesByCuisineType(@PathVariable String cuisineType) {
        try {
            List<Recipe> recipes = recipeService.getRecipesByCuisineType(cuisineType);
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

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchRecipes(@RequestParam String keyword) {
        try {
            List<Recipe> recipes = recipeService.searchRecipes(keyword);
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

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRecipeById(@PathVariable Long id) {
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

    @GetMapping("/{id}/ingredients")
    public ResponseEntity<Map<String, Object>> getRecipeIngredients(@PathVariable Long id) {
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

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRecipe(@PathVariable Long id, @RequestBody RecipeRequest request) {
        try {
            Recipe recipe = request.getRecipe();
            recipe.setId(id);
            Recipe updatedRecipe = recipeService.updateRecipe(recipe, request.getIngredients());
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRecipe(@PathVariable Long id) {
        try {
            boolean success = recipeService.deleteRecipe(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", success);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // 内部类用于接收菜谱和配料信息
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
}