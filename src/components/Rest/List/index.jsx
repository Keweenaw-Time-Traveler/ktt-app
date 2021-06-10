//React
import React, { useEffect, useState } from 'react';
//import axios from 'axios';
//Redux
import { useSelector } from 'react-redux';
//import { selectServiceMarkers } from '../../../redux/reducers/dataSlice';
import {
  selectListMessage,
  selectListLoading,
  selectPeopleData,
  selectPlacesData,
  selectStoriesData,
} from '../../../redux/reducers/markersSlice';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/pro-solid-svg-icons';
//Styles
import './styles.scss';

const List = () => {
  const [loader, setLoader] = useState('Loading List...');
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState({});
  const [places, setPlaces] = useState({});
  const [stories, setStories] = useState({});

  const messageData = useSelector(selectListMessage);
  const loadingData = useSelector(selectListLoading);
  const peopleData = useSelector(selectPeopleData);
  const placesData = useSelector(selectPlacesData);
  const storiesData = useSelector(selectStoriesData);

  useEffect(() => {
    setLoader(messageData);
    setLoading(loadingData);
    setPeople(peopleData);
    setPlaces(placesData);
    setStories(storiesData);
  });

  return (
    <div className="list-wrapper">
      <div className="list-loader">{loader}</div>
      <div className="list-results">
        {loading ? (
          <div>
            Finding People <FontAwesomeIcon icon={faCircleNotch} spin />
          </div>
        ) : (
          Object.keys(people)
            .slice(0, 100)
            .map((item, index) => (
              <div
                className="list-results-item tooltip"
                key={index}
                title={people[index].title}
              >
                {people[index].title}
              </div>
            ))
        )}
        {loading ? (
          <div>
            Finding Places <FontAwesomeIcon icon={faCircleNotch} spin />
          </div>
        ) : (
          Object.keys(places)
            .slice(0, 100)
            .map((item, index) => (
              <div
                className="list-results-item tooltip"
                key={index}
                title={places[index].title}
              >
                {places[index].title}
              </div>
            ))
        )}
        {loading ? (
          <div>
            Finding Stories <FontAwesomeIcon icon={faCircleNotch} spin />
          </div>
        ) : (
          Object.keys(stories)
            .slice(0, 100)
            .map((item, index) => (
              <div
                className="list-results-item tooltip"
                key={index}
                title={stories[index].title}
              >
                {stories[index].title}
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default List;
