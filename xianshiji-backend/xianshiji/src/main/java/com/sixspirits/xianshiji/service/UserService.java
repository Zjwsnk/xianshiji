package com.sixspirits.xianshiji.service;

import com.sixspirits.xianshiji.entity.User;
import com.sixspirits.xianshiji.mapper.UserMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public List<User> getAllUsers() {
        return userMapper.findAll();
    }

    public User register(String phone, String email, String password, String nickname) {
        // 检查是否已存在
        User existing = userMapper.findByPhoneOrEmail(phone != null ? phone : email);
        if (existing != null) {
            throw new RuntimeException("用户已存在");
        }

        User user = new User();
        user.setPhone(phone);
        user.setEmail(email);
        user.setPassword(password); // 实际应加密
        user.setNickname(nickname);
        user.setStatus(1);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(user);
        return user;
    }

    public User login(String account, String password) {
        User user = userMapper.findByPhoneOrEmail(account);
        if (user == null || !password.equals(user.getPassword())) { // 实际应验证加密密码
            throw new RuntimeException("账号或密码错误");
        }
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.updateById(user);
        return user;
    }
}
