package com.sixspirits.xianshiji.mapper;

import com.sixspirits.xianshiji.entity.User;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserMapper {
    List<User> findAll();

    User findByPhoneOrEmail(String account);

    int insert(User user);

    int updateById(User user);
}
