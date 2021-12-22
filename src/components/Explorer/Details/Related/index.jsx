//React
import React, { useEffect, useState } from 'react';
import $ from 'jquery';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import { selectDetailsId } from '../../../../redux/reducers/detailsSlice';
import {
  getRelated,
  toggleRelated,
  selectShowRelated,
  selectRelatedStatus,
  selectRelatedTotal,
  selectRelatedPeople,
} from '../../../../redux/reducers/relatedSlice';
//Components
import Data from './Data';
//Styles
import './styles.scss';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBuilding,
  faBookOpen,
  faChevronDoubleDown,
} from '@fortawesome/pro-solid-svg-icons';

export default function Related() {
  const dispatch = useDispatch();
  const id = useSelector(selectDetailsId);
  const show = useSelector(selectShowRelated);
  const status = useSelector(selectRelatedStatus);
  const total = useSelector(selectRelatedTotal);
  const people = useSelector(selectRelatedPeople);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    // const $source = $('#details-source').find(':selected');
    // const mapyear = $source.data('mapyear');
    // const markerid = $source.data('markerid');
    // console.log('GET RELATED', {
    //   id,
    //   mapyear: `${mapyear}`,
    //   markerid: `${markerid}`,
    // });
    dispatch(
      getRelated({
        id: '40F819D5-D072-4E9A-A55A-4E69A9B47F36',
        mapyear: '1917',
        markerid: '2292|Laurium|bldg',
      })
    );
  }, [id]);

  const handleHeadingClick = () => {
    if (show) {
      dispatch(toggleRelated('hide'));
      $('.detail-related-content').outerHeight(0);
      setActiveTab('');
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (!show) {
      dispatch(toggleRelated('show'));
      $('.detail-related-content').height(containerHeight());
    }
  };

  function containerHeight() {
    const wrapperHt = $('.details-wrapper').height();
    const topW = $('.details-wrapper').offset().top;
    const topS = $('.details-sources').offset().top;
    return wrapperHt - (topS - topW) - 10;
  }

  return (
    <div className={`detail-related ${show ? 'open' : 'closed'}`}>
      <div className="detail-related-heading" onClick={handleHeadingClick}>
        <div>
          Related Content <span>({total})</span>
        </div>
        {show ? (
          <div>
            <FontAwesomeIcon icon={faChevronDoubleDown} className="fa-icon" />
          </div>
        ) : null}
      </div>
      <div className={`detail-related-tabs ${show ? 'open' : 'closed'}`}>
        <div
          className={`tab people${activeTab === 'people' ? ' active' : ''}`}
          onClick={() => handleTabClick('people')}
        >
          <FontAwesomeIcon icon={faUser} className="fa-icon" />
          People
        </div>
        <div
          className={`tab places${activeTab === 'places' ? ' active' : ''}`}
          onClick={() => handleTabClick('places')}
        >
          <FontAwesomeIcon icon={faBuilding} className="fa-icon" />
          Places
        </div>
        <div
          className={`tab stories${activeTab === 'stories' ? ' active' : ''}`}
          onClick={() => handleTabClick('stories')}
        >
          <FontAwesomeIcon icon={faBookOpen} className="fa-icon" />
          Stories
        </div>
      </div>
      <div className="detail-related-content">
        {show ? <Data type="people" data={people} /> : null}
      </div>
    </div>
  );
}
