import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function StatisticsScreen() {
    return (
        <ThemedView style={styles.container}>
            <LinearGradient
                colors={['#4CAF50', '#E8F5E9']}
                style={styles.headerGradient}
            >
                <ThemedText type="title" style={styles.headerTitle}>统计</ThemedText>
            </LinearGradient>
            <View style={styles.content}>
                <Text style={styles.placeholder}>统计数据展示区域</Text>
                <Text style={styles.placeholder}>食材消耗趋势图</Text>
                <Text style={styles.placeholder}>保质期预警统计</Text>
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
