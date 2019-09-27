Currently in `beta`

Highlights selected components in the UI based on their coordinates.

## Motivation
When we are developing some kind of uis like a tv screen or a grid component, it commonly requires a logic to manage and hightlight which component(s) are selected on screen. Some of the events come from a keyboard. Generally the document listen to something (like a `keydown` event) and dispatches a directional or a action event.

## How it works
The first version (`current`) of this navigation system is based on the smallest component of the screen that must be hightlighted. Let's get the following example: you have a card list component with N cards on it and the user can navigate using a keyboard throught the directional up and down keys.

To do the job, we will first create a global navigator. This navigator is nothing more than an array with the position of all (smallest) registered components on the current screen, in our example: the cards.

When a keydown event occurs it must be dispatched to the global navigator instance with the action (basic string, see [below](#action-types)) type.

When the navigator receives the action it will check if exists any component registered on the new generated coordinate, and if it exists, the respective hook method of the component will be called.

## Usage
```javascript
import React, { PureComponent } from 'react';
import { createNavigator } from 'react-knav';

const navigator = createNavigator({ /* ... */ });

const GridRow = ({}) => {
  return ();
};

class GridColumn extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
    };
  }
  
  componentDidMount() {
    const { x, y } = this.props;
    navigator.registerComponent([x, y], this);
  }

  componentWillUnmount() {
    navigator.unregisterComponent(this);
  }

  componentDidGotActive() {
    return this.setState({ active: true });
  }

  componentDidGotInactive() {
    return this.setState({ active: false });
  }

  render() {
    const { children } = this.props;
    return (
      <div className="grid-col">
        {children}
      </div>
    );
  }
}

const Grid = () => {
  const rows = [0,1];
  const cols = [0,1,2,3,4];
  return (
    <div className="grid">
      {rows.map((row, rowIndex) => (
        <GridRow x={0} y={rowIndex}>
          {cols.map((col, colIndex) => (
            <GridColumn x={colIndex} y={rowIndex} />
          ))}
        </GridRow>
      ))}
    </div>
  );
};

export default Grid;
```

## Creating a navigator and dispatching actions
The global navigator instance can be create directly importing the export `KeyboardNavigator` class from this lib, or using the exported `createNavigator` helper function.

```javascript
import KeyboardNavigator, { createNavigator } from 'react-knav';
```

Both listed above can receive an object with the following properties:

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| cache | Boolean | false | If must save the last active `x` axis coordinate when a `y` axis change happens.
| reset | Boolean | true | If must reset the `x` axis when a `y` axis change happens. A common behavior with components that works with keyboard events is to reset the `x` axis when the `y` axis change. For example, when you are moving out from a navbar to a card list you may not want to activate the component on the same `x` axis of the navbar items.

So, after creating the global navigator that will handle the keyboard actions, we will need to detected the keyboard actions and dispatches it to the navigator.

The events and actions can be manually detected and dispatched to the navigator using a `window.addEventListener` and after that call the [navigator.dispatchAction](#dispatchaction) method.

Or we can also use the `watchKeyboard` helper function exported by this lib, like:

```javascript
import { createNavigator, watchKeyboard } from 'react-knav';

navigation = createNavigator();

watchKeyboard(window, navigator);
```

Using the `watchKeyboard` function it will automatically bind the `keydown` event to the first param received by the function (commonly the `window` or `document`) and when one of the registered keyboard event is fired it will automatically dispatch to the navigator.

### Action Types
If you prefer to manually dispatch the action to the navigator, there is a list with the current supported actions. The action is a simple string with one of the following values: `up`, `right`, `down`, `left`, `enter`, `esc`, `back`.

<!-- ## Navigator options
The `KeyboardNavigator` class, created by the `createNavigator` helper function or directly by a class instance can receive a object with the following properties: -->

## Lifecycle
The following hook functions are called by the navigator after it receives a action:

### `componentDidGotActive`
When user navigates to the component using the directional actions.

### `componentDidGotInactive`
When user leaves the current selected component using directional actions.

### `componentDidEnter`
When a `enter` actions is dispatched to the current selected component.

### `componentDidLeave`
When a `back` or `esc`action is dispatched and there is also a current `entered` component.

## Methods
Following are the methods that must be called manually and directly on the navigator:

### `navigator.registerComponent(position, reference)`
Call this method to register a new component at the `componentDidMount` hook. Remember to always register the smallest components of the screen.

### `navigator.unregisterComponent(reference)`
Call this method to unregister the component at the `componentWillUnmount` hook.

<b>Note:</b> If you are using some route navigation system is important to unregister all the components of the screen before leaving it and in the new screen register all the newly created components.

### `navigator.clearCache()`
Manually clears the cached `x` axis of each `y` axis. It can be used when the `cache` navigator option is enabled.

### `navigator.updatePosition(position)`
If you want to restore the application navigation state to a certain point you can do it manually calling this method.
<b>Note:</b> The `position` argument refers to an array in the `[x, y]` format.

### `navigator.dispatchAction(actionType)`
Manually dispatched the [action](#action-types) tot the navigator. Use it when manually detecting the directional events.

---

<b>NOTE:</b> The `position` param refers to an array with the `x` and `y` coordinate while the `reference` refers the component reference (`this`).

## Examples
You can explore more about this lib running our examples in the [examples](https://github.com/ffrm/react-knav/tree/develop/examples) folder.

## Todo
- Handle the moment where the parent component gets inactive (based on the child leave events). So then the parent component can make any additional transition effect.
- Create a second version of the navigator where each component is wrapped with a new KeyboardNavigator hoc. The keyboard events must be directly dispatched to the root component of the tree and it must propagate throught all the children components until a action happens.