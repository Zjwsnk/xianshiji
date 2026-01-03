import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiUrl } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RecipeAddScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  // 配置导航栏
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '菜谱录入',
    });
  }, [navigation]);

  // 添加认证检查逻辑
  useEffect(() => {
    const checkAuth = async () => {
      const user = await AsyncStorage.getItem('user');
      if (!user) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);
  
  // 菜谱基本信息
  const [recipeForm, setRecipeForm] = useState({
    name: '',
    cuisineType: '',
    prepTime: '',
    cookTime: '',
    difficulty: '',
    servings: '',
    description: '',
    steps: '',
    imageUrl: '',
  });

  // 处理菜谱表单字段变化
  const handleRecipeChange = (field: string, value: string) => {
    setRecipeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 表单验证
  const validateForm = () => {
    // 验证菜谱基本信息
    if (!recipeForm.name.trim()) {
      Alert.alert('错误', '请输入菜谱名称');
      return false;
    }
    if (!recipeForm.cuisineType.trim()) {
      Alert.alert('错误', '请输入菜系');
      return false;
    }
    if (!recipeForm.prepTime.trim()) {
      Alert.alert('错误', '请输入准备时间');
      return false;
    }
    if (isNaN(Number(recipeForm.prepTime))) {
      Alert.alert('错误', '准备时间必须是数字');
      return false;
    }
    if (!recipeForm.cookTime.trim()) {
      Alert.alert('错误', '请输入烹饪时间');
      return false;
    }
    if (isNaN(Number(recipeForm.cookTime))) {
      Alert.alert('错误', '烹饪时间必须是数字');
      return false;
    }
    if (!recipeForm.difficulty.trim()) {
      Alert.alert('错误', '请输入难度');
      return false;
    }
    if (!recipeForm.servings.trim()) {
      Alert.alert('错误', '请输入份量');
      return false;
    }
    if (isNaN(Number(recipeForm.servings))) {
      Alert.alert('错误', '份量必须是数字');
      return false;
    }
    if (!recipeForm.description.trim()) {
      Alert.alert('错误', '请输入菜谱描述');
      return false;
    }
    if (!recipeForm.steps.trim()) {
      Alert.alert('错误', '请输入烹饪步骤');
      return false;
    }

    return true;
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // 准备发送到后端的数据
      const recipeData = {
        recipe: {
          name: recipeForm.name.trim(),
          cuisineType: recipeForm.cuisineType.trim(),
          prepTime: parseInt(recipeForm.prepTime),
          cookTime: parseInt(recipeForm.cookTime),
          difficulty: recipeForm.difficulty.trim(),
          servings: parseInt(recipeForm.servings),
          description: recipeForm.description.trim(),
          steps: recipeForm.steps.trim(),
          imageUrl: recipeForm.imageUrl.trim(),
        },
        ingredients: [], // 保持与后端API兼容性，发送空的配料列表
      };

      // API调用
      const response = await fetch(apiUrl('/recipes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`添加菜谱失败，状态码: ${response.status}, 响应: ${responseText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Recipe added successfully:', result);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        result = { success: true };
      }

      Alert.alert('成功', '菜谱已添加', [
        {
          text: '确定',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error adding recipe:', error);
      let errorMessage = '添加菜谱失败，请重试';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('错误', errorMessage);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.content}>
          <View style={styles.form}>
            {/* 菜谱基本信息部分 */}
            <ThemedText style={styles.sectionTitle}>菜谱基本信息</ThemedText>
            
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>菜谱名称 *</ThemedText>
              <TextInput
              style={styles.input}
              placeholder="请输入菜谱名称"
              placeholderTextColor="#666"
              value={recipeForm.name}
              onChangeText={(text) => handleRecipeChange('name', text)}
            />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>菜系 *</ThemedText>
              <TextInput
              style={styles.input}
              placeholder="请输入菜系（如：川菜、粤菜）"
              placeholderTextColor="#666"
              value={recipeForm.cuisineType}
              onChangeText={(text) => handleRecipeChange('cuisineType', text)}
            />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <ThemedText style={styles.label}>准备时间（分钟）*</ThemedText>
                <TextInput
                style={styles.input}
                placeholder="请输入准备时间"
                placeholderTextColor="#666"
                value={recipeForm.prepTime}
                onChangeText={(text) => handleRecipeChange('prepTime', text)}
                keyboardType="numeric"
              />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>烹饪时间（分钟）*</ThemedText>
                <TextInput
                style={styles.input}
                placeholder="请输入烹饪时间"
                placeholderTextColor="#666"
                value={recipeForm.cookTime}
                onChangeText={(text) => handleRecipeChange('cookTime', text)}
                keyboardType="numeric"
              />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <ThemedText style={styles.label}>难度 *</ThemedText>
                <View style={styles.dropdownContainer}>
                  <View style={styles.dropdown}>
                    <TouchableOpacity 
                      style={[styles.dropdownItem, recipeForm.difficulty === 'BEGINNER' && styles.selectedDropdownItem]}
                      onPress={() => handleRecipeChange('difficulty', 'BEGINNER')}
                    >
                      <Text style={[styles.dropdownItemText, recipeForm.difficulty === 'BEGINNER' && styles.selectedDropdownItemText]}>简单</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.dropdownItem, recipeForm.difficulty === 'INTERMEDIATE' && styles.selectedDropdownItem]}
                      onPress={() => handleRecipeChange('difficulty', 'INTERMEDIATE')}
                    >
                      <Text style={[styles.dropdownItemText, recipeForm.difficulty === 'INTERMEDIATE' && styles.selectedDropdownItemText]}>中等</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.dropdownItem, recipeForm.difficulty === 'ADVANCED' && styles.selectedDropdownItem]}
                      onPress={() => handleRecipeChange('difficulty', 'ADVANCED')}
                    >
                      <Text style={[styles.dropdownItemText, recipeForm.difficulty === 'ADVANCED' && styles.selectedDropdownItemText]}>困难</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>份量（人）*</ThemedText>
                <TextInput
                style={styles.input}
                placeholder="请输入份量"
                placeholderTextColor="#666"
                value={recipeForm.servings}
                onChangeText={(text) => handleRecipeChange('servings', text)}
                keyboardType="numeric"
              />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>菜谱描述 *</ThemedText>
              <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="请输入菜谱描述"
              placeholderTextColor="#666"
              value={recipeForm.description}
              onChangeText={(text) => handleRecipeChange('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>烹饪步骤 *</ThemedText>
              <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="请输入烹饪步骤，每行一个步骤"
              placeholderTextColor="#666"
              value={recipeForm.steps}
              onChangeText={(text) => handleRecipeChange('steps', text)}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>图片URL</ThemedText>
              <TextInput
              style={styles.input}
              placeholder="请输入图片URL"
              placeholderTextColor="#666"
              value={recipeForm.imageUrl}
              onChangeText={(text) => handleRecipeChange('imageUrl', text)}
            />
            </View>

            {/* 提交按钮 */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>添加菜谱</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9EDEB',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    borderRadius: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    marginTop: 10,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 120,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#6C9776',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropdownItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDropdownItem: {
    backgroundColor: '#6C9776',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDropdownItemText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
