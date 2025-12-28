package com.sixspirits.xianshiji.controller;

import com.sixspirits.xianshiji.entity.User;
import com.sixspirits.xianshiji.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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

    @PutMapping("/update")
    public ResponseEntity<Map<String, Object>> updateUser(@RequestBody Map<String, Object> request) {
        Long userId = Long.parseLong(request.get("id").toString());
        String nickname = (String) request.get("nickname");
        String phone = (String) request.get("phone");
        String email = (String) request.get("email");
        String oldPassword = (String) request.get("oldPassword");
        String newPassword = (String) request.get("newPassword");

        if (nickname == null || nickname.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "昵称不能为空");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            User updatedUser = userService.updateUser(userId, nickname, phone, email, oldPassword, newPassword);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", updatedUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/upload-avatar")
    public ResponseEntity<Map<String, Object>> uploadAvatar(@RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId) {
        if (file.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "文件为空");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            // 创建上传目录
            String uploadDir = "uploads/avatars/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 生成文件名
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            // 保存文件
            Files.copy(file.getInputStream(), filePath);

            // 生成URL
            String avatarUrl = "/uploads/avatars/" + filename;

            // 更新用户头像
            userService.updateAvatar(userId, avatarUrl);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("avatarUrl", avatarUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "文件上传失败: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
