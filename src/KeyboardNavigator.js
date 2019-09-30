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
      refs: [],
      stacks: [],
      activeStack: 0,
      cacheEnabled: !!cache,
      resetAxisEnabled: !!reset,
    });
    this.setActiveStack(0);
  }

  isCacheEnabled() {
    const { cacheEnabled } = this;
    return !!cacheEnabled;
  }

  shouldResetAxis() {
    const { resetAxisEnabled } = this;
    return !!resetAxisEnabled;
  }

  registerComponent(position, ref) {
    const x = position[0];
    const y = position[1];
    this.refs.push({
      position: { x, y },
      ref,
    });
  }

  unregisterComponent(ref) {
    this.refs = this.refs.filter(({ ref: componentRef }) => (
      componentRef !== ref
    ));
  }

  _createStack(stackIndex = 0) {
    this.stacks[stackIndex] = {
      cachedY: {},
      x: 0,
      y: 0,
    };
  }

  getActiveStack() {
    const { stacks, activeStack } = this;
    return stacks[activeStack];
  }

  setActiveStack(stackIndex = 0) {
    const { stacks } = this;
    if (!stacks[stackIndex]) {
      this._createStack(stackIndex);
    }
    this.activeStack = stackIndex;
  }

  updatePosition([x, y]) {
    this.makeMove(x, y, true);
  }

  restoreStackPosition() {
    const { x, y } = this.getCurrentPosition();
    this.makeMove(x, y, true);
  }

  getX() {
    const { x } = this.getActiveStack();
    return x;
  }

  getY() {
    const { y } = this.getActiveStack();
    return y;
  }

  setX(value) {
    const activeStack = this.getActiveStack();
    activeStack.x = value;
  }

  setY(value) {
    const activeStack = this.getActiveStack();
    activeStack.y = value;
  }

  getCurrentPosition() {
    return {
      x: this.getX(),
      y: this.getY(),
    };
  }

  // Returns the higher X axis coordinate.
  getXAxisSize() {
    const { refs } = this;
    return Math.max(
      ...refs
        .map(({ position }) => position)
        .map(({ x }) => x),
    );
  }

  // Returns the higher Y axis coordinate.
  getYAxisSize() {
    const { refs } = this;
    return Math.max(
      ...refs
        .map(({ position }) => position)
        .map(({ y }) => y),
    );
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
    return !!this.getRefAtPosition(position);
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

  clearActiveStackCache() {
    const activeStack = this.getActiveStack();
    activeStack.cachedY = {};
  }

  cacheAxisValue(y, x) {
    const { cachedY } = this.getActiveStack();
    cachedY[y] = x;
  }

  getCachedAxisValue(y) {
    const { cachedY } = this.getActiveStack();
    return cachedY[y];
  }

  clearCache() {
    this.clearActiveStackCache();
    this.restoreStackPosition();
  }

  makeMove(x, y, restoring = false) {
    const { y: currentY } = this.getCurrentPosition();
    if (y !== currentY) {
      const isCacheEnabled = this.isCacheEnabled();
      // When cache feature is enabled it will save the
      // x axis position of the current stack before making the move.
      // Later on if user get back tot the same Y axis coordinate it
      // will restore this current value.
      if (!restoring && isCacheEnabled) {
        this.cacheAxisValue(currentY, x);
      }
      // If 'resetAxis' feature is enabled it will always reset the X
      // axis back to 0 when the Y axis change.
      // eslint-disable-next-line no-param-reassign
      if (this.shouldResetAxis()) x = 0;
      // Restore the last cached X axis coordinate when
      // user come back to the same Y axis coordinate.
      if (isCacheEnabled) {
        const cached = this.getCachedAxisValue(y);
        // eslint-disable-next-line no-param-reassign
        if (isNumber(cached)) x = cached;
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
