//React
import React, { useEffect, useState } from 'react';
//Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  getDetails,
  toggleDetails,
  selectDetailsStatus,
  selectDetailsName,
  selectDetailsId,
  selectDetailsType,
  selectDetailsSources,
  selectDetailsData,
  selectDetailsPhotos,
} from '../../../redux/reducers/detailsSlice';
import {
  updateListItem,
  selectActiveItem,
} from '../../../redux/reducers/listSlice';
//Styles
import './styles.scss';
//Images
import img1 from './images/img1.jpg';
import img2 from './images/img2.jpg';
import img3 from './images/img3.jpg';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/pro-light-svg-icons';
//Components
import Source from './Source';
import Data from './Data';
import Map from './Map';
import Masonry from 'react-masonry-css';

const Details = (props) => {
  const dispatch = useDispatch();
  const status = useSelector(selectDetailsStatus);
  const name = useSelector(selectDetailsName);
  const id = useSelector(selectDetailsId);
  const type = useSelector(selectDetailsType);
  const sources = useSelector(selectDetailsSources);
  const activeItem = useSelector(selectActiveItem);
  const data = useSelector(selectDetailsData);
  const photos = useSelector(selectDetailsPhotos);
  const [selectedClient, setSelectedClient] = useState(activeItem.recnumber);
  const [usePhotos, setPhotos] = useState([]);

  useEffect(() => {
    setSelectedClient(activeItem.recnumber);
    //setPhotos;
    // if (photos) {
    //   const photoArray = photos.slice(2).map(function (photo) {
    //     return (
    //       <div key={photo.id}>
    //         <img src={photo.thumbnailUrl} />
    //       </div>
    //     );
    //   });
    //   setPhotos(photoArray);
    // }
  }, [activeItem, photos]);

  let fillerImages = [
    { id: 1, url: img1 },
    { id: 2, url: img2 },
    { id: 3, url: img3 },
  ];

  fillerImages = fillerImages.map(function (item) {
    return (
      <div key={item.id}>
        <img src={item.url} />
      </div>
    );
  });

  function handleSelectChange(event) {
    const id = event.target.dataset.id;
    const recnumber = event.target.value;
    console.log(id, recnumber);
    setSelectedClient(recnumber);
    dispatch(getDetails({ id, recnumber }));
  }

  function handleCloseClick(event) {
    dispatch(updateListItem({ id: '', recnumber: '' }));
    dispatch(toggleDetails('hide'));
  }

  return (
    <>
      <div className={`details-wrapper ${props.show ? 'show' : 'hide'}`}>
        <div className="details-title">
          <h1>{name}</h1>
          <div className="details-close" onClick={handleCloseClick}>
            <FontAwesomeIcon icon={faTimes} className="fa-icon" />
          </div>
        </div>
        <div className="details-sources">
          <select
            id="details-source"
            value={selectedClient}
            onChange={handleSelectChange}
            data-id={id}
          >
            {status === 'success' &&
              sources.map((item, index) => (
                <Source key={index} type={type} data={item} />
              ))}
          </select>
        </div>
        <div className="detail-blocks">
          {data && data.map((item, index) => <Data key={index} item={item} />)}
        </div>
        <div className="detail-photos">
          <Masonry
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {fillerImages}
          </Masonry>
        </div>
      </div>
      <Map show={props.show} active={activeItem} sources={sources} />
    </>
  );
};

export default Details;
