//React
import React from 'react';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//Styles
import './styles.scss';

export default function Section(props) {
  const { title, status, icon, list, onClick } = props;
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
        list.results.map((people, index) => (
          <div
            className="list-results-item tooltip"
            key={index}
            title={people.title}
            data-id={people.id}
            onClick={onClick}
          >
            {people.title}
          </div>
        ))}
    </>
  );
}
