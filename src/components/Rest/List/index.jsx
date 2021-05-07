//React
import React, { useEffect, useState } from 'react';
import axios from 'axios';
//Redux
import { useSelector, useDispatch } from 'react-redux';
import { selectServiceMarkers } from '../../../redux/reducers/dataSlice';
import {
  selectMarkerMessage,
  selectPeopleData,
  selectPlacesData,
  selectStoriesData,
} from '../../../redux/reducers/markersSlice';
//Styles
import './styles.scss';

const List = () => {
  const [loader, setLoader] = useState('Loading List...');
  const [people, setPeople] = useState({});
  const [places, setPlaces] = useState({});
  const [stories, setStories] = useState({});

  const messageData = useSelector(selectMarkerMessage);
  const peopleData = useSelector(selectPeopleData);
  const placesData = useSelector(selectPlacesData);
  const storiesData = useSelector(selectStoriesData);

  useEffect(() => {
    setLoader(messageData);
    setPeople(peopleData);
    setStories(storiesData);
  });

  return (
    <div className="list-wrapper">
      <div className="list-loader">{loader}</div>
      <div className="list-results">
        {Object.keys(people).map((item, index) => (
          <div
            className="list-results-item tooltip"
            key={index}
            title={people[index].title}
          >
            {people[index].title}
          </div>
        ))}
        {Object.keys(stories).map((item, index) => (
          <div
            className="list-results-item tooltip"
            key={index}
            title={stories[index].title}
          >
            {stories[index].title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;
