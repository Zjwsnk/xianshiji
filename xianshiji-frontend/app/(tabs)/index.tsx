import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import meishi1 from '../index-picture/meishi1.jpg';
import meishi2 from '../index-picture/meishi2.jpg';
import meishi3 from '../index-picture/meishi3.jpg';

// Get screen width for carousel images
const { width: screenWidth } = Dimensions.get('window');
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const images = [meishi1, meishi2, meishi3];
  const scrollViewRef = React.useRef<ScrollView>(null);

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
              setCurrentImageIndex(index);
            }}
            ref={scrollViewRef}
            style={styles.horizontalScrollView}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={image}
                style={styles.mainImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  { opacity: index === currentImageIndex ? 1 : 0.5 }
                ]}
              />
            ))}
          </View>
        </View>
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
        
        {/* 添加食材菜谱按钮 */}
        <TouchableOpacity 
          style={styles.scanButton} 
          onPress={() => router.push('/recipe-add' as any)}
        >
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Feather name="plus-circle" size={24} color="#1e2120ff" />
            <ThemedText style={styles.scanButtonText}>添加食材菜谱</ThemedText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
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
  scrollView: {
    flex: 1,
    backgroundColor: '#E9EDEB',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  carouselContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
    marginBottom: 20,
  },
  horizontalScrollView: {
    width: '100%',
    height: '100%',
  },
  mainImage: {
    width: screenWidth - 40, // Default width
    height: 400,
    borderRadius: 10,
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
    marginBottom: 20,
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
  pagination: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
