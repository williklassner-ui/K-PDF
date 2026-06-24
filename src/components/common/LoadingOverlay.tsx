import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  if (!visible) return null;
  return (
    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 999, alignItems: 'center', justifyContent: 'center' }]}>
      <View
        style={{
          backgroundColor: Colors.surfaceLight,
          borderRadius: 16,
          padding: 24,
          alignItems: 'center',
          minWidth: 140,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        {message ? (
          <Text
            style={{
              marginTop: 12,
              color: Colors.textPrimaryLight,
              fontSize: 14,
              textAlign: 'center',
            }}
          >
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
