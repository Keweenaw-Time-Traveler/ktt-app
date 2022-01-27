//React
import React from 'react';

export default function Source(props) {
  const { type, data, id } = props;

  return (
    <option
      value={data.value}
      data-type={type}
      data-x={data.x}
      data-y={data.y}
      data-id={id}
      data-recnumber={data.recnumber}
      data-markerid={data.markerid}
      data-loctype={data.loctype}
      data-mapyear={data.mapyear}
      data-selected={data.selected}
    >
      {data.label}
    </option>
  );
}
