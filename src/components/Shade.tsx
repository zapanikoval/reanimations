import React, {useCallback, useRef} from 'react';
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {WINDOW_HEIGHT, WINDOW_WIDTH, Styles} from '../constants/styles';
import {PanGestureHandler} from 'react-native-gesture-handler';

export interface ShadeProps {
  onSwipeToEnd: () => void;
}

export const Shade: React.FC<ShadeProps> = ({onSwipeToEnd}) => {
  const translationValue = useSharedValue(-WINDOW_HEIGHT);

  const lastPressY = useRef(0);

  const onGestureEvent = useCallback(({nativeEvent: {absoluteY, y}}) => {
    'worklet';
    translationValue.value = absoluteY - WINDOW_HEIGHT - lastPressY.current;
  });

  const onBreak = useCallback(() => {
    translationValue.value = withSpring(-WINDOW_HEIGHT);
  }, [translationValue.value]);

  const onContinue = useCallback(() => {
    onSwipeToEnd && onSwipeToEnd();

    translationValue.value = withSequence(
      withSpring(0),
      withDelay(500, withSpring(-WINDOW_HEIGHT)),
    );
  }, [onSwipeToEnd, translationValue.value]);

  const onHandlerEvent = useCallback(
    ({nativeEvent: {y, state, absoluteY}}) => {
      'worklet';
      const requiredDistance = (WINDOW_HEIGHT / 4) * 3;

      if (state === 2) {
        lastPressY.current = y;
      }

      if (state === 5) {
        if (absoluteY < requiredDistance) {
          onBreak();
        } else {
          onContinue();
        }
      }
    },
    [onBreak, onContinue],
  );

  const containerStyles = useAnimatedStyle(() => ({
    transform: [{translateY: translationValue.value}],
  }));

  const textStyles = useAnimatedStyle(() => ({
    opacity: interpolate(
      translationValue.value,
      [-WINDOW_HEIGHT, -WINDOW_HEIGHT + 100, 0],
      [0, 1, 0],
    ),
  }));

  return (
    <Animated.View style={[styles.container, containerStyles]}>
      <ActivityIndicator color={Styles.dark} size="large" />
      <Animated.Text style={[styles.text, textStyles]}>
        Swipe down to reload...
      </Animated.Text>
      <PanGestureHandler
        onHandlerStateChange={onHandlerEvent}
        onGestureEvent={onGestureEvent}>
        <Animated.View style={[styles.threadContainer]}>
          <View style={styles.thread} />
          <View style={styles.circle} />
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: WINDOW_HEIGHT,
    width: WINDOW_WIDTH,
    backgroundColor: Styles.shade,
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 400,
  },
  threadContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    left: WINDOW_WIDTH - 50,
    top: WINDOW_HEIGHT,
    padding: 5,
  },
  thread: {
    height: 80,
    width: 1,
    backgroundColor: Styles.shade,
  },
  circle: {
    height: 20,
    width: 20,
    borderRadius: 50,
    borderWidth: 2,
    backgroundColor: 'transparent',
    borderColor: Styles.shade,
  },
  text: {
    paddingBottom: 20,
    fontSize: 15,
    color: Styles.dark,
  },
});
