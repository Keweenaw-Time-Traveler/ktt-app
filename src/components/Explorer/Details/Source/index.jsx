//React
import React from 'react';

export default function Source(props) {
  const { type, data } = props;

  return (
    <option
      value={data.value}
      data-type={type}
      data-x={data.x}
      data-y={data.y}
      data-recnumber={data.recnumber}
      data-markerid={data.markerid}
      data-mapyear={data.mapyear}
    >
      {data.label}
    </option>
  );
}
