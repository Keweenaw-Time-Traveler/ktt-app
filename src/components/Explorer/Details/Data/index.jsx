//React
import React from 'react';
//Styles
import './styles.scss';

export default function Data(props) {
  const { item } = props;

  return (
    <div className="detail-block">
      <div className="detail-block-title">
        <h2>{item.title}</h2>
      </div>
      <div className="detail-block-data">
        {item.fields &&
          item.fields.map((item, index) => (
            <div className="detail-item" key={index}>
              <span className="label">{item.title}</span>
              {item.value}
            </div>
          ))}
      </div>
    </div>
  );
}
