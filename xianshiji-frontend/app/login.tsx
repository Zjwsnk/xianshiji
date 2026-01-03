import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '@/constants/api';

export default function LoginScreen() {
    const [account, setAccount] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async () => {
        const trimmedAccount = account.trim();
        const trimmedPassword = password.trim();
        if (!trimmedAccount || !trimmedPassword) {
            Alert.alert('错误', '请输入账号和密码');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                apiUrl('/users/login'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ account: trimmedAccount, password: trimmedPassword }),
                }
            );

            const data = await response.json();
            if (data.success) {
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                router.replace('/(tabs)');
            } else {
                Alert.alert('登录失败', data.message || '请稍后重试');
            }
        } catch (error) {
            Alert.alert('错误', '网络错误，请检查后端地址');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>鲜食记 - 登录</Text>
            <TextInput
                style={styles.input}
                placeholder="手机号或邮箱"
                value={account}
                onChangeText={setAccount}
                keyboardType="email-address"
            />
            <TextInput
                style={styles.input}
                placeholder="密码"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? '登录中...' : '登录'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.link}>没有账号？立即注册</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
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