package com.sixspirits.xianshiji.mapper;

import com.sixspirits.xianshiji.entity.Family;
import com.sixspirits.xianshiji.entity.UserFamily;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface FamilyMapper {
    // 家庭组相关
    Family findByInviteCode(String inviteCode);

    int insertFamily(Family family);

    List<Family> findUserFamilies(Long userId);

    // 用户-家庭组关联相关
    int insertUserFamily(UserFamily userFamily);

    UserFamily findUserFamily(Long userId, Long familyId);
}
