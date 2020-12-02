import React, {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Styles} from '../constants/styles';
import Animated from 'react-native-reanimated';

export interface FlatListItem {
  id: string;
  color: string;
  index: number;
  onRemove: (text: string) => void;
}

export const FlatListItem: React.FC<FlatListItem> = ({
  color,
  index,
  onRemove,
  id,
}) => {
  const handleRemove = useCallback(
    (itemId: string) => () => {
      onRemove(itemId);
    },
    [onRemove],
  );

  return (
    <Animated.View style={[styles.itemContainer]}>
      <Text style={styles.itemText}>Balloon #{index}</Text>
      <View style={styles.leftController}>
        <View style={[styles.balloonColor, {backgroundColor: color}]} />
        <Text style={styles.removeButton} onPress={handleRemove(id)}>
          x
        </Text>
      </View>
    </Animated.View>
  );
};

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
    height: 30,
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
});
