//React
import React from 'react';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//Styles
import './styles.scss';
//Components
import Item from './Item';

export default function Section(props) {
  const { title, type, status, icon, list } = props;
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
          <Item key={index} data={item} type={type} />
        ))}
    </>
  );
}
