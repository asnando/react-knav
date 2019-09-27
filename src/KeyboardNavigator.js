import isNumber from './utils/isNumber';
import isFunction from './utils/isFunction';
import {
  UP_ACTION,
  RIGHT_ACTION,
  DOWN_ACTION,
  LEFT_ACTION,
  ENTER_ACTION,
  BACK_ACTION,
  ESC_ACTION,
} from './actionTypes';

class KeyboardNavigator {
  constructor({
    cache = false,
    reset = true,
  } = {}) {
    Object.assign(this, {
      x: 0,
      y: 0,
      refs: [],
      cached: {},
      cacheEnabled: !!cache,
      resetAxis: !!reset,
    });
  }

  createComponentReference(position, ref) {
    this.refs.push({ position, ref });
  }

  registerComponent(position, ref) {
    const x = position[0];
    const y = position[1];
    this.createComponentReference({ x, y }, ref);
  }

  unregisterComponent(ref) {
    this.refs = this.refs.filter(({ ref: componentRef }) => (
      componentRef !== ref
    ));
  }

  updatePosition(position) {
    const { x, y } = position;
    this.makeMove(x, y);
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  setX(value) {
    this.x = value;
  }

  setY(value) {
    this.y = value;
  }

  getXAxisSize() {
    const { refs } = this;
    return Math.max(
      ...refs
        .map(({ position }) => position)
        .map(({ x }) => x),
    );
  }

  getYAxisSize() {
    const { refs } = this;
    return Math.max(
      ...refs
        .map(({ position }) => position)
        .map(({ y }) => y),
    );
  }

  getCurrentPosition() {
    const x = this.getX();
    const y = this.getY();
    return { x, y };
  }

  getRefAtPosition(position) {
    const { refs } = this;
    const ref = refs.find(({ position: refPosition }) => {
      const { x: ax, y: ay } = position;
      const { x: bx, y: by } = refPosition;
      return ax === bx && ay === by;
    });
    return ref ? ref.ref : null;
  }

  refExistsAtPosition(position) {
    const { refs } = this;
    return !!refs.find(({ position: refPosition }) => {
      const { x: ax, y: ay } = position;
      const { x: bx, y: by } = refPosition;
      return ax === bx && ay === by;
    });
  }

  callComponentHook(position = this.getCurrentPosition(), hookName) {
    const ref = this.getRefAtPosition(position);
    if (ref && isFunction(ref[hookName])) {
      return ref[hookName]();
    }
    return null;
  }

  onComponentDidGotActive(position = this.getCurrentPosition()) {
    return this.callComponentHook(position, 'componentDidGotActive');
  }

  onComponentDidGotInactive(position = this.getCurrentPosition()) {
    return this.callComponentHook(position, 'componentDidGotInactive');
  }

  onComponentDidEnter(position = this.getCurrentPosition()) {
    return this.callComponentHook(position, 'componentDidEnter');
  }

  onComponentDidLeave(position = this.getCurrentPosition()) {
    return this.callComponentHook(position, 'componentDidLeave');
  }

  isCacheEnabled() {
    const { cacheEnabled } = this;
    return !!cacheEnabled;
  }

  shouldResetAxis() {
    const { resetAxis } = this;
    return !!resetAxis;
  }

  cacheValue(y, x) {
    this.cached[y] = x;
  }

  getCachedAxis(y) {
    return this.cached[y];
  }

  clearCache() {
    this.cached = {};
    const { y } = this.getCurrentPosition();
    // Force a move
    this.makeMove(0, y);
  }

  makeMove(x, y) {
    const { y: selfY } = this.getCurrentPosition();
    if (y !== selfY) {
      if (this.isCacheEnabled()) {
        this.cacheValue(selfY, x);
      }
      // eslint-disable-next-line no-param-reassign
      if (this.shouldResetAxis()) x = 0;
      if (this.isCacheEnabled()) {
        const cachedY = this.getCachedAxis(y);
        // eslint-disable-next-line no-param-reassign
        if (isNumber(cachedY)) x = cachedY;
      }
    }
    if (this.refExistsAtPosition({ x, y })) {
      this.onComponentDidGotInactive();
      this.setX(x);
      this.setY(y);
      this.onComponentDidGotActive();
    }
  }

  handleUpAction() {
    const { x, y } = this.getCurrentPosition();
    if (y > 0) {
      this.makeMove(x, y - 1);
    }
  }

  handleRightAction() {
    const { x, y } = this.getCurrentPosition();
    const axisSize = this.getXAxisSize();
    if (x + 1 <= axisSize) {
      this.makeMove(x + 1, y);
    }
  }

  handleDownAction() {
    const { x, y } = this.getCurrentPosition();
    const axisSize = this.getYAxisSize();
    if (y + 1 <= axisSize) {
      this.makeMove(x, y + 1);
    }
  }

  handleLeftAction() {
    const { x, y } = this.getCurrentPosition();
    if (x > 0) {
      this.makeMove(x - 1, y);
    }
  }

  handleEnterAction() {
    const { x, y } = this.getCurrentPosition();
    if (this.refExistsAtPosition({ x, y })) {
      this.onComponentDidEnter();
    }
  }

  handleBackAction() {
    const { x, y } = this.getCurrentPosition();
    if (this.refExistsAtPosition({ x, y })) {
      this.onComponentDidLeave();
    }
  }

  dispatchAction(actionType) {
    switch (actionType) {
      case UP_ACTION:
        return this.handleUpAction();
      case RIGHT_ACTION:
        return this.handleRightAction();
      case DOWN_ACTION:
        return this.handleDownAction();
      case LEFT_ACTION:
        return this.handleLeftAction();
      case ENTER_ACTION:
        return this.handleEnterAction();
      case BACK_ACTION:
      case ESC_ACTION:
        return this.handleBackAction();
      default:
        return null;
    }
  }
}

export default KeyboardNavigator;
