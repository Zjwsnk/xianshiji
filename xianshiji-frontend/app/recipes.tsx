import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiUrl } from '@/constants/api';

interface Recipe {
    id: number;
    name: string;
    imageUrl?: string;
    cuisineType: string;
    description?: string;
    steps?: string;
}

export default function RecipesScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [user, setUser] = useState<any>(null);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showSearchTags, setShowSearchTags] = useState(false);

    // 菜谱分类
    const categories = ['家常菜', '粤菜', '快手菜', '健康餐', '川菜', '面食', '早餐', '东北菜'];

    // 配置导航栏
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: '食材菜谱',
        });
    }, [navigation]);

    useEffect(() => {
        const checkAuth = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            } else {
                router.replace('/login');
            }
        };
        checkAuth();
        loadRecipes();
    }, [router]);

    useEffect(() => {
        filterRecipes();
    }, [recipes, searchText, selectedCategory]);

    const loadRecipes = async () => {
        try {
            const url = apiUrl('/recipes');
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setRecipes(data.data);
            }
        } catch (error) {
            console.error('加载菜谱失败:', error);
        }
    };

    const filterRecipes = () => {
        let filtered = recipes;

        // 按分类筛选
        if (selectedCategory) {
            filtered = filtered.filter(recipe => recipe.cuisineType === selectedCategory);
        }

        // 按搜索文本筛选
        if (searchText.trim()) {
            filtered = filtered.filter(recipe =>
                recipe.name.toLowerCase().includes(searchText.toLowerCase()) ||
                recipe.cuisineType.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredRecipes(filtered);
    };

    const handleCategoryPress = (category: string) => {
        setSelectedCategory(category);
        setSearchText('');
        setShowSearchTags(false);
    };

    const handleDetailPress = (recipe: Recipe) => {
        router.push(`/recipe-detail?id=${recipe.id}`);
    };

    const renderRecipeItem = ({ item }: { item: Recipe }) => (
        <View style={styles.recipeCard}>
            <View style={styles.recipeImage}>
                {item.imageUrl ? (
                    <Image 
                        source={{ uri: item.imageUrl }} 
                        style={{ width: '100%', height: '100%', borderRadius: 8 }} 
                        resizeMode="cover"
                    />
                ) : (
                    <Feather name="image" size={35} color="#ddd" />
                )}
            </View>

            <View style={styles.recipeInfo}>
                <Text style={styles.recipeName}>{item.name}</Text>
                <Text style={styles.recipeCategory}>{item.cuisineType}</Text>
            </View>

            <TouchableOpacity
                style={styles.detailButton}
                onPress={() => handleDetailPress(item)}
            >
                <Text style={styles.detailButtonText}>详细</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Pressable style={styles.container} onPress={() => setShowSearchTags(false)}>
            <View style={styles.content}>
                {/* 搜索框 */}
                <Pressable onPress={() => setShowSearchTags(true)}>
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
                                placeholder="搜索菜谱名称或分类..."
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
                </Pressable>

                    {/* 搜索标签浮层 - 位于搜索框下方 */}
                    {showSearchTags && !selectedCategory && (
                        <Pressable>
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
                        </Pressable>
                    )}

                    {/* 菜谱列表 */}
                    <FlatList
                        data={filteredRecipes}
                        renderItem={renderRecipeItem}
                        keyExtractor={(item) => item.id.toString()}
                        style={styles.list}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Feather name="book" size={50} color="#ddd" />
                                <Text style={styles.emptyText}>暂无菜谱数据</Text>
                            </View>
                        }
                    />
            </View>
        </Pressable>
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
        paddingTop: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginBottom: 15,
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
        elevation: 2,
        minHeight: 50,
    },
    searchContainerExpanded: {
        marginBottom: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        paddingVertical: 12,
        width: '100%',
        minWidth: 0,
    },
    selectedCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#769678',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        flex: 1,
    },
    selectedCategoryText: {
        color: '#fff',
        marginRight: 8,
    },
    clearButton: {
        padding: 2,
    },
    searchTagsOverlay: {
        backgroundColor: 'transparent',
        marginBottom: 15,
        maxHeight: 120,
    },
    searchTagsContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 3,
    },
    searchTag: {
        backgroundColor: '#E9EDEB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 8,
        marginBottom: 8,
    },
    searchTagText: {
        color: '#333',
        fontSize: 14,
    },
    list: {
        flex: 1,
    },
    recipeCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center',
    },
    recipeImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    recipeInfo: {
        flex: 1,
    },
    recipeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    recipeCategory: {
        fontSize: 14,
        color: '#666',
    },
    detailButton: {
        backgroundColor: '#769678',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        marginLeft: 12,
    },
    detailButtonText: {
        color: '#fff',
        fontSize: 12,
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
});