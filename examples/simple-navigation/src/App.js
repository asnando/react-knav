import React, { PureComponent } from 'react';
import './App.css';
import { createNavigator, watchKeyboard } from 'react-knav';

const navigator = createNavigator({
  cache: true,
});

// Starts watching for keyboard 'keydown' events.
watchKeyboard(window, navigator);

class Grid extends PureComponent {
  render() {
    let { rows, cols, x, y } = this.props;
    rows = Array.from(Array(rows).keys());
    cols = Array.from(Array(cols).keys());
    return rows.map(row => (
      <GridRow key={row} cols={cols} x={x} y={y + row} />
    ));
  }
}

class GridRow extends PureComponent {
  render() {
    const { cols, x, y } = this.props;
    return (
      <div className="row">
        { cols.map(col => (
          <GridColumn key={col} x={col + x} y={y} />
        ))}
      </div>
    );
  }
}

class GridColumn extends PureComponent {
  constructor(props) {
    super(props);
    const { x, y } = props;
    const isRoot = !x && !y;
    this.state = {
      active: isRoot,
      selected: false,
    };
  }

  componentDidMount() {
    const { x , y } = this.props;
    navigator.registerComponent([x, y], this);
  }

  componentWillUnmount() {
    navigator.unregisterComponent(this);
  }

  componentDidGotActive() {
    return this.setState({ active: true });
  }

  componentDidGotInactive() {
    return this.setState({ active: false, selected: false });
  }

  componentDidEnter() {
    return this.setState({ selected: true });
  }

  componentDidLeave() {
    return this.setState({ selected: false });
  }

  render() {
    const { x, y } = this.props;
    const { active: isActive, selected } = this.state;
    return (
      <div className={`col ${isActive ? 'active' : ''} ${selected ? 'selected' : ''}`}>
        <p>x:{x} y:{y}</p>
      </div>
    );
  }
}

class Container extends PureComponent {
  handleButtonClick(buttonType) {
    if (buttonType === 'clearCache') {
      navigator.clearCache();
    } else {
      navigator.dispatchAction(buttonType);
    }
  }
  
  render() {
    return (
      <div className="app">
        <div className="container">
          <Grid rows={1} cols={3} x={0} y={0} />
          <br />
          <Grid rows={8} cols={5} x={0} y={1} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="buttons">
            <button type="button" onClick={() => this.handleButtonClick('up')}>Up</button>
            <button type="button" onClick={() => this.handleButtonClick('down')}>Down</button>
            <button type="button" onClick={() => this.handleButtonClick('left')}>Left</button>
            <button type="button" onClick={() => this.handleButtonClick('right')}>Right</button>
            <br />
            <button type="button" onClick={() => this.handleButtonClick('back')}>Back</button>
            <button type="button" onClick={() => this.handleButtonClick('esc')}>Esc</button>
            <button type="button" onClick={() => this.handleButtonClick('enter')}>Enter</button>
            <br />
            <br />
            <button type="button" onClick={() => this.handleButtonClick('clearCache')}>Clear Button Cache</button>
          </div>
          <br />
          <p style={{ lineHeight: '1.5em' }}>... or use the keyboard arrows and buttons.</p>
        </div>
      </div>
    );
  }
}

export default Container;
