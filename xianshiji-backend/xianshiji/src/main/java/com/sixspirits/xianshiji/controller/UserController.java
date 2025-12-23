package com.sixspirits.xianshiji.controller;

import com.sixspirits.xianshiji.entity.User;
import com.sixspirits.xianshiji.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin // 先简单解决跨域
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> list() {
        return userService.getAllUsers();
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String email = request.get("email");
        String password = request.get("password");
        String nickname = request.get("nickname");

        if ((phone == null || phone.trim().isEmpty()) && (email == null || email.trim().isEmpty())
                || password == null || password.trim().isEmpty()
                || nickname == null || nickname.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "参数不完整");
            return ResponseEntity.badRequest().body(error);
        }
        try {
            User user = userService.register(phone, email, password, nickname);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        String account = request.get("account"); // phone or email
        String password = request.get("password");
        if (account == null || account.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "参数不完整");
            return ResponseEntity.badRequest().body(error);
        }
        try {
            User user = userService.login(account, password);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
