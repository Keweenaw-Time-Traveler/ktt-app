//React
import React, { useEffect, useState } from 'react';
import $ from 'jquery';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  toggleDetails,
  getDetails,
  selectDetailsStatus,
  selectDetailsName,
  selectDetailsId,
  selectDetailsType,
  selectDetailsSources,
  selectDetailsData,
  selectDetailsAttachments,
} from '../../../redux/reducers/detailsSlice';
import {
  getRelated,
  toggleRelated,
  selectMapRelated,
} from '../../../redux/reducers/relatedSlice';
import { updateListItem, toggleList } from '../../../redux/reducers/listSlice';
//Tooptip
import Tooltip from 'react-tooltip-lite';
//Styles
import './styles.scss';
import 'react-image-lightbox/style.css';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faShareAlt,
  faPrint,
  faDownload,
  faChevronDoubleLeft,
} from '@fortawesome/pro-solid-svg-icons';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
//Components
import Loader from '../Map/Loader';
import Source from './Source';
import Data from './Data';
import Map from './Map';
import Related from './Related';
import Masonry from 'react-masonry-css';
import Lightbox from 'react-image-lightbox';

const Details = (props) => {
  const dispatch = useDispatch();
  const status = useSelector(selectDetailsStatus);
  const name = useSelector(selectDetailsName);
  const id = useSelector(selectDetailsId);
  const type = useSelector(selectDetailsType);
  const sources = useSelector(selectDetailsSources);
  const data = useSelector(selectDetailsData);
  const attachments = useSelector(selectDetailsAttachments);
  const showMap = useSelector(selectMapRelated);
  const [selectedClient, setSelectedClient] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  let thumbs = [];
  let images = [];

  useEffect(() => {
    if (status === 'success') {
      const index = sources.findIndex((obj) => obj.selected === 'true');
      setSelectedClient(index);
    }
  }, [status, sources]);

  if (attachments) {
    thumbs = attachments.map(function (item, index) {
      return (
        <div key={index} onClick={() => handleThumbClick(index)}>
          <img src={item.url} alt={item.name} />
        </div>
      );
    });
    images = attachments.map((item) => item.url);
  }

  // Event - Reset Timeline
  $('.navbar-middle').on('click', '.timeline-reset', function () {
    closeDetails();
  });

  function handleSourceChange(event) {
    dispatch(toggleRelated('hide'));
    $('.detail-related-content').outerHeight(0);
    const value = event.target.value;
    const recnumber = $(event.target).find(':selected').data('recnumber');
    const loctype = $(event.target).find(':selected').data('loctype');
    const mapyear = $(event.target).find(':selected').data('mapyear');
    const markerid = $(event.target).find(':selected').data('markerid');
    console.log('UPDATE LIST', { recnumber, loctype });
    setSelectedClient(value);
    dispatch(updateListItem({ recnumber, loctype }));
    console.log('UPDATE DETAILS', { id, recnumber, loctype });
    dispatch(getDetails({ id, recnumber, loctype }));
    console.log('UPDATE RELATED', { id, mapyear, markerid });
    dispatch(
      getRelated({
        id: `${id}`,
        mapyear: `${mapyear}`,
        markerid: `${markerid}`,
      })
    );
  }

  function handleCloseClick(event) {
    closeDetails();
  }

  function handleThumbClick(index) {
    console.log('THUMB CLICK', index);
    setPhotoIndex(index);
    setIsLightboxOpen(true);
  }

  function closeDetails() {
    dispatch(updateListItem({ recnumber: '', loctype: '' }));
    dispatch(toggleDetails('hide'));
    dispatch(toggleRelated('hide'));
    dispatch(toggleList('show'));
  }

  return (
    <>
      <div className={`details-wrapper ${props.show ? 'show' : 'hide'}`}>
        <div className="details-title">
          <h1>{name}</h1>
          <div className="details-close" onClick={handleCloseClick}>
            <Tooltip content="Close Details" direction="right">
              <FontAwesomeIcon icon={faTimes} className="fa-icon" />
            </Tooltip>
          </div>
        </div>
        <div className="details-sources">
          <select
            id="details-source"
            value={selectedClient}
            onChange={handleSourceChange}
            data-id={id}
          >
            {status === 'success' &&
              sources.map((item, index) => (
                <Source key={index} type={type} data={item} id={id} />
              ))}
          </select>
        </div>
        <div className="detail-blocks">
          {data && data.map((item, index) => <Data key={index} item={item} />)}
        </div>
        <div className="detail-photos">
          <Masonry
            breakpointCols={{ default: 4, 800: 4 }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {thumbs}
          </Masonry>
        </div>
        <div className="detail-actions">
          <button className="share-related-story">Share Related Story</button>
          <button className="action-icon like">
            <FontAwesomeIcon icon={faHeart} className="fa-icon" />
          </button>
          <button className="action-icon share">
            <FontAwesomeIcon icon={faShareAlt} className="fa-icon" />
          </button>
          <button className="action-icon print">
            <FontAwesomeIcon icon={faPrint} className="fa-icon" />
          </button>
          <button className="action-icon download">
            <FontAwesomeIcon icon={faDownload} className="fa-icon" />
          </button>
        </div>
        <Related />
        {status !== 'success' && <Loader />}
      </div>
      <Map show={showMap} />
      {isLightboxOpen && (
        <Lightbox
          mainSrc={images[photoIndex]}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onCloseRequest={() => setIsLightboxOpen(false)}
          onMovePrevRequest={() => {
            setPhotoIndex((photoIndex + images.length - 1) % images.length);
          }}
          onMoveNextRequest={() => {
            setPhotoIndex((photoIndex + 1) % images.length);
          }}
        />
      )}
    </>
  );
};

export default Details;
