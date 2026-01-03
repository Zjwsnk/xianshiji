import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function MessagesScreen() {
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const user = await AsyncStorage.getItem('user');
            if (!user) {
                router.replace('/login');
            }
        };
        checkAuth();
    }, [router]);

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
            <View style={styles.content}>
                <Text style={styles.placeholder}>保质期预警消息</Text>
                <Text style={styles.placeholder}>家庭组邀请通知</Text>
                <Text style={styles.placeholder}>系统通知</Text>
            </View>
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
    placeholder: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginVertical: 20,
    },
});
