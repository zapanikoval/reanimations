import React, {useCallback, useImperativeHandle, useState} from 'react';
import {StyleSheet, Text, FlatList, View, TextInput} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {PanGestureHandler} from 'react-native-gesture-handler';

import {WINDOW_WIDTH, Styles, DefaultText} from '../constants/styles';
import {FlatListItem} from './FlatListItem';
import {BalloonProps} from '../screens/MainScreen';

const LEFT_BAR_WIDTH = WINDOW_WIDTH * 0.75;

export interface LeftBarProps {
  balloons: BalloonProps[] | [];
  onAddItem: (color: string) => void;
  onRemoveItem: (id: string) => void;
}

export const LeftBar = React.forwardRef<any, LeftBarProps>(
  ({balloons, onAddItem, onRemoveItem}, ref) => {
    const animatedOffset = useSharedValue(LEFT_BAR_WIDTH);
    const [text, setText] = useState<string>('');

    const onClosePress = useCallback(() => {
      animatedOffset.value = withTiming(LEFT_BAR_WIDTH, {
        duration: 500,
        easing: Easing.out(Easing.exp),
      });
    }, [animatedOffset.value]);

    const onOpenPress = useCallback(() => {
      animatedOffset.value = withSpring(0);
    }, [animatedOffset.value]);

    useImperativeHandle(
      ref,
      () => ({
        show: onOpenPress,
      }),
      [onOpenPress],
    );

    const containerAnimatedStyles = useAnimatedStyle(() => ({
      transform: [{translateX: -1 * animatedOffset.value}],
    }));

    const pressButtonStyles = useAnimatedStyle(() => ({
      transform: [
        {
          rotateY: `${interpolate(
            animatedOffset.value,
            [LEFT_BAR_WIDTH, 0],
            [180, 0],
          )}deg`,
        },
      ],
    }));

    const textAnimatedStyles = useAnimatedStyle(() => ({
      fontSize: interpolate(animatedOffset.value, [LEFT_BAR_WIDTH, 0], [5, 25]),
    }));

    const gestureHandler = useCallback(
      ({nativeEvent}) => {
        'worklet';
        if (nativeEvent.translationX >= 0) {
          onOpenPress();
          return;
        }
        if (nativeEvent.y <= 35) {
          return;
        }
        animatedOffset.value = -nativeEvent.translationX;
      },
      [animatedOffset.value, onOpenPress],
    );

    const stateChangeHandler = useCallback(
      ({nativeEvent: {state, translationX, y}}) => {
        'worklet';
        if (y <= 35) {
          return;
        }
        if (state === 5 && translationX < -10) {
          onClosePress();
        }
      },
      [onClosePress],
    );

    const renderItem = useCallback(
      ({item: {color, id}, index}) => {
        return (
          <FlatListItem
            color={color}
            id={id}
            index={index}
            onRemove={() => onRemoveItem(id)}
          />
        );
      },
      [onRemoveItem],
    );

    const renderSeparator = useCallback(
      () => <View style={styles.separator} />,
      [],
    );

    const handleChangeText = useCallback(
      (text: string) => {
        setText(text);
      },
      [setText],
    );

    const handleAddBalloon = useCallback(() => {
      onAddItem(text);
      setText('');
    }, [onAddItem, text, setText]);

    return (
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        onHandlerStateChange={stateChangeHandler}>
        <Animated.View style={[styles.container, containerAnimatedStyles]}>
          <Animated.Text
            style={[styles.closeButton, pressButtonStyles]}
            onPress={onClosePress}>
            x
          </Animated.Text>
          <Animated.Text style={[styles.text, textAnimatedStyles]}>
            Balloons:
          </Animated.Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={handleChangeText}
              autoCapitalize="none"
            />
            <Text style={styles.addButton} onPress={handleAddBalloon}>
              +
            </Text>
          </View>
          <FlatList
            style={styles.balloonList}
            data={balloons}
            renderItem={renderItem}
            ItemSeparatorComponent={renderSeparator}
            keyExtractor={(item) => {
              return item.id;
            }}
          />
        </Animated.View>
      </PanGestureHandler>
    );
  },
);

const styles = StyleSheet.create({
  itemContainer: {
    display: 'flex',
    flex: 1,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
  inputContainer: {
    marginRight: 15,
    marginTop: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // height: 30,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderColor: Styles.light,
    borderWidth: StyleSheet.hairlineWidth,
  },
  addButton: {
    fontSize: 20,
    color: Styles.light,
  },
  input: {
    height: 30,
    padding: 0,
    width: '85%',
    color: Styles.light,
  },
  itemText: {
    fontSize: 20,
    color: Styles.light,
  },
  balloonColor: {
    height: 20,
    width: 20,
    borderRadius: 50,
  },
  leftController: {
    display: 'flex',
    flexDirection: 'row',
    width: '20%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeButton: {
    color: Styles.light,
    fontSize: 20,
    lineHeight: 20,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  separator: {
    backgroundColor: Styles.dark,
    flex: 1,
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  balloonList: {
    paddingVertical: 20,
    width: LEFT_BAR_WIDTH - 60,
  },
  container: {
    ...StyleSheet.absoluteFill,
    width: LEFT_BAR_WIDTH + 100,
    backgroundColor: Styles.lightDark,
    borderColor: Styles.dark,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    left: -100,
    paddingLeft: 120,
    top: 60,
    bottom: 60,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.48,
    shadowRadius: 11.95,

    elevation: 18,

    padding: 20,
  },
  text: DefaultText,
  closeButton: {
    position: 'absolute',
    right: 10,
    fontSize: 25,
    color: Styles.black,
  },
});
