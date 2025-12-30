import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await AsyncStorage.getItem('user');
      if (!user) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#769678', '#E9EDEB']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.headerTitle}>首页</ThemedText>
        </View>
      </LinearGradient>
      <View style={styles.content}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1574291693613-62a8a4499780?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
          style={styles.mainImage} 
          resizeMode="cover"
        />
        {/* 食材扫码录入按钮 */}
        <TouchableOpacity 
          style={styles.scanButton} 
          onPress={() => router.push('/scan' as any)}
        >
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Feather name="maximize" size={24} color="#1e2120ff" />
            <ThemedText style={styles.scanButtonText}>食材扫码录入</ThemedText>
          </View>
        </TouchableOpacity>
        {/* 手动录入和食材菜谱按钮 */}
        <View style={styles.twoButtonsContainer}>
          <TouchableOpacity 
            style={styles.squareButton} 
            onPress={() => router.push('/manual-add' as any)}
          >
          <View style={styles.buttonContentColumn}>
            <Feather name="edit-3" size={32} color="#fff" />
            <ThemedText style={styles.squareButtonText}>手动录入</ThemedText>
          </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.squareButton} 
            onPress={() => router.push('/recipes' as any)}
            >
            <View style={styles.buttonContentColumn}>
              <Feather name="book-open" size={32} color="#fff" />
              <ThemedText style={styles.squareButtonText}>食材菜谱</ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    height: 120,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 30,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    backgroundColor: '#E9EDEB',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mainImage: {
    width: '100%',
    height: '60%',
    borderRadius: 10,
    marginBottom: 20,
  },
  scanButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#9fc7b3ff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContentColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#1e2120ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  twoButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  squareButton: {
    width: '48%',
    height: 120,
    backgroundColor: '#6C9776',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
