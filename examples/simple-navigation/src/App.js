import React from 'react';
import './App.css';

const Grid = ({ rows = 0, cols = 0 }) => {
  rows = Array.from(Array(rows).keys());
  cols = Array.from(Array(cols).keys());
  return (
    <div className="grid">
      {rows.map(row => (
        <div className="row">
          {cols.map(col => (
            <div className="col">
              <p>{row}x{col}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const Container = () => (
  <div className="app">
    <div className="container">
      <Grid rows={2} cols={3} />
      <br />
      <Grid rows={5} cols={5} />
    </div>
    <div className="buttons">
      <button type="button">Up</button>
      <button type="button">Down</button>
      <button type="button">Right</button>
      <button type="button">Left</button>
      <br />
      <button type="button">Back</button>
      <button type="button">Esc</button>
      <button type="button">Enter</button>
    </div>
  </div>
);

export default Container;
