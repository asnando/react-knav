import isFunction from '../utils/isFunction';
import {
  UP_ACTION,
  RIGHT_ACTION,
  DOWN_ACTION,
  LEFT_ACTION,
  ENTER_ACTION,
  BACK_ACTION,
  ESC_ACTION,
} from '../actionTypes';

const watchKeyboard = (global, navigator) => {
  const handleKeydown = (({ keyCode }) => {
    switch (keyCode) {
      case 8:
        return navigator.dispatchAction(BACK_ACTION);
      case 13:
        return navigator.dispatchAction(ENTER_ACTION);
      case 27:
        return navigator.dispatchAction(ESC_ACTION);
      case 37:
        return navigator.dispatchAction(LEFT_ACTION);
      case 38:
        return navigator.dispatchAction(UP_ACTION);
      case 39:
        return navigator.dispatchAction(RIGHT_ACTION);
      case 40:
        return navigator.dispatchAction(DOWN_ACTION);
      default:
        return null;
    }
  });

  if (global && navigator && isFunction(global.addEventListener)) {
    global.addEventListener('keydown', handleKeydown);
  }
};

export default watchKeyboard;
