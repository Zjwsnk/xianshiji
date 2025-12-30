import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, TextInput as RNTextInput, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
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
    expiryDate: string;
    status: 'NORMAL' | 'NEAR_EXPIRY' | 'INSUFFICIENT' | 'EXPIRED';
    imageUrl?: string;
}

interface Statistics {
    totalCategories: number;
    nearExpiry: number;
    insufficient: number;
    expired: number;
    totalItems: number;
}

export default function StatisticsScreen() {
    const [user, setUser] = useState<any>(null);
    const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<FoodItem[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [searchText, setSearchText] = useState('');
    const [selectedTab, setSelectedTab] = useState('全部');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showSearchTags, setShowSearchTags] = useState(false);
    const [showQuantityModal, setShowQuantityModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
    const [newQuantity, setNewQuantity] = useState('');
    const [loading, setLoading] = useState(false);

    const tabs = ['全部', '临近保质期', '数量不足', '已过期'];
    const categories = ['水果', '蔬菜', '肉类', '乳制品', '谷物', '调料', '饮料'];

    useEffect(() => {
        const loadUserAndData = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                loadFoodItems(parsedUser.id);
                loadStatistics(parsedUser.id);
            }
        };
        loadUserAndData();
    }, []);

    useEffect(() => {
        filterItems();
    }, [foodItems, searchText, selectedTab, selectedCategory]);

    const loadFoodItems = async (userId: number) => {
        try {
            // 始终获取所有食材，然后在前端进行联合筛选
            const url = apiUrl(`/food-items/user/${userId}`);
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setFoodItems(data.data);
            }
        } catch (error) {
            console.error('加载食材失败:', error);
        }
    };

    const loadStatistics = async (userId: number) => {
        try {
            const response = await fetch(apiUrl(`/food-items/user/${userId}/statistics`));
            const data = await response.json();
            if (data.success) {
                setStatistics(data.data);
            }
        } catch (error) {
            console.error('加载统计失败:', error);
        }
    };

    const filterItems = () => {
        let filtered = foodItems;

        // First filter by navigation tab (status)
        if (selectedTab !== '全部') {
            const statusMap: { [key: string]: string } = {
                '临近保质期': 'NEAR_EXPIRY',
                '数量不足': 'INSUFFICIENT',
                '已过期': 'EXPIRED'
            };
            const targetStatus = statusMap[selectedTab];
            if (targetStatus) {
                filtered = filtered.filter(item => item.status === targetStatus);
            }
        }

        // Then filter by selected category (from tags)
        if (selectedCategory) {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        // Finally filter by search text
        if (searchText.trim()) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                item.category.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredItems(filtered);
    };

    const handleTabChange = (tab: string) => {
        setSelectedTab(tab);
        if (user) {
            loadFoodItems(user.id);
        }
    };

    const handleCategoryPress = (category: string) => {
        setSelectedCategory(category);
        setSearchText('');
        setShowSearchTags(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NORMAL': return '#4CAF50';
            case 'NEAR_EXPIRY': return '#FF9800';
            case 'INSUFFICIENT': return '#9C27B0'; // Purple for insufficient
            case 'EXPIRED': return '#F44336';
            default: return '#666';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'NORMAL': return '正常';
            case 'NEAR_EXPIRY': return '临近过期';
            case 'INSUFFICIENT': return '数量不足';
            case 'EXPIRED': return '已过期';
            default: return '未知';
        }
    };

    const calculateExpiryProgress = (expiryDate: string) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const totalDays = 30;
        const daysLeft = Math.max(0, Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        return Math.min(daysLeft / totalDays, 1);
    };

    const handleConsume = (item: FoodItem) => {
        setSelectedItem(item);
        setNewQuantity(item.quantity.toString());
        setShowQuantityModal(true);
    };

    const updateQuantity = async () => {
        if (!selectedItem || !user) return;

        const quantity = parseFloat(newQuantity);
        if (isNaN(quantity) || quantity < 0) {
            Alert.alert('错误', '请输入有效的数量');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(apiUrl(`/food-items/${selectedItem.id}/quantity`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user.id,
                    quantity: quantity
                }),
            });

            const data = await response.json();
            if (data.success) {
                await loadFoodItems(user.id);
                await loadStatistics(user.id);
                setShowQuantityModal(false);
                Alert.alert('成功', '数量更新成功');
            } else {
                Alert.alert('失败', data.message);
            }
        } catch (error) {
            Alert.alert('错误', '网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    const renderFoodItem = ({ item }: { item: FoodItem }) => (
        <View style={styles.foodCard}>
            <View style={styles.foodImage}>
                <Feather name="image" size={35} color="#ddd" />
            </View>

            <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.foodCategory}>{item.category}</Text>

                <View style={styles.expiryContainer}>
                    <Text style={styles.expiryText}>保质期: {item.expiryDate}</Text>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    width: `${calculateExpiryProgress(item.expiryDate) * 100}%`,
                                    backgroundColor: getStatusColor(item.status)
                                }
                            ]}
                        />
                    </View>
                </View>

                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityText}>数量: {item.quantity} {item.unit || '个'}</Text>
                    <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        {getStatusText(item.status)}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.consumeButton}
                onPress={() => handleConsume(item)}
            >
                <Feather name="minus" size={18} color="#fff" />
                <Text style={styles.consumeButtonText}>消耗</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <TouchableWithoutFeedback onPress={() => setShowSearchTags(false)}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#769678', '#E9EDEB']}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerContainer}>
                        <ThemedText type="title" style={styles.headerTitle}>库存管理</ThemedText>
                    </View>
                </LinearGradient>

                <View style={styles.content}>
                    {/* 搜索框 */}
                    <TouchableWithoutFeedback onPress={() => setShowSearchTags(true)}>
                        <View style={[styles.searchContainer, showSearchTags && styles.searchContainerExpanded]}>
                            <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
                            {selectedCategory ? (
                                <View style={styles.selectedCategoryContainer}>
                                    <Text style={styles.selectedCategoryText}>{selectedCategory}</Text>
                                    <TouchableOpacity
                                        style={styles.clearButton}
                                        onPress={() => {
                                            setSelectedCategory('');
                                            setSearchText('');
                                        }}
                                    >
                                        <Feather name="x" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="搜索食材名称或分类..."
                                    value={searchText}
                                    onChangeText={(text) => {
                                        setSearchText(text);
                                        setSelectedCategory('');
                                        setShowSearchTags(text.length === 0);
                                    }}
                                    onFocus={() => setShowSearchTags(true)}
                                />
                            )}
                        </View>
                    </TouchableWithoutFeedback>

                    {/* 搜索标签浮层 - 位于搜索框下方 */}
                    {showSearchTags && !selectedCategory && (
                        <TouchableWithoutFeedback>
                            <View style={styles.searchTagsOverlay}>
                                <View style={styles.searchTagsContent}>
                                    {categories.map(category => (
                                        <TouchableOpacity
                                            key={category}
                                            style={styles.searchTag}
                                            onPress={() => handleCategoryPress(category)}
                                        >
                                            <Text style={styles.searchTagText}>{category}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    )}

                    {/* 导航栏 */}
                    <View style={styles.navContainer}>
                        {tabs.map(tab => (
                            <TouchableOpacity
                                key={tab}
                                style={[
                                    styles.navButton,
                                    selectedTab === tab && styles.navButtonActive
                                ]}
                                onPress={() => handleTabChange(tab)}
                            >
                                <Text style={[
                                    styles.navText,
                                    selectedTab === tab && styles.navTextActive
                                ]}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 食材列表 */}
                    <FlatList
                        data={filteredItems}
                        renderItem={renderFoodItem}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Feather name="inbox" size={50} color="#ddd" />
                                <Text style={styles.emptyText}>暂无数据</Text>
                            </View>
                        }
                    />
                </View>

                {/* 数量修改模态框 */}
                <Modal visible={showQuantityModal} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>修改数量</Text>
                            <Text style={styles.modalSubtitle}>
                                {selectedItem?.name} (当前: {selectedItem?.quantity} {selectedItem?.unit || '个'})
                            </Text>

                            <RNTextInput
                                style={styles.quantityInput}
                                value={newQuantity}
                                onChangeText={setNewQuantity}
                                placeholder="输入新数量"
                                keyboardType="numeric"
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowQuantityModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>取消</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.confirmButton]}
                                    onPress={updateQuantity}
                                    disabled={loading}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        {loading ? '更新中...' : '确定'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
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
        paddingTop: 20, // Reduced padding since overlay is now inline
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        minHeight: 50,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 12,
        width: '100%', // Ensure full width
        minWidth: 0, // Prevent text truncation
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    categoryButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
    },
    categoryButtonActive: {
        backgroundColor: '#769678',
    },
    categoryText: {
        fontSize: 14,
        color: '#666',
    },
    categoryTextActive: {
        color: '#fff',
    },
    list: {
        flex: 1,
    },
    foodCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    foodImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    foodCategory: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    expiryContainer: {
        marginBottom: 8,
    },
    expiryText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
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
        borderRadius: 10,
        fontSize: 12,
        color: '#fff',
        fontWeight: 'bold',
    },
    consumeButton: {
        backgroundColor: '#769678',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        marginLeft: 12,
    },
    consumeButtonText: {
        color: '#fff',
        fontSize: 12,
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        width: '80%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#769678',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    quantityInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    confirmButton: {
        backgroundColor: '#769678',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
    },

    tabsContainer: {
        marginBottom: 15,
    },
    tabButton: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    tabButtonActive: {
        backgroundColor: '#769678',
    },
    tabText: {
        fontSize: 14,
        color: '#666',
    },
    tabTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    searchTags: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1000,
    },
    searchTag: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        marginLeft: 8,
        marginBottom: 8,
        alignSelf: 'flex-start', // Align each tag to the left within its container
    },
    searchTagText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'left', // Text aligned to the left
    },
    searchContainerExpanded: {
        borderRadius: 15,
        paddingVertical: 10,
    },
    searchTagsContainer: {
        position: 'absolute',
        top: 60, // Position below the search box
        left: 15,
        right: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 10,
        zIndex: 9999,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    navContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 20,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    navButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    navButtonActive: {
        backgroundColor: '#769678',
    },
    navText: {
        fontSize: 14,
        color: '#769678',
        fontWeight: '500',
    },
    navTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    searchInputContainer: {
        flex: 1,
    },
    selectedCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#769678',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        alignSelf: 'center',
        marginVertical: 4,
    },
    selectedCategoryText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        marginRight: 8,
    },
    clearButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchTagsOverlay: {
        marginTop: 10,
        marginBottom: 15,
    },
    searchTagsContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', // Align tags to the left
        alignItems: 'flex-start', // Align content to the left within tags
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchTagsModal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '85%',
        maxWidth: 350,
        maxHeight: '60%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 20,
    },
    searchTagsHeader: {
        padding: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchTagsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#769678',
        textAlign: 'center',
    },
    searchTagsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 15,
        justifyContent: 'space-between',
    },
});
