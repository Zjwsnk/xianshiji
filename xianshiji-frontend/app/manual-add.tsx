import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '@/constants/api';

export default function ManualAddScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  
  // 配置导航栏
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '手动录入',
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
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    min_quantity: '',
    purchase_date: '',
    expiry_date: '',
    image_url: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 日期格式验证函数
  const validateDateFormat = (dateString: string): boolean => {
    if (!dateString) return true; // 空字符串允许
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  // 格式化日期输入，自动添加分隔符
  const formatDateInput = (text: string): string => {
    // 移除所有非数字字符
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // 根据长度添加分隔符
    if (cleaned.length <= 4) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    } else {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('错误', '请输入食材名称');
      return false;
    }
    if (!formData.quantity) {
      Alert.alert('错误', '请输入数量');
      return false;
    }
    if (isNaN(Number(formData.quantity))) {
      Alert.alert('错误', '数量必须是数字');
      return false;
    }
    if (!formData.expiry_date) {
      Alert.alert('错误', '请输入过期日期');
      return false;
    }
    if (formData.purchase_date && !validateDateFormat(formData.purchase_date)) {
      Alert.alert('错误', '购买日期格式不正确，请使用YYYY-MM-DD格式');
      return false;
    }
    if (!validateDateFormat(formData.expiry_date)) {
      Alert.alert('错误', '过期日期格式不正确，请使用YYYY-MM-DD格式');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Get user ID from AsyncStorage (assuming it's stored there)
      const user = await AsyncStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : null;

      if (!userId) {
        Alert.alert('错误', '用户未登录');
        router.push('/login');
        return;
      }

      // Prepare the data to send to the API
      const foodData = {
        userId: userId,
        name: formData.name.trim(),
        category: formData.category.trim() || null,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit.trim() || null,
        minQuantity: formData.min_quantity ? parseFloat(formData.min_quantity) : null,
        purchaseDate: formData.purchase_date || null,
        expiryDate: formData.expiry_date,
        imageUrl: formData.image_url.trim() || null,
      };

      // Make API call to add food item
      const response = await fetch(apiUrl('/food-items'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(foodData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        Alert.alert('错误', '添加食材失败');
        return;
      }

      try {
        const result = await response.json();
        console.log('Food item added successfully:', result);
      } catch (jsonError) {
        console.error('Error parsing response JSON:', jsonError);
      }

      // 使用简单的Alert调用确保显示
      Alert.alert('成功', '食材已成功添加到数据库', [
        { 
          text: '确定',
          onPress: () => {
            console.log('Alert button pressed, navigating back');
            router.back();
          }
        }
      ]);
    } catch (error) {
      console.error('Error adding food item:', error);
      Alert.alert('错误', '添加食材失败，请重试');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>食材名称 *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="请输入食材名称"
              placeholderTextColor="#666"
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>分类</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="请输入分类（如：水果、蔬菜）"
              placeholderTextColor="#666"
              value={formData.category}
              onChangeText={(text) => handleChange('category', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 2 }]}>
              <ThemedText style={styles.label}>数量 *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="请输入数量"
                placeholderTextColor="#666"
                value={formData.quantity}
                onChangeText={(text) => handleChange('quantity', text)}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
              <ThemedText style={styles.label}>单位</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="如：个、斤"
                placeholderTextColor="#666"
                value={formData.unit}
                onChangeText={(text) => handleChange('unit', text)}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>保底数量</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="请输入保底数量"
              placeholderTextColor="#666"
              value={formData.min_quantity}
              onChangeText={(text) => handleChange('min_quantity', text)}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>购买日期</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.purchase_date}
              onChangeText={(text) => {
                const formatted = formatDateInput(text);
                handleChange('purchase_date', formatted);
              }}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#666"
            />
            <Text style={styles.helperText}>请使用YYYY-MM-DD格式</Text>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>过期日期 *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.expiry_date}
              onChangeText={(text) => {
                const formatted = formatDateInput(text);
                handleChange('expiry_date', formatted);
              }}
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor="#999"
            />
            <Text style={styles.helperText}>请使用YYYY-MM-DD格式</Text>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>图片URL</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="请输入图片URL"
              placeholderTextColor="#666"
              value={formData.image_url}
              onChangeText={(text) => handleChange('image_url', text)}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>添加食材</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9EDEB',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    borderRadius: 8,
    padding: 20,
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: '#6C9776',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
});
