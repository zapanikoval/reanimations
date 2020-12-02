import {WINDOW_WIDTH} from '../constants/styles';

export const getRandomOffset = () => {
  return Math.random() * (WINDOW_WIDTH - 60);
};
