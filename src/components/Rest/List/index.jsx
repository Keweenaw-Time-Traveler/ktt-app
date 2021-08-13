//React
import React, { useEffect, useState } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  getList,
  selectAllList,
  selectListStatus,
} from '../../../redux/reducers/listSlice';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
//Styles
import './styles.scss';
//Components
import Section from './Section';

const List = (props) => {
  const dispatch = useDispatch();
  const list = useSelector(selectAllList);
  const listStatus = useSelector(selectListStatus);

  useEffect(() => {
    if (listStatus === 'idle') {
      dispatch(getList({}));
    }
  }, [listStatus, dispatch]);

  const handleListClick = (e) => {
    const itemId = e.target.getAttribute('data-id');
    console.log(itemId);
    // dispatch(updateListItem(itemId));
    // const view = window.kettView;
    // const graphics = window.activeGraphics;
    // console.log('ACTIVE GRAPHICS', graphics);
    // view.popup.open({
    //   features: graphics[0], // array of graphics or a single graphic in an array
    // });
    // const layers = view.map.layers;
    // layers.items.forEach((layer, index) => {
    //   if (layer.id === 'marker_layer_active') {
    //     console.log('RETURN MARKER LAYER', layer);
    //   }
    // });
  };

  return (
    <div className={`list-wrapper ${props.show ? 'show' : 'hide'}`}>
      <div className="list-results">
        {list.active.people && (
          <Section
            title="People"
            status={listStatus}
            icon={faCircleNotch}
            list={list.active.people}
            onClick={handleListClick}
          />
        )}
        {list.active.places && (
          <Section
            title="Places"
            status={listStatus}
            icon={faCircleNotch}
            list={list.active.places}
            onClick={handleListClick}
          />
        )}
        {list.active.stories && (
          <Section
            title="Stories"
            status={listStatus}
            icon={faCircleNotch}
            list={list.active.stories}
            onClick={handleListClick}
          />
        )}
      </div>
    </div>
  );
};

export default List;
