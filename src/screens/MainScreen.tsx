import React, {useCallback, useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import _ from 'lodash';
import {DefaultText, Styles} from '../constants/styles';
import {LeftBar} from '../components/LeftBar';
import {Balloon} from '../components/Balloon';
import {BALLOONS} from '../constants/storage';
import UUIDGenerator from 'react-native-uuid-generator';
import uuid from 'react-native-uuid';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Shade} from '../components/Shade';

export interface BalloonProps {
  color: string;
  id: string;
}

interface MainScreenProps {
  balloons: BalloonProps[] | [];
}

export const MainScreen: React.FC<MainScreenProps> = ({
  balloons: cachedBalloons,
}) => {
  const [balloons, setBalloons] = useState<BalloonProps[] | []>(cachedBalloons);
  const [textTaps, setTextTaps] = useState<number>(0);

  const textFallValue = useSharedValue(0);

  const barRef = useRef(null);

  const onShowPress = useCallback(() => {
    barRef.current && barRef.current.show();
  }, []);

  const onAddBalloon = useCallback(
    async (item: string) => {
      let id;

      try {
        id = await UUIDGenerator.getRandomUUID();
      } catch (e) {
        console.error('Error was occurred while uuid generating', e);
        id = uuid.v1();
      }

      const newItem = {
        color: item,
        id,
      };
      const items = [newItem, ...balloons];
      setBalloons(items);

      try {
        const jsonItems = JSON.stringify(items);
        await AsyncStorage.setItem(BALLOONS, jsonItems);
      } catch (e) {
        console.error(
          'ERROR was occurred while item adding to async storage',
          e,
        );
      }
    },
    [setBalloons, balloons],
  );

  const onRemoveItem = useCallback(
    async (itemId: string) => {
      const items = _.remove(balloons, ({id}) => id !== itemId);
      setBalloons(items);

      try {
        const jsonItems = JSON.stringify(items);
        await AsyncStorage.setItem(BALLOONS, jsonItems);
      } catch (e) {
        console.error(
          'ERROR was occurred while item deleting to async storage',
          e,
        );
      }
    },
    [setBalloons, balloons],
  );

  const onWorldPress = useCallback(() => {
    setTextTaps(textTaps + 1);

    if (textTaps === 10) {
      textFallValue.value = withTiming(1, {duration: 1500});
    }
  }, [setTextTaps, textTaps]);

  const textStyles = useAnimatedStyle(
    () => ({
      transform: [
        {translateY: interpolate(textFallValue.value, [0, 1], [0, 800])},
        {rotate: `${interpolate(textFallValue.value, [0, 1], [0, 720])}deg`},
      ],
    }),
    [],
  );

  const onReload = useCallback(async () => {
    textFallValue.value = 0;

    setTextTaps(0);

    try {
      const id = await UUIDGenerator.getRandomUUID();
      setBalloons([
        {
          id,
          color: 'red',
        },
      ]);
    } catch (e) {
      console.error('Error was occurred while uuid getting', e);
    }
  }, [setBalloons, textFallValue.value, setTextTaps]);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.text}>Hello </Text>
        <Animated.Text style={[styles.text, textStyles]} onPress={onWorldPress}>
          World
        </Animated.Text>
      </View>
      {balloons.map(({color, id}) => (
        <Balloon key={id} color={color} id={id} onRemove={onRemoveItem} />
      ))}
      <Text style={styles.burger} onPress={onShowPress}>
        |||
      </Text>
      <LeftBar
        ref={barRef}
        balloons={balloons}
        onAddItem={onAddBalloon}
        onRemoveItem={onRemoveItem}
      />
      <Shade onSwipeToEnd={onReload} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Styles.dark,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flexDirection: 'row',
  },
  text: {
    ...DefaultText,
  },
  burger: {
    position: 'absolute',
    top: 60,
    left: 30,
    fontSize: 25,
    transform: [
      {
        rotate: '90deg',
      },
    ],
  },
});
