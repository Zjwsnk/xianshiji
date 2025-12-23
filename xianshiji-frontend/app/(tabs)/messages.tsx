import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function MessagesScreen() {
    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#4CAF50', '#E8F5E9']}
                style={styles.headerGradient}
            >
                <ThemedText type="title" style={styles.headerTitle}>消息</ThemedText>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    placeholder: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginVertical: 20,
    },
});
