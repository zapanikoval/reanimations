import React, {useCallback, useState} from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Pressable, StyleSheet, View} from 'react-native';
import {ColorPicker} from 'react-native-color-picker';

export interface ColorProps {
  color: string;
}

export const Color: React.FC<ColorProps> = ({color}) => {
  const animatedValue = useSharedValue(0);
  const [showed, setShowed] = useState<boolean>(false);

  const pickerStyles = useAnimatedStyle(() => ({
    width: interpolate(animatedValue.value, [0, 1], [0, 200]),
    height: interpolate(animatedValue.value, [0, 1], [0, 200]),
  }));

  const onPress = useCallback(() => {
    setShowed(true);
    animatedValue.value = withTiming(1, {duration: 500});
  }, [setShowed, animatedValue.value]);

  return (
    <Pressable onPress={onPress}>
      {showed && (
        <Animated.View style={[styles.pickerContainer, pickerStyles]}>
          <ColorPicker style={styles.picker} />
        </Animated.View>
      )}
      <View style={[styles.color, {backgroundColor: color}]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  color: {
    width: 20,
    height: 20,
    borderRadius: 50,
  },
  picker: {
    flex: 1,
  },
  pickerContainer: {
    width: 0,
    height: 0,
    position: 'absolute',
    top: 15,
    left: 15,
  },
});
