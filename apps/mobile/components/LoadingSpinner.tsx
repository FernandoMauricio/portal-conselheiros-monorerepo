import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function LoadingSpinner() {
    return (
        <View style={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" />
        </View>
    );
}
