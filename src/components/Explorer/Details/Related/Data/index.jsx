//React
import React, { useEffect } from 'react';
import $ from 'jquery';
//Components
import Group from './Group';
//Styles
import './styles.scss';

export default function Data(props) {
  const { type, data } = props;

  useEffect(() => {
    const allPanels = $('.detail-related-content .accordion-panel').hide();
    const allHeadings = $('.detail-related-content .accordion-heading');
    allHeadings.on('click', function () {
      const isOpen = $(this).hasClass('open');
      if (isOpen) {
        $(this).siblings('.accordion-panel').slideUp();
        $(this).removeClass('open');
      } else {
        allPanels.slideUp();
        allHeadings.removeClass('open');
        $(this).addClass('open');
        $(this).siblings('.accordion-panel').slideDown();
      }
      return false;
    });
  }, []);

  return (
    <div className={`related-data ${type}`}>
      {data.map((item, index) => (
        <div key={index}>
          <div className="accordion-heading">
            {item.title} ({item.length})
          </div>
          <Group id={`group-${index}`} results={item.results} />
        </div>
      ))}
    </div>
  );
}
