package com.sixspirits.xianshiji.service;

import com.sixspirits.xianshiji.entity.User;
import com.sixspirits.xianshiji.mapper.UserMapper;
import org.springframework.stereotype.Service;

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
}
