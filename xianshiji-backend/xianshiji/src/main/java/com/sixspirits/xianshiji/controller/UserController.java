package com.sixspirits.xianshiji.controller;

import com.sixspirits.xianshiji.entity.User;
import com.sixspirits.xianshiji.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
