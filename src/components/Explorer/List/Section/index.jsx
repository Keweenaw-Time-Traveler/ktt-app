//React
import React from 'react';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//Styles
import './styles.scss';

export default function Section(props) {
  const { title, type, status, icon, list, onClick } = props;
  return (
    <>
      <div className="list-results-heading people">
        <span className="txt">
          {status === 'success' ? (
            `(${list.length})`
          ) : (
            <FontAwesomeIcon icon={icon} spin />
          )}{' '}
          {title}
        </span>
      </div>
      {status === 'success' &&
        list.results.map((item, index) => (
          <div
            className="list-results-item tooltip"
            key={index}
            title={item.title}
            data-type={type}
            data-id={item.id}
            data-x={item.x}
            data-y={item.y}
            data-recnumber={item.recnumber}
            data-markerid={item.markerid}
            data-mapyear={item.map_year}
            onClick={onClick}
          >
            {item.title}
          </div>
        ))}
    </>
  );
}
