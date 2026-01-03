import React, { useLayoutEffect, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 设置页面导航选项
export default function ScanScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // 检查用户是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      const user = await AsyncStorage.getItem('user');
      if (!user) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);

  // 配置导航栏
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: '扫描录入',
    });
  }, [navigation]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText style={styles.placeholderText}>
          扫码录入功能正在开发中...
        </ThemedText>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
  },
});
