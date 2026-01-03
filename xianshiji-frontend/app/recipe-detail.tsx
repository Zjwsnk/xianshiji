import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { apiUrl } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Recipe {
    id: number;
    name: string;
    imageUrl?: string;
    cuisineType: string;
    description?: string;
    steps?: string;
    prepTime?: number;
    cookTime?: number;
    difficulty?: string;
    servings?: number;
}

export default function RecipeDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);

    // 设置导航栏标题
    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: '食谱详情',
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

    // 加载食谱详情数据
    useEffect(() => {
        if (!id) return;
        
        const loadRecipeDetail = async () => {
            try {
                // 加载食谱基本信息
                const recipeUrl = apiUrl(`/recipes/${id}`);
                const recipeResponse = await fetch(recipeUrl);
                const recipeData = await recipeResponse.json();
                
                if (recipeData.success) {
                    setRecipe(recipeData.data);
                }
            } catch (error) {
                console.error('加载食谱详情失败:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRecipeDetail();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>加载中...</Text>
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>食谱不存在或已删除</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* 食谱图片 */}
            <View style={styles.imageContainer}>
                {recipe.imageUrl ? (
                    <Image 
                        source={{ uri: recipe.imageUrl }} 
                        style={styles.recipeImage} 
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Feather name="image" size={60} color="#ddd" />
                    </View>
                )}
            </View>

            {/* 食谱基本信息 */}
            <View style={styles.infoContainer}>
                <Text style={styles.recipeName}>{recipe.name}</Text>
                <View style={styles.metaContainer}>
                    <View style={styles.metaItem}>
                        <Feather name="book" size={16} color="#666" />
                        <Text style={styles.metaText}>{recipe.cuisineType}</Text>
                    </View>
                    {recipe.prepTime && (
                        <View style={styles.metaItem}>
                            <Feather name="clock" size={16} color="#666" />
                            <Text style={styles.metaText}>准备 {recipe.prepTime} 分钟</Text>
                        </View>
                    )}
                    {recipe.cookTime && (
                        <View style={styles.metaItem}>
                            <Feather name="coffee" size={16} color="#666" />
                            <Text style={styles.metaText}>烹饪 {recipe.cookTime} 分钟</Text>
                        </View>
                    )}
                    {recipe.servings && (
                        <View style={styles.metaItem}>
                            <Feather name="users" size={16} color="#666" />
                            <Text style={styles.metaText}>{recipe.servings} 人份</Text>
                        </View>
                    )}
                    {recipe.difficulty && (
                        <View style={styles.metaItem}>
                            <Feather name="star" size={16} color="#666" />
                            <Text style={styles.metaText}>
                                {recipe.difficulty === 'BEGINNER' ? '简单' : 
                                 recipe.difficulty === 'INTERMEDIATE' ? '中等' : '困难'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 食谱描述 */}
            {recipe.description && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>描述</Text>
                    <Text style={styles.descriptionText}>{recipe.description}</Text>
                </View>
            )}

            {/* 烹饪步骤 */}
            {recipe.steps && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>烹饪步骤</Text>
                    <View style={styles.stepsContainer}>
                        {recipe.steps.split('\n').map((step, index) => (
                            <View key={index} style={styles.stepItem}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#ff4444',
        textAlign: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#f0f0f0',
    },
    recipeImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    infoContainer: {
        padding: 20,
        backgroundColor: '#fff',
    },
    recipeName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    metaContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    metaText: {
        fontSize: 12,
        color: '#666',
    },
    sectionContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    stepsContainer: {
        gap: 16,
    },
    stepItem: {
        flexDirection: 'row',
        gap: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#769678',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    stepText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});