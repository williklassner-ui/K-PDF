import React from 'react';
import {
  View,
  TextInput,
  Switch,
  StyleSheet,
  Text,
} from 'react-native';
import { useEditorStore } from '@/store/editorStore';
import { normalizedToScreen } from '@/utils/pdfCoordinates';
import { Colors } from '@/constants/colors';

interface FormFieldOverlayProps {
  pageIndex: number;
  containerWidth: number;
  containerHeight: number;
}

export function FormFieldOverlay({
  pageIndex,
  containerWidth,
  containerHeight,
}: FormFieldOverlayProps) {
  const { formFields, updateFormField } = useEditorStore();

  const pageFields = formFields.filter((f) => f.pageIndex === pageIndex);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {pageFields.map((field) => {
        const screen = normalizedToScreen(
          { x: field.x, y: field.y, width: field.width, height: field.height },
          containerWidth,
          containerHeight
        );

        if (field.fieldType === 'checkbox') {
          return (
            <View
              key={field.fieldName}
              style={[
                styles.fieldAbsolute,
                {
                  left: screen.x,
                  top: screen.y,
                  width: screen.width,
                  height: screen.height,
                },
              ]}
            >
              <Switch
                value={Boolean(field.value)}
                onValueChange={(v) => updateFormField(field.fieldName, v)}
                trackColor={{ true: Colors.primary, false: Colors.borderLight }}
                thumbColor={field.value ? Colors.primaryLight : '#fff'}
                style={{ transform: [{ scale: 0.7 }] }}
              />
            </View>
          );
        }

        return (
          <TextInput
            key={field.fieldName}
            style={[
              styles.textField,
              {
                left: screen.x,
                top: screen.y,
                width: screen.width,
                height: screen.height,
                fontSize: Math.max(10, screen.height * 0.55),
              },
            ]}
            value={String(field.value ?? '')}
            onChangeText={(v) => updateFormField(field.fieldName, v)}
            multiline={screen.height > 40}
            numberOfLines={screen.height > 40 ? 3 : 1}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldAbsolute: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textField: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 235, 59, 0.25)',
    borderWidth: 1,
    borderColor: Colors.accent,
    color: Colors.textPrimaryLight,
    paddingHorizontal: 4,
    paddingVertical: 0,
    borderRadius: 2,
  },
});
