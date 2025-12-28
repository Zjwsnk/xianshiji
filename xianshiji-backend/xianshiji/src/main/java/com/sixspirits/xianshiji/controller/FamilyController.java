package com.sixspirits.xianshiji.controller;

import com.sixspirits.xianshiji.entity.Family;
import com.sixspirits.xianshiji.entity.UserFamily;
import com.sixspirits.xianshiji.service.FamilyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin
@RequestMapping("/families")
public class FamilyController {

    private final FamilyService familyService;

    public FamilyController(FamilyService familyService) {
        this.familyService = familyService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createFamily(@RequestBody Map<String, String> request) {
        String familyName = request.get("familyName");
        String creatorId = request.get("creatorId"); // 从token或session获取

        if (familyName == null || familyName.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "家庭组名称不能为空");
            return ResponseEntity.badRequest().body(error);
        }

        if (creatorId == null || creatorId.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "创建者ID不能为空");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            Family family = familyService.createFamily(familyName, Long.parseLong(creatorId));
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("family", family);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/join")
    public ResponseEntity<Map<String, Object>> joinFamily(@RequestBody Map<String, String> request) {
        String inviteCode = request.get("inviteCode");
        String userId = request.get("userId"); // 从token或session获取

        if (inviteCode == null || inviteCode.trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "邀请码不能为空");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            boolean success = familyService.joinFamily(inviteCode, Long.parseLong(userId));
            Map<String, Object> response = new HashMap<>();
            if (success) {
                response.put("success", true);
                response.put("message", "加入家庭组成功");
            } else {
                response.put("success", false);
                response.put("message", "邀请码无效或已过期");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyFamilies(@RequestParam String userId) {
        try {
            List<Family> families = familyService.getUserFamilies(Long.parseLong(userId));
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("families", families);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
