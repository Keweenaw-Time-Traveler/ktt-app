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
import { toggleSubmit } from '../../../redux/reducers/submitSlice';
import { updateListItem, toggleList } from '../../../redux/reducers/listSlice';
import { updateHistoryItems } from '../../../redux/reducers/historySlice';
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
  faBooks,
  faCommentsAlt,
} from '@fortawesome/pro-solid-svg-icons';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
//Components
import Loader from '../Map/Loader';
import Source from './Source';
import Data from './Data';
import Map from './Map';
import Related from './Related';
import Masonry from 'react-masonry-css';
import { default as Lightbox } from 'react-image-video-lightbox';
import Share from './Share';
import Flag from './Flag';

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
  let media = [];

  useEffect(() => {
    if (status === 'success') {
      const index = sources.findIndex((obj) => obj.selected === 'true');
      const source = sources.find((obj) => obj.selected === 'true');
      setSelectedClient(index);
      dispatch(
        updateHistoryItems({
          id,
          type,
          x: source.x,
          y: source.y,
          markerid: source.markerid,
          mapyear: source.mapyear,
          recnumber: source.recnumber,
          loctype: source.loctype,
          historyname: source.historyname,
        })
      );
    }
  }, [status, sources]);

  if (attachments) {
    thumbs = attachments.map(function (item, index) {
      if (item.content_type === 'image/jpeg' || item.content_type === 'image/png') {
        return (
          <div className="image-thumbnail" key={index} onClick={() => handleThumbClick(index)}>
            <div className="img-overlay-icon"/>
            <img src={item.url} alt={item.name} />
          </div>
        );
      } else {
        return (
          <div className="video-thumbnail" key={index} onClick={() => handleThumbClick(index)}>
            <div className="vid-overlay-icon"/>
            <video src={item.url} alt={item.name}/>
          </div>
        );
      }
    });
    attachments.map(function (item, index) {
      if (item.content_type === 'image/jpeg' || item.content_type === 'image/png') {
        media.push({
          url: item.url,
          type: "photo",
          altTag: item.name,
        });
      } else {
        media.push({
          url: item.url,
          type: "video",
          altTag: item.name,
        });
      }
    }
    );
  }

  // Event - Reset Timeline
  $('.navbar-middle').on('click', '.timeline-reset', function () {
    closeDetails();
  });
  
  $('#share-related')
      .delay(2000)
      .css('opacity', '1')
      .on('click', function () {
        $('#story-form').show();
        dispatch(toggleSubmit({visibility: 'show', id: $(this).data('id')}));
      });

  // Close lightbox if clicking outside the image/video frame
  $(document).on('click', function (e) {
    if ($(e.target).is('.lightbox-overlay div:first')) {
      setIsLightboxOpen(false);
    }
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
    $('#root').data('share-realted-xy', {x: $(event.target).find(':selected').data('x'), y: $(event.target).find(':selected').data('y')});
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
    setPhotoIndex(index);
    setIsLightboxOpen(true);
    console.log(media);
  }

  function handleUrlOpen(url) {
    window.open(url, '_blank');
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
          <button id="share-related" className="share-related-story" data-id={id}>Share Related Story</button>
          <Tooltip className={type == 'story' ? 'show' : 'hide'} content="Flag this story for innappropriate or incorrect data" direction="up">
            <Flag />
          </Tooltip>
          <Tooltip content="Data Resources" direction="up">
            <button
              className="action-icon data"
              onClick={() =>
                handleUrlOpen(
                  'https://www.keweenawhistory.com/about-the-data.html'
                )
              }
            >
              <FontAwesomeIcon icon={faBooks} className="fa-icon" />
            </button>
          </Tooltip>
          <Tooltip content="Ask an Archivist" direction="up">
            <button
              className="action-icon ask"
              onClick={() =>
                handleUrlOpen(
                  'https://www.keweenawhistory.com/ask-an-archivist.html'
                )
              }
            >
              <FontAwesomeIcon icon={faCommentsAlt} className="fa-icon" />
            </button>
          </Tooltip>
          <Tooltip content="Share Record" direction="up">
            <Share />
          </Tooltip>
        </div>
        <Related />
        {status !== 'success' && <Loader />}
      </div>
      <Map show={showMap} />
      {isLightboxOpen && (
        // <Lightbox
        //   mainSrc={images[photoIndex]}
        //   nextSrc={images[(photoIndex + 1) % images.length]}
        //   prevSrc={images[(photoIndex + images.length - 1) % images.length]}
        //   onCloseRequest={() => setIsLightboxOpen(false)}
        //   onMovePrevRequest={() => {
        //     setPhotoIndex((photoIndex + images.length - 1) % images.length);
        //   }}
        //   onMoveNextRequest={() => {
        //     setPhotoIndex((photoIndex + 1) % images.length);
        //   }}
        // />
        <div className="lightbox-overlay">
          <Lightbox
            className="lightbox"
            data={media}
            showResouceCount={true}
            startIndex={photoIndex}
            onCloseCallback={() => setIsLightboxOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default Details;
