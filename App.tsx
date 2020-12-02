/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {SafeAreaView, StyleSheet, StatusBar, Platform} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import {BalloonProps, MainScreen} from './src/screens/MainScreen';
import 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BALLOONS} from './src/constants/storage';
import _ from 'lodash';
import UUIDGenerator from 'react-native-uuid-generator';
import uuid from 'react-native-uuid';

declare const global: {HermesInternal: null | {}};

const App = () => {
  const [balloons, setBalloons] = useState<BalloonProps[] | []>([]);

  useEffect(() => {
    const asyncFunction = async () => {
      let id;
      try {
        id = await UUIDGenerator.getRandomUUID();
      } catch (e) {
        console.log('ERROR< ', e);
        id = uuid.v1();
      }

      const defaultItems = [
        {
          color: 'red',
          id,
        },
      ];

      try {
        let items = await AsyncStorage.getItem(BALLOONS);
        items = JSON.parse(items);

        if (_.isEmpty(items)) {
          items = defaultItems;
        }

        setBalloons(items);
      } catch (e) {
        console.error(
          'ERROR was occurred while items getting from async storage',
          e,
        );
        setBalloons(defaultItems);
      }

      SplashScreen.hide && SplashScreen.hide();
    };

    asyncFunction();
  }, [setBalloons]);

  return (
    <>
      {Platform.OS === 'ios' && <StatusBar barStyle="light-content" />}
      <SafeAreaView style={styles.container}>
        {!_.isEmpty(balloons) && <MainScreen balloons={balloons} />}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
});

export default App;
