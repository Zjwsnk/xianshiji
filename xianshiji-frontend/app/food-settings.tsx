import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiUrl } from '@/constants/api';

interface FoodItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minQuantity: number | null;
}

export default function FoodSettingsScreen() {
    const [user, setUser] = useState<any>(null);
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                loadFoodItems(parsedUser.id);
            } else {
                router.replace('/login');
            }
        };
        loadData();
    }, [router]);

    const loadFoodItems = async (userId: number) => {
        try {
            const response = await fetch(apiUrl(`/food-items/user/${userId}`));
            const data = await response.json();
            if (data.success) {
                setFoodItems(data.data);
            }
        } catch (error) {
            Alert.alert('错误', '加载食材失败');
        }
    };

    const handleEdit = (item: FoodItem) => {
        setEditingId(item.id);
        setEditValue(item.minQuantity ? item.minQuantity.toString() : '');
    };

    const handleSave = async (item: FoodItem) => {
        const minQuantity = editValue.trim() === '' ? null : parseFloat(editValue);
        if (minQuantity !== null && (isNaN(minQuantity) || minQuantity < 0)) {
            Alert.alert('错误', '保底数量必须是大于等于0的数字');
            return;
        }

        try {
            console.log('请求API:', apiUrl(`/food-items/${item.id}/min-quantity`));
            console.log('请求体:', JSON.stringify({
                userId: user.id,
                minQuantity: minQuantity
            }));
            
            const response = await fetch(apiUrl(`/food-items/${item.id}/min-quantity`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    minQuantity: minQuantity
                }),
            });

            console.log('响应状态:', response.status);
            const data = await response.json();
            console.log('响应数据:', data);

            if (data.success) {
                setFoodItems(prev => prev.map(food =>
                    food.id === item.id
                        ? { ...food, minQuantity: minQuantity }
                        : food
                ));
                setEditingId(null);
                setEditValue('');
                Alert.alert('成功', '保底数量设置成功');
            } else {
                Alert.alert('失败', data.message);
            }
        } catch (error) {
            console.error('错误详情:', error);
            Alert.alert('错误', `网络错误: ${(error as any).message}`);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    const renderItem = ({ item }: { item: FoodItem }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                    {item.category} • 当前数量: {item.quantity} {item.unit}
                </Text>
            </View>
            <View style={styles.minQuantityContainer}>
                <Text style={styles.label}>保底数量:</Text>
                {editingId === item.id ? (
                    <View style={styles.editContainer}>
                        <TextInput
                            style={styles.input}
                            value={editValue}
                            onChangeText={setEditValue}
                            placeholder="输入保底数量"
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.saveButton} onPress={() => handleSave(item)}>
                            <Feather name="check" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                            <Feather name="x" size={16} color="#666" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                        <Text style={styles.minQuantityText}>
                            {item.minQuantity ? `${item.minQuantity} ${item.unit}` : '未设置'}
                        </Text>
                        <Feather name="edit-2" size={16} color="#769678" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#769678', '#E9EDEB']}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
            <View style={styles.content}>
                <Text style={styles.description}>
                    设置食材的保底数量，当食材数量低于保底数量时，会标记为"数量不足"。
                </Text>
                <FlatList
                    data={foodItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9EDEB',
    },
    headerGradient: {
        paddingTop: 40,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
    },
    itemContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 10,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 3,
    },
    itemInfo: {
        marginBottom: 10,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
    },
    minQuantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 14,
        color: '#666',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    minQuantityText: {
        fontSize: 14,
        color: '#769678',
        marginRight: 8,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 8,
        fontSize: 14,
        marginRight: 8,
    },
    saveButton: {
        backgroundColor: '#769678',
        borderRadius: 6,
        padding: 8,
        marginRight: 4,
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
        padding: 8,
    },
});
