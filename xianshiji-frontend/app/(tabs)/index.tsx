import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const sampleFoods = [
  { id: '1', name: '苹果', category: '水果', quantity: 5, expiryDays: 7, status: '临期' },
  { id: '2', name: '牛奶', category: '乳制品', quantity: 2, expiryDays: 3, status: '即将过期' },
  { id: '3', name: '鸡蛋', category: '蛋类', quantity: 12, expiryDays: 14, status: '新鲜' },
];

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  const [foods, setFoods] = useState(sampleFoods);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case '新鲜': return '#4CAF50';
      case '临期': return '#FFC107';
      case '即将过期': return '#FF9800';
      case '已过期': return '#F44336';
      default: return '#666';
    }
  };

  const renderFoodItem = ({ item }: any) => (
    <View style={styles.foodCard}>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodCategory}>{item.category}</Text>
        <Text style={styles.foodQuantity}>数量: {item.quantity}</Text>
        <Text style={styles.foodExpiry}>保质期: {item.expiryDays}天</Text>
      </View>
      <View style={styles.foodActions}>
        <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
        <TouchableOpacity style={styles.consumeButton}>
          <Text style={styles.buttonText}>消耗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredFoods = foods.filter(food =>
    food.name.toLowerCase().includes(searchText.toLowerCase()) ||
    food.category.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#E8F5E9']}
        style={styles.headerGradient}
      >
        <ThemedText type="title" style={styles.headerTitle}>首页</ThemedText>
      </LinearGradient>
      <View style={styles.content}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索食材或分类..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <View style={styles.categoryButtons}>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.categoryText}>全部</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.categoryText}>水果</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.categoryText}>蔬菜</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryButton}>
            <Text style={styles.categoryText}>肉类</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={filteredFoods}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#4CAF50',
    textAlign: 'center',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  categoryButtons: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: '#E8F5E8',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  foodCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  foodCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  foodQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  foodExpiry: {
    fontSize: 14,
    color: '#666',
  },
  foodActions: {
    alignItems: 'center',
  },
  statusBadge: {
    color: '#fff',
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
    marginBottom: 8,
  },
  consumeButton: {
    backgroundColor: '#4CAF50',
    padding: 6,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
  },
});
