import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RecipeIngredient {
  ingredientName: string;
  amount: string;
}

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

  // 配料列表
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { ingredientName: '', amount: '' },
  ]);

  // 处理菜谱表单字段变化
  const handleRecipeChange = (field: string, value: string) => {
    setRecipeForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理配料字段变化
  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: string) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: value
    };
    setIngredients(updatedIngredients);
  };

  // 添加新配料
  const addIngredient = () => {
    setIngredients(prev => [...prev, { ingredientName: '', amount: '' }]);
  };

  // 删除配料
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const updatedIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(updatedIngredients);
    } else {
      Alert.alert('提示', '至少需要保留一个配料');
    }
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

    // 验证配料信息
    for (let i = 0; i < ingredients.length; i++) {
      if (!ingredients[i].ingredientName.trim()) {
        Alert.alert('错误', `第${i + 1}个配料的食材名称不能为空`);
        return false;
      }
      if (!ingredients[i].amount.trim()) {
        Alert.alert('错误', `第${i + 1}个配料的用量不能为空`);
        return false;
      }
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
        ingredients: ingredients.map(ingredient => ({
          ingredientName: ingredient.ingredientName.trim(),
          amount: ingredient.amount.trim(),
        })),
      };

      // API调用
      const response = await fetch('http://localhost:8080/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        throw new Error('添加菜谱失败');
      }

      const result = await response.json();
      console.log('Recipe added successfully:', result);

      Alert.alert('成功', '菜谱已添加', [
        {
          text: '确定',
          onPress: () => router.back()
        }
      ]);
    } catch (error) {
      console.error('Error adding recipe:', error);
      Alert.alert('错误', '添加菜谱失败，请重试');
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
                value={recipeForm.name}
                onChangeText={(text) => handleRecipeChange('name', text)}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>菜系 *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="请输入菜系（如：川菜、粤菜）"
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
                  value={recipeForm.cookTime}
                  onChangeText={(text) => handleRecipeChange('cookTime', text)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <ThemedText style={styles.label}>难度 *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="请输入难度（如：简单、中等、困难）"
                  value={recipeForm.difficulty}
                  onChangeText={(text) => handleRecipeChange('difficulty', text)}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>份量（人）*</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="请输入份量"
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
                value={recipeForm.imageUrl}
                onChangeText={(text) => handleRecipeChange('imageUrl', text)}
              />
            </View>

            {/* 配料部分 */}
            <ThemedText style={styles.sectionTitle}>配料信息</ThemedText>
            
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientGroup}>
                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1.5, marginRight: 10 }]}>
                    <ThemedText style={styles.label}>食材名称 *</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="请输入食材名称"
                      value={ingredient.ingredientName}
                      onChangeText={(text) => handleIngredientChange(index, 'ingredientName', text)}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                    <ThemedText style={styles.label}>用量 *</ThemedText>
                    <TextInput
                      style={styles.input}
                      placeholder="请输入用量（如：100克）"
                      value={ingredient.amount}
                      onChangeText={(text) => handleIngredientChange(index, 'amount', text)}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeIngredient(index)}
                  >
                    <Text style={styles.removeButtonText}>-</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Text style={styles.addButtonText}>+ 添加配料</Text>
            </TouchableOpacity>

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
  ingredientGroup: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#f44336',
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2196F3',
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
});
