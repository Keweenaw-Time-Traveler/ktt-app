//React
import React, { useEffect } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  getList,
  selectAllList,
  selectListStatus,
  selectErrorMessage,
} from '../../../redux/reducers/listSlice';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
  faExclamationTriangle,
} from '@fortawesome/pro-solid-svg-icons';
//Styles
import './styles.scss';
//Components
import Section from './Section';
import Results from './Results';

const List = (props) => {
  const dispatch = useDispatch();
  const list = useSelector(selectAllList);
  const listStatus = useSelector(selectListStatus);
  const errormessage = useSelector(selectErrorMessage);

  useEffect(() => {
    if (listStatus === 'idle') {
      dispatch(getList({}));
    }
  }, [listStatus, dispatch]);

  return (
    <div className={`list-wrapper ${props.show ? 'show' : 'hide'}`}>
      <Results />
      {errormessage && (
        <div className="list-error">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {errormessage}
        </div>
      )}
      <div className="list-results">
        {list.active.people && (
          <Section
            title="People"
            type="people"
            status={listStatus}
            icon={faCircleNotch}
            list={list.active.people}
          />
        )}
        {list.active.places && (
          <Section
            title="Places"
            type="places"
            status={listStatus}
            icon={faCircleNotch}
            list={list.active.places}
          />
        )}
        {list.active.stories && (
          <Section
            title="Stories"
            type="stories"
            status={listStatus}
            icon={faCircleNotch}
            list={list.active.stories}
          />
        )}
      </div>
    </div>
  );
};

export default List;
