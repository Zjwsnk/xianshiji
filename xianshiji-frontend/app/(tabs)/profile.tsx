import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { apiUrl } from '@/constants/api';

export default function ProfileScreen() {
    const [user, setUser] = useState<any>(null);
    const [showFamilyModal, setShowFamilyModal] = useState(false);
    const [familyAction, setFamilyAction] = useState<'create' | 'join'>('create');
    const [familyName, setFamilyName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        };
        loadUser();
    }, []);

    const handleLogout = async () => {
        Alert.alert('确认退出', '确定要退出登录吗？', [
            { text: '取消', style: 'cancel' },
            {
                text: '确定',
                onPress: async () => {
                    await AsyncStorage.removeItem('user');
                    router.replace('/login');
                }
            }
        ]);
    };

    const handleFamilyAction = (action: 'create' | 'join') => {
        setFamilyAction(action);
        setShowFamilyModal(true);
        setFamilyName('');
        setInviteCode('');
    };

    const submitFamilyAction = async () => {
        try {
            const endpoint = familyAction === 'create' ? '/families/create' : '/families/join';
            const body = familyAction === 'create'
                ? { familyName: familyName, creatorId: user?.id?.toString() }
                : { inviteCode: inviteCode, userId: user?.id?.toString() };

            const response = await fetch(apiUrl(endpoint), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (data.success) {
                Alert.alert('成功', familyAction === 'create' ? '家庭组创建成功' : '加入家庭组成功');
                setShowFamilyModal(false);
            } else {
                Alert.alert('失败', data.message);
            }
        } catch (error) {
            Alert.alert('错误', '网络错误，请检查后端地址');
        }
    };

    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#769678', '#E9EDEB']}
                style={styles.headerGradient}
            >
                <View style={styles.userCard}>
                    <View style={styles.avatarContainer}>
                        <Feather name="user" size={50} color="#fff" />
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{user?.nickname || '未登录'}</Text>
                        <Text style={styles.userEmail}>{user?.phone || user?.email || '未绑定账号'}</Text>
                    </View>
                </View>
            </LinearGradient>
            <View style={styles.content}>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/account' as any)}>
                    <Feather name="user" size={24} color="#769678" />
                    <Text style={styles.menuText}>我的账户</Text>
                    <Feather name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/food-settings' as any)}>
                    <Feather name="settings" size={24} color="#769678" />
                    <Text style={styles.menuText}>食材设置</Text>
                    <Feather name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => handleFamilyAction('create')}>
                    <Feather name="users" size={24} color="#769678" />
                    <Text style={styles.menuText}>我的家庭</Text>
                    <Feather name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
                    <Feather name="log-out" size={24} color="#F44336" />
                    <Text style={[styles.menuText, styles.logoutText]}>退出登录</Text>
                    <Feather name="chevron-right" size={20} color="#ccc" />
                </TouchableOpacity>
            </View>

            <Modal visible={showFamilyModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {familyAction === 'create' ? '创建家庭组' : '加入家庭组'}
                        </Text>

                        {familyAction === 'create' ? (
                            <TextInput
                                style={styles.input}
                                placeholder="输入家庭组名称"
                                value={familyName}
                                onChangeText={setFamilyName}
                            />
                        ) : (
                            <TextInput
                                style={styles.input}
                                placeholder="输入邀请码"
                                value={inviteCode}
                                onChangeText={setInviteCode}
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowFamilyModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>取消</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={submitFamilyAction}
                            >
                                <Text style={styles.confirmButtonText}>确定</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 20,
        borderRadius: 15,
        width: '90%',
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    userEmail: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.9,
    },
    content: {
        flex: 1,
        backgroundColor: '#E9EDEB', // RGB(233,237,235)
        padding: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 15,
        color: '#333',
    },
    logoutItem: {
        borderWidth: 1,
        borderColor: '#F44336',
        backgroundColor: '#FFF5F5',
    },
    logoutText: {
        color: '#F44336',
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
        marginBottom: 20,
        color: '#4CAF50',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
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
        backgroundColor: '#4CAF50',
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});