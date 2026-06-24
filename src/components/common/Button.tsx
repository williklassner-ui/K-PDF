import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { Colors } from '@/constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const bgMap = {
    primary: Colors.primary,
    secondary: Colors.surfaceLight,
    danger: Colors.error,
    ghost: 'transparent',
  };

  const textMap = {
    primary: '#fff',
    secondary: Colors.textPrimaryLight,
    danger: '#fff',
    ghost: Colors.primary,
  };

  const sizeMap = {
    sm: { px: 12, py: 6, fontSize: 13 },
    md: { px: 16, py: 10, fontSize: 15 },
    lg: { px: 20, py: 14, fontSize: 17 },
  };

  const s = sizeMap[size];

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: bgMap[variant],
          paddingHorizontal: s.px,
          paddingVertical: s.py,
          borderRadius: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled || loading ? 0.5 : 1,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: Colors.borderLight,
        },
        style as any,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.75}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textMap[variant]} size="small" />
      ) : (
        <>
          {icon && <View style={{ marginRight: 6 }}>{icon}</View>}
          <Text
            style={{
              color: textMap[variant],
              fontSize: s.fontSize,
              fontWeight: '600',
            }}
          >
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
