package com.sixspirits.xianshiji.service;

import com.sixspirits.xianshiji.entity.Family;
import com.sixspirits.xianshiji.entity.UserFamily;
import com.sixspirits.xianshiji.mapper.FamilyMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class FamilyService {

    private final FamilyMapper familyMapper;

    public FamilyService(FamilyMapper familyMapper) {
        this.familyMapper = familyMapper;
    }

    public Family createFamily(String familyName, Long creatorId) {
        Family family = new Family();
        family.setName(familyName);
        family.setInviteCode(generateInviteCode());
        family.setCreatedBy(creatorId);
        family.setCreatedAt(LocalDateTime.now());

        familyMapper.insertFamily(family);

        // 创建创建者与家庭组的关联
        UserFamily userFamily = new UserFamily();
        userFamily.setUserId(creatorId);
        userFamily.setFamilyId(family.getId());
        userFamily.setRole("OWNER");
        userFamily.setJoinedAt(LocalDateTime.now());

        familyMapper.insertUserFamily(userFamily);

        return family;
    }

    public boolean joinFamily(String inviteCode, Long userId) {
        Family family = familyMapper.findByInviteCode(inviteCode);
        if (family == null) {
            return false;
        }

        // 检查用户是否已在家庭组中
        UserFamily existing = familyMapper.findUserFamily(userId, family.getId());
        if (existing != null) {
            return false; // 已加入
        }

        // 创建用户与家庭组的关联
        UserFamily userFamily = new UserFamily();
        userFamily.setUserId(userId);
        userFamily.setFamilyId(family.getId());
        userFamily.setRole("MEMBER");
        userFamily.setJoinedAt(LocalDateTime.now());

        familyMapper.insertUserFamily(userFamily);
        return true;
    }

    public List<Family> getUserFamilies(Long userId) {
        return familyMapper.findUserFamilies(userId);
    }

    private String generateInviteCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
