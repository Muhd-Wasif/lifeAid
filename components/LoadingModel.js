import React from 'react';
import { View, Modal, ActivityIndicator } from 'react-native';

const LoadingModal = ({ visible }) => (
    <Modal transparent animationType="none" visible={visible}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#CF0A0A" />
        </View>
    </Modal>
);

export default LoadingModal;
