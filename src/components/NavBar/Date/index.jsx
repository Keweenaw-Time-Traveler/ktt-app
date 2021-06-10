//React
import React, { useState } from 'react';
//Styles
import './styles.css';

export default function Search() {
  const [start, setStart] = useState('1800');
  const [end, setEnd] = useState('2020');

  const onChange = (event) => {
    event.preventDefault();
    const id = event.target.getAttribute('id');
    if (id === 'navbar-date-start') {
      setStart(event.target.value);
    }
    if (id === 'navbar-date-end') {
      setEnd(event.target.value);
    }
  };

  return (
    <div className="navbar-date">
      <select
        value={start}
        onChange={onChange}
        id="navbar-date-start"
        className="esri-select"
      >
        <option value="1800">1800</option>
        <option value="1888">1888</option>
        <option value="1900">1900</option>
        <option value="1908">1908</option>
        <option value="1917">1917</option>
        <option value="1928">1928</option>
        <option value="1942">1942</option>
        <option value="1949">1949</option>
      </select>
      <select
        value={end}
        onChange={onChange}
        id="navbar-date-end"
        className="esri-select"
      >
        <option value="">End</option>
        <option value="1888">1888</option>
        <option value="1900">1900</option>
        <option value="1908">1908</option>
        <option value="1917">1917</option>
        <option value="1928">1928</option>
        <option value="1942">1942</option>
        <option value="1949">1949</option>
        <option value="2020">2020</option>
      </select>
    </div>
  );
}
