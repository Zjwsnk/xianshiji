import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { apiUrl } from '@/constants/api';

export default function RegisterScreen() {
    const [form, setForm] = useState({
        phone: '',
        email: '',
        password: '',
        nickname: ''
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (field: string, value: string) => {
        setForm({ ...form, [field]: value });
    };

    const handleRegister = async () => {
        const trimmed = {
            phone: form.phone.trim(),
            email: form.email.trim(),
            password: form.password.trim(),
            nickname: form.nickname.trim()
        };
        if (!trimmed.nickname || !trimmed.password || (!trimmed.phone && !trimmed.email)) {
            Alert.alert('错误', '请填写必要信息');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                apiUrl('/users/register'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(trimmed),
                }
            );

            const data = await response.json();
            if (data.success) {
                Alert.alert('成功', '注册成功，请登录', [
                    { text: '确定', onPress: () => router.replace('/login') }
                ]);
            } else {
                Alert.alert('注册失败', data.message || '请稍后重试');
            }
        } catch (error) {
            Alert.alert('错误', '网络错误，请检查后端地址');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>鲜食记 - 注册</Text>
                <TextInput
                    style={styles.input}
                    placeholder="手机号（可选）"
                    value={form.phone}
                    onChangeText={(value) => handleChange('phone', value)}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={styles.input}
                    placeholder="邮箱（可选）"
                    value={form.email}
                    onChangeText={(value) => handleChange('email', value)}
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="密码"
                    value={form.password}
                    onChangeText={(value) => handleChange('password', value)}
                    secureTextEntry
                />
                <TextInput
                    style={styles.input}
                    placeholder="昵称"
                    value={form.nickname}
                    onChangeText={(value) => handleChange('nickname', value)}
                />
                <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? '注册中...' : '注册'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.replace('/login')}>
                    <Text style={styles.link}>已有账号？立即登录</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F1F8E9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
        color: '#4CAF50',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    link: {
        textAlign: 'center',
        color: '#4CAF50',
        fontSize: 16,
    },
});
