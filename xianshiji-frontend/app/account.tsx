import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { apiUrl } from '@/constants/api';

export default function AccountScreen() {
    const [user, setUser] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [form, setForm] = useState({
        nickname: '',
        phone: '',
        email: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const loadUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                setForm({
                    nickname: parsedUser.nickname || '',
                    phone: parsedUser.phone || '',
                    email: parsedUser.email || '',
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                router.replace('/login');
            }
        };
        loadUser();
    }, [router]);

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
    };

    const handleAvatarPress = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('权限不足', '需要访问相册权限');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelectedImageUri(result.assets[0].uri);
        }
    };

    const uploadAvatar = async () => {
        if (!selectedImageUri || !user) return;

        const formData = new FormData();
        formData.append('file', {
            uri: selectedImageUri,
            type: 'image/jpeg',
            name: 'avatar.jpg',
        } as any);
        formData.append('userId', user.id.toString());

        try {
            const response = await fetch(apiUrl('/users/upload-avatar'), {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                const updatedUser = { ...user, avatarUrl: data.avatarUrl };
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setSelectedImageUri(null);
                Alert.alert('成功', '头像上传成功');
            } else {
                Alert.alert('失败', data.message || '头像上传失败');
            }
        } catch (error) {
            Alert.alert('错误', '头像上传失败，请检查网络连接');
        }
    };

    const handleSave = async () => {
        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            Alert.alert('错误', '两次输入的新密码不一致');
            return;
        }

        setLoading(true);
        try {
            // 如果有新头像，先上传
            if (selectedImageUri) {
                await uploadAvatar();
            }

            const updateData: any = {
                id: user.id,
                nickname: form.nickname,
                phone: form.phone,
                email: form.email
            };

            if (form.newPassword) {
                updateData.oldPassword = form.oldPassword;
                updateData.newPassword = form.newPassword;
            }

            const response = await fetch(apiUrl('/users/update'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();
            if (data.success) {
                const updatedUser = { ...user, ...updateData };
                delete updatedUser.oldPassword;
                delete updatedUser.newPassword;
                delete updatedUser.confirmPassword;

                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setEditMode(false);
                Alert.alert('成功', '信息更新成功');
            } else {
                Alert.alert('失败', data.message);
            }
        } catch (error) {
            Alert.alert('错误', '网络错误，请检查后端地址');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <View style={styles.container}>
                <Text>加载中...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <LinearGradient
                colors={['#769678', '#E9EDEB']}
                style={styles.headerGradient}
            >
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={() => router.back()}
                >
                    <Feather name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        {selectedImageUri || user?.avatarUrl ? (
                            <Image
                                source={{ uri: selectedImageUri || apiUrl(user.avatarUrl) }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Feather name="user" size={60} color="#fff" />
                        )}
                    </View>
                    <TouchableOpacity style={styles.editAvatarButton} onPress={handleAvatarPress}>
                        <Feather name="camera" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.userName}>{user.nickname}</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setEditMode(!editMode)}
                >
                    <Feather name={editMode ? "x" : "edit-2"} size={20} color="#fff" />
                    <Text style={styles.editButtonText}>{editMode ? '取消' : '编辑'}</Text>
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>基本信息</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>昵称</Text>
                        {editMode ? (
                            <TextInput
                                style={styles.input}
                                value={form.nickname}
                                onChangeText={(value) => handleChange('nickname', value)}
                                placeholder="请输入昵称"
                            />
                        ) : (
                            <Text style={styles.inputValue}>{user.nickname}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>手机号</Text>
                        {editMode ? (
                            <TextInput
                                style={styles.input}
                                value={form.phone}
                                onChangeText={(value) => handleChange('phone', value)}
                                placeholder="请输入手机号"
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.inputValue}>{user.phone || '未设置'}</Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>邮箱</Text>
                        {editMode ? (
                            <TextInput
                                style={styles.input}
                                value={form.email}
                                onChangeText={(value) => handleChange('email', value)}
                                placeholder="请输入邮箱"
                                keyboardType="email-address"
                            />
                        ) : (
                            <Text style={styles.inputValue}>{user.email || '未设置'}</Text>
                        )}
                    </View>
                </View>

                {editMode && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>修改密码</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>当前密码</Text>
                            <TextInput
                                style={styles.input}
                                value={form.oldPassword}
                                onChangeText={(value) => handleChange('oldPassword', value)}
                                placeholder="请输入当前密码"
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>新密码</Text>
                            <TextInput
                                style={styles.input}
                                value={form.newPassword}
                                onChangeText={(value) => handleChange('newPassword', value)}
                                placeholder="请输入新密码"
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>确认新密码</Text>
                            <TextInput
                                style={styles.input}
                                value={form.confirmPassword}
                                onChangeText={(value) => handleChange('confirmPassword', value)}
                                placeholder="请再次输入新密码"
                                secureTextEntry
                            />
                        </View>
                    </View>
                )}

                {editMode && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => setEditMode(false)}>
                            <Text style={styles.cancelButtonText}>取消</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                            <Text style={styles.saveButtonText}>{loading ? '保存中...' : '保存'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E9EDEB',
    },
    headerGradient: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 30,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 10,
        top: 40,
        padding: 10,
    },
    avatarSection: {
        position: 'relative',
        marginBottom: 15,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#769678',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    editButtonText: {
        color: '#fff',
        marginLeft: 8,
        fontSize: 16,
    },
    content: {
        flex: 1,
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
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9f9f9',
    },
    inputValue: {
        fontSize: 16,
        color: '#333',
        paddingVertical: 12,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 10,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#769678',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 10,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
