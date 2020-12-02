import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, ViewStyle} from 'react-native';
import {Styles, WINDOW_HEIGHT} from '../constants/styles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import {getRandomOffset} from '../utils/getRandomOffset';
import {
  PanGestureHandler,
  TapGestureHandler,
} from 'react-native-gesture-handler';

export interface BalloonProps {
  color?: string;
  style?: ViewStyle;
  id?: string;
  onRemove?: (id: string) => void;
}

const TO_Y_VALUE = -15;
const X_OFFSET_VALUE = 40;

export const Balloon: React.FC<BalloonProps> = ({
  color,
  style,
  id,
  onRemove,
}) => {
  const [taps, setTaps] = useState<number>(0);

  const balloonXValue = useSharedValue(0);
  const balloonYValue = useSharedValue(WINDOW_HEIGHT + 20);

  const balloonHeight = useSharedValue(70);
  const balloonWidth = useSharedValue(60);

  const treadTranslation = useSharedValue(0);

  const balloonStyles = useAnimatedStyle(
    () => ({
      backgroundColor: color,
      height: balloonHeight.value,
      width: balloonWidth.value,
      top: interpolate(balloonHeight.value, [70, 0], [0, 35]),
      left: interpolate(balloonWidth.value, [60, 0], [0, 30]),
    }),
    [color, balloonHeight.value, balloonWidth.value],
  );

  const threadStyles = useAnimatedStyle(
    () => ({
      transform: [{translateY: treadTranslation.value}],
    }),

    [],
  );

  const containerStyles = useAnimatedStyle(() => ({
    height: interpolate(balloonHeight.value, [70, 0], [110, 0]),
    width: balloonWidth.value,
    transform: [
      {translateX: balloonXValue.value},
      {translateY: balloonYValue.value},
    ],
  }));

  const onStart = useCallback((value: number) => {
    let repeatValue = 1;
    if (value > 2000) {
      repeatValue = Math.floor(value / 2000);
    }

    let direction = Math.floor(Math.random() * (1 - -1) + -1);

    if (direction === 0) {
      direction = 1;
    }

    balloonYValue.value = withTiming(TO_Y_VALUE, {
      duration: value,
    });
    balloonXValue.value = withRepeat(
      withTiming(balloonXValue.value + X_OFFSET_VALUE * direction, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      repeatValue,
      true,
    );
  }, []);

  useEffect(() => {
    balloonXValue.value = getRandomOffset();
    const randomDelay = Math.floor(Math.random() * 1000);
    setTimeout(() => onStart(8000), randomDelay);
  }, []);

  const lastPressX = useRef(0);
  const lastPressY = useRef(0);
  const tapHandlerRef = useRef(null);

  const startBalloonBoom = useCallback(() => {
    'worklet';
    balloonWidth.value = withTiming(0, {duration: 300});
    balloonHeight.value = withTiming(0, {duration: 300});
    treadTranslation.value = withTiming(WINDOW_HEIGHT, {duration: 3000});
  }, [balloonWidth.value, balloonHeight.value, treadTranslation.value]);

  const onHandlerEvent = useCallback(
    ({nativeEvent: {x, y, state, absoluteY}}) => {
      'worklet';
      if (state === 2) {
        lastPressX.current = x;
        lastPressY.current = y;
        cancelAnimation(balloonYValue);
        cancelAnimation(balloonXValue);
      }

      if (state === 5) {
        lastPressX.current = 0;
        lastPressY.current = 0;

        const duration = (8000 * Math.round(absoluteY)) / 800 - 1000;
        onStart(duration);
      }
    },
    [onStart],
  );

  const onTapEvent = useCallback(
    ({nativeEvent: {state}}) => {
      if (state === 5) {
        setTaps((prev) => prev + 1);

        if (taps === 10) {
          startBalloonBoom();
          setTimeout(() => onRemove(id), 3000);
        }
      }
    },
    [setTaps, taps, startBalloonBoom, onRemove, id],
  );

  const gestureHandler = useCallback(
    ({nativeEvent: {absoluteX, absoluteY}}) => {
      'worklet';
      balloonXValue.value = absoluteX - lastPressX.current;
      balloonYValue.value = absoluteY - 50 - lastPressY.current;
    },
    [],
  );

  return (
    <PanGestureHandler
      onGestureEvent={gestureHandler}
      onHandlerStateChange={onHandlerEvent}>
      <Animated.View style={[styles.container, style, containerStyles]}>
        <TapGestureHandler onHandlerStateChange={onTapEvent}>
          <Animated.View style={[styles.balloon, balloonStyles]} />
        </TapGestureHandler>
        <Animated.View style={[styles.thread, threadStyles]} />
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    height: 110,
    width: 60,
  },
  balloon: {
    position: 'absolute',
    // height: 70,
    // width: 60,
    borderRadius: 50,

    opacity: 0.8,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  thread: {
    height: 40,
    width: 1,
    top: 70,
    left: 29,
    backgroundColor: Styles.light,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});
