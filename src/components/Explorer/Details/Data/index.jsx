//React
import React, { useEffect } from 'react';
//Tooptip
import Tooltip from 'react-tooltip-lite';
// Linkify
import Linkify from 'react-linkify';
//Styles
import './styles.scss';

export default function Data(props) {
  const { item } = props;

  // Ensure external links open in a new tab
  useEffect(() => {
    let links = document.getElementsByTagName('a');
    for (let i = 0; i < links.length; i++) {
      links[i].setAttribute('target', '_blank');
    }
  } , [props]);

  return (
    <div className="detail-block">
      <div className="detail-block-title">
        <h2>{item.title}</h2>
      </div>
      <div className="detail-block-data">
        {item.fields &&
          item.fields.map((item, index) => (
            <div className="detail-item" key={index}>
              <Linkify>
                <Tooltip content={item.tooltip} direction="right">
                  <span className="label">{item.title}</span>
                  {item.value}
                </Tooltip>
              </Linkify>
            </div>
          ))}
      </div>
    </div>
  );
}
