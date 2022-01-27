//React
import React from 'react';
//Redux
import { useSelector } from 'react-redux';
import {
  selectAllList,
  selectListStatus,
  selectShowList,
} from '../../../../redux/reducers/listSlice';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
//Styles
import './styles.scss';

export default function Results() {
  const list = useSelector(selectAllList);
  const listStatus = useSelector(selectListStatus);
  const showList = useSelector(selectShowList);
  const markup = () => {
    if (showList) {
      return (
        <>
          Results{' '}
          <span>
            {listStatus === 'idle' ? (
              <FontAwesomeIcon icon={faCircleNotch} spin />
            ) : (
              `(${list.active.length})`
            )}
          </span>
        </>
      );
    }
    return <>Explore the map</>;
  };
  return <div className="results">{markup()}</div>;
}
