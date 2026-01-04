import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '@/constants/api';
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';

export default function ScanScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const cameraRef = useRef<CameraView>(null);
  
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

  // 状态管理
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const [barcode, setBarcode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: '',
    min_quantity: '',
    purchase_date: '',
    expiry_date: '',
    image_url: '',
  });
  const [showForm, setShowForm] = useState(false);

  // 请求摄像头权限
  const [permissionResponse, requestPermission] = useCameraPermissions();
  
  useEffect(() => {
    if (!permissionResponse) {
      // 权限尚未请求
      requestPermission();
    } else if (permissionResponse.status === 'undetermined') {
      // 权限未决定，请求权限
      requestPermission();
    } else {
      // 权限已决定
      setHasPermission(permissionResponse.granted);
    }
  }, [permissionResponse, requestPermission]);

  // 处理扫描结果
  const handleBarCodeScanned = async ({ type, data }: BarcodeScanningResult) => {
    setScanning(false);
    setBarcode(data);
    
    // 调用API查询商品信息
    await fetchProductData(data);
  };

  // 调用Open Food Facts API查询商品信息
  const fetchProductData = async (barcode: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1) {
        // 解析API返回的数据
        const product = data.product;
        const parsedData = {
          name: product.product_name || '',
          category: product.categories || '',
          quantity: '',
          unit: '',
          min_quantity: '',
          purchase_date: '',
          expiry_date: '',
          image_url: product.image_url || '',
        };
        setProductData(parsedData);
        setShowForm(true);
      } else {
        Alert.alert('错误', '未找到该商品信息');
        setScanning(true);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      Alert.alert('错误', '查询商品信息失败');
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  // 表单处理
  const handleChange = (field: string, value: string) => {
    setProductData(prev => ({
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
    if (!productData.name.trim()) {
      Alert.alert('错误', '请输入食材名称');
      return false;
    }
    if (!productData.quantity) {
      Alert.alert('错误', '请输入数量');
      return false;
    }
    if (isNaN(Number(productData.quantity))) {
      Alert.alert('错误', '数量必须是数字');
      return false;
    }
    if (!productData.expiry_date) {
      Alert.alert('错误', '请输入过期日期');
      return false;
    }
    if (productData.purchase_date && !validateDateFormat(productData.purchase_date)) {
      Alert.alert('错误', '购买日期格式不正确，请使用YYYY-MM-DD格式');
      return false;
    }
    if (!validateDateFormat(productData.expiry_date)) {
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
        name: productData.name.trim(),
        category: productData.category.trim() || null,
        quantity: parseFloat(productData.quantity),
        unit: productData.unit.trim() || null,
        minQuantity: productData.min_quantity ? parseFloat(productData.min_quantity) : null,
        purchaseDate: productData.purchase_date || null,
        expiryDate: productData.expiry_date,
        imageUrl: productData.image_url.trim() || null,
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

  // 重新扫描
  const handleRescan = () => {
    setScanning(true);
    setBarcode('');
    setShowForm(false);
    setProductData({
      name: '',
      category: '',
      quantity: '',
      unit: '',
      min_quantity: '',
      purchase_date: '',
      expiry_date: '',
      image_url: '',
    });
  };

  // 权限处理
  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#769678', '#E9EDEB']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContainer}>
            <ThemedText type="title" style={styles.headerTitle}>扫描录入</ThemedText>
          </View>
        </LinearGradient>
        <Text style={styles.text}>请求摄像头权限...</Text>
      </ThemedView>
    );
  }
  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#769678', '#E9EDEB']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContainer}>
            <ThemedText type="title" style={styles.headerTitle}>扫描录入</ThemedText>
          </View>
        </LinearGradient>
        <Text style={styles.text}>无摄像头权限</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>返回</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // 显示加载指示器
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#769678', '#E9EDEB']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContainer}>
            <ThemedText type="title" style={styles.headerTitle}>扫描录入</ThemedText>
          </View>
        </LinearGradient>
        <ActivityIndicator size="large" color="#769678" />
        <ThemedText style={styles.text}>正在查询商品信息...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#769678', '#E9EDEB']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.headerTitle}>扫描录入</ThemedText>
        </View>
      </LinearGradient>
      {!showForm ? (
        // 相机预览界面
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
            }}
            autofocus="on"
          />
          <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlayLeft} />
              <View style={styles.scanArea} />
              <View style={styles.overlayRight} />
            </View>
            <View style={styles.overlayBottom} />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
              <Text style={styles.buttonText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // 表单界面
        <ScrollView style={styles.content}>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>食材名称 *</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="请输入食材名称"
                placeholderTextColor="#666"
                value={productData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>分类</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="请输入分类（如：水果、蔬菜）"
                placeholderTextColor="#666"
                value={productData.category}
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
                  value={productData.quantity}
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
                  value={productData.unit}
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
                value={productData.min_quantity}
                onChangeText={(text) => handleChange('min_quantity', text)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>购买日期</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={productData.purchase_date}
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
                value={productData.expiry_date}
                onChangeText={(text) => {
                  const formatted = formatDateInput(text);
                  handleChange('expiry_date', formatted);
                }}
                keyboardType="numeric"
                maxLength={10}
                placeholderTextColor="#666"
              />
              <Text style={styles.helperText}>请使用YYYY-MM-DD格式</Text>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>图片URL</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="请输入图片URL"
                placeholderTextColor="#666"
                value={productData.image_url}
                onChangeText={(text) => handleChange('image_url', text)}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleRescan}>
                <Text style={styles.buttonText}>重新扫描</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>添加食材</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9EDEB',
  },
  headerGradient: {
    height: 80,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTop: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: 250,
    width: '100%',
  },
  overlayLeft: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanArea: {
    width: 300,
    height: 250,
    borderWidth: 2,
    borderColor: '#769678',
  },
  overlayRight: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayBottom: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#769678',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 10,
  },
  secondaryButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
});
