import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiUrl } from '@/constants/api';
import { Feather } from '@expo/vector-icons';

interface FoodItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiryDate: string;
    status: 'NORMAL' | 'NEAR_EXPIRY' | 'INSUFFICIENT' | 'EXPIRED';
    imageUrl?: string;
}

export default function MessagesScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [warningItems, setWarningItems] = useState<FoodItem[]>([]);
    const [expiredItems, setExpiredItems] = useState<FoodItem[]>([]);
    const [insufficientItems, setInsufficientItems] = useState<FoodItem[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                loadWarningMessages(parsedUser.id);
            } else {
                router.replace('/login');
            }
        };
        checkAuth();
    }, [router]);

    const loadWarningMessages = async (userId: number) => {
        try {
            const url = apiUrl(`/food-items/user/${userId}`);
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                const allItems = data.data;
                const warning = allItems.filter((item: FoodItem) => item.status === 'NEAR_EXPIRY');
                const expired = allItems.filter((item: FoodItem) => item.status === 'EXPIRED');
                const insufficient = allItems.filter((item: FoodItem) => item.status === 'INSUFFICIENT');
                setWarningItems(warning);
                setExpiredItems(expired);
                setInsufficientItems(insufficient);
            }
        } catch (error) {
            console.error('加载警告消息失败:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEAR_EXPIRY': return '#FF9800';
            case 'EXPIRED': return '#F44336';
            default: return '#666';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'NEAR_EXPIRY': return '临期';
            case 'EXPIRED': return '已过期';
            default: return '未知';
        }
    };

    const renderWarningItem = ({ item, index }: { item: FoodItem; index: number }) => (
        <View key={index} style={styles.messageCard}>
            <View style={styles.foodImage}>
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl.trim() }}
                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        resizeMode="cover"
                        onError={(error) => console.error('图片加载失败:', error, item.imageUrl)}
                    />
                ) : (
                    <Feather name="image" size={35} color="#ddd" />
                )}
            </View>
            <View style={styles.messageContent}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodCategory}>{item.category}</Text>
                <View style={styles.expiryContainer}>
                    <Text style={styles.expiryText}>过期时间: {item.expiryDate}</Text>
                </View>
                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityText}>数量: {item.quantity} {item.unit || '个'}</Text>
                    <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderExpiredItem = ({ item, index }: { item: FoodItem; index: number }) => (
        <View key={index} style={styles.messageCard}>
            <View style={styles.foodImage}>
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl.trim() }}
                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        resizeMode="cover"
                        onError={(error) => console.error('图片加载失败:', error, item.imageUrl)}
                    />
                ) : (
                    <Feather name="image" size={35} color="#ddd" />
                )}
            </View>
            <View style={styles.messageContent}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodCategory}>{item.category}</Text>
                <View style={styles.expiryContainer}>
                    <Text style={styles.expiryText}>过期时间: {item.expiryDate}</Text>
                </View>
                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityText}>数量: {item.quantity} {item.unit || '个'}</Text>
                    <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderInsufficientItem = ({ item, index }: { item: FoodItem; index: number }) => (
        <View key={index} style={styles.messageCard}>
            <View style={styles.foodImage}>
                {item.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl.trim() }}
                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                        resizeMode="cover"
                        onError={(error) => console.error('图片加载失败:', error, item.imageUrl)}
                    />
                ) : (
                    <Feather name="image" size={35} color="#ddd" />
                )}
            </View>
            <View style={styles.messageContent}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodCategory}>{item.category}</Text>
                <View style={styles.expiryContainer}>
                    <Text style={styles.expiryText}>过期时间: {item.expiryDate}</Text>
                </View>
                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityText}>数量: {item.quantity} {item.unit || '个'}</Text>
                    <Text style={[styles.statusBadge, { backgroundColor: '#FFC107' }]}>
                        数量不足
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#769678', '#E9EDEB']}
                style={styles.headerGradient}
            >
                <View style={styles.headerContainer}>
                    <ThemedText type="title" style={styles.headerTitle}>消息</ThemedText>
                </View>
            </LinearGradient>
            <FlatList
                style={styles.content}
                data={[]}
                renderItem={() => null}
                ListHeaderComponent={
                    <>
                        {/* 临期食材预警 */}
                        {warningItems.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>临期食材预警</Text>
                                {warningItems.map((item) => renderWarningItem({ item, index: item.id }))}
                            </View>
                        )}

                        {/* 过期食材预警 */}
                        {expiredItems.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>过期食材提醒</Text>
                                {expiredItems.map((item) => renderExpiredItem({ item, index: item.id }))}
                            </View>
                        )}

                        {/* 数量不足提醒 */}
                        {insufficientItems.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>数量不足提醒</Text>
                                {insufficientItems.map((item) => renderInsufficientItem({ item, index: item.id }))}
                            </View>
                        )}

                        {/* 无消息时的提示 */}
                        {warningItems.length === 0 && expiredItems.length === 0 && insufficientItems.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Feather name="inbox" size={50} color="#ddd" />
                                <Text style={styles.emptyText}>暂无食材预警消息</Text>
                                <Text style={styles.emptySubText}>所有食材都在保质期内且数量充足</Text>
                            </View>
                        )}
                    </>
                }
                ListFooterComponent={<View style={{ height: 20 }} />}
                showsVerticalScrollIndicator={false}
            />
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
    content: {
        flex: 1,
        backgroundColor: '#E9EDEB', // RGB(233,237,235)
        padding: 20,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#769678',
        marginBottom: 15,
    },
    messageCard: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    foodImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    messageContent: {
        flex: 1,
        justifyContent: 'center',
    },
    foodName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    foodCategory: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    expiryContainer: {
        marginBottom: 4,
    },
    expiryText: {
        fontSize: 12,
        color: '#666',
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 14,
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 15,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
        textAlign: 'center',
    },
});
