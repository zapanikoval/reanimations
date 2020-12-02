import {Dimensions} from 'react-native';

export const Styles = {
  black: '#212121',
  dark: '#484848',
  lightDark: '#606060',
  light: '#f3f3f3',
  shade: '#fffde7',
};

export const WINDOW_WIDTH = Dimensions.get('window').width;
export const WINDOW_HEIGHT = Dimensions.get('window').height;

export const DefaultText = {
  fontSize: 20,
  color: Styles.light,
};
