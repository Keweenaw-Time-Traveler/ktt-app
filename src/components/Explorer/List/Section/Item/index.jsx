//React
import React, { useEffect, useState } from 'react';
//Redux
import { useSelector } from 'react-redux';
import { selectActiveItem } from '../../../../../redux/reducers/listSlice';

export default function Item(props) {
  const { data, type } = props;
  const activeItem = useSelector(selectActiveItem);
  const [classes, setClasses] = useState('list-results-item tooltip');

  useEffect(() => {
    if (activeItem) {
      const active = data.recnumber == activeItem.recnumber ? ' active' : '';
      setClasses(`list-results-item tooltip${active}`);
    }
  }, [data, activeItem]);

  return (
    <div
      className={classes}
      title={data.title}
      data-type={type}
      data-id={data.id}
      data-x={data.x}
      data-y={data.y}
      data-recnumber={data.recnumber}
      data-markerid={data.markerid}
      data-mapyear={data.map_year}
    >
      {data.title}
    </div>
  );
}
