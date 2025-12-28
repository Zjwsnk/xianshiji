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

    public User updateUser(Long userId, String nickname, String phone, String email, String oldPassword,
            String newPassword) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 如果要修改密码，需要验证旧密码
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            if (oldPassword == null || !oldPassword.equals(user.getPassword())) {
                throw new RuntimeException("当前密码错误");
            }
            user.setPassword(newPassword);
        }

        user.setNickname(nickname);
        user.setPhone(phone);
        user.setEmail(email);
        user.setUpdatedAt(LocalDateTime.now());

        userMapper.updateById(user);
        return user;
    }

    public void updateAvatar(Long userId, String avatarUrl) {
        User user = userMapper.findById(userId);
        if (user != null) {
            user.setAvatarUrl(avatarUrl);
            user.setUpdatedAt(LocalDateTime.now());
            userMapper.updateById(user);
        }
    }

    public User findById(Long userId) {
        return userMapper.findById(userId);
    }
}
