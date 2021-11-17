//React
import React, { useEffect, useState } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  updateListItem,
  selectActiveItem,
} from '../../../../../redux/reducers/listSlice';
import { toggleDetails } from '../../../../../redux/reducers/detailsSlice';

export default function Item(props) {
  const dispatch = useDispatch();
  const { data, type } = props;
  const activeItem = useSelector(selectActiveItem);
  const [classes, setClasses] = useState('list-results-item tooltip');

  useEffect(() => {
    if (activeItem) {
      const match =
        data.recnumber == activeItem.recnumber &&
        data.loctype == activeItem.loctype;
      const active = match ? ' active' : '';
      setClasses(`list-results-item tooltip${active}`);
    }
  }, [data, activeItem]);

  const handleListItemClick = () => {
    dispatch(updateListItem({ id: '', recnumber: '', recname: '' }));
    dispatch(toggleDetails('hide'));
  };

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
      data-loctype={data.loctype}
      onClick={handleListItemClick}
    >
      {data.title}
    </div>
  );
}
