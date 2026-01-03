import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    barcode: '',
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
        user_id: userId,
        name: formData.name.trim(),
        category: formData.category.trim(),
        barcode: formData.barcode.trim(),
        quantity: parseFloat(formData.quantity),
        unit: formData.unit.trim(),
        min_quantity: formData.min_quantity ? parseFloat(formData.min_quantity) : null,
        purchase_date: formData.purchase_date ? new Date(formData.purchase_date).toISOString().split('T')[0] : null,
        expiry_date: new Date(formData.expiry_date).toISOString().split('T')[0],
        image_url: formData.image_url.trim(),
      };

      // TODO: Replace with actual API call
      console.log('Sending data to backend:', foodData);

      Alert.alert('成功', '食材已添加', [
        {
          text: '确定',
          onPress: () => router.back()
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
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>分类</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="请输入分类（如：水果、蔬菜）"
              value={formData.category}
              onChangeText={(text) => handleChange('category', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>条形码</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="请输入条形码"
              value={formData.barcode}
              onChangeText={(text) => handleChange('barcode', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 2 }]}>
              <ThemedText style={styles.label}>数量 *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="请输入数量"
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
              onChangeText={(text) => handleChange('purchase_date', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>过期日期 *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.expiry_date}
              onChangeText={(text) => handleChange('expiry_date', text)}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>图片URL</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="请输入图片URL"
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
    backgroundColor: '#4CAF50',
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
});
