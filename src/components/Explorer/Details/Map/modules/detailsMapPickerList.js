import $ from 'jquery';
import axios from 'axios';

function detailsmMapPickerList() {
  return axios
    .post('http://geospatialresearch.mtu.edu/map_picker.php')
    .then((res) => {
      const segmentData = res.data.maps;
      const segments = [];
      segmentData.forEach((segment, index) => {
        const segmentMin = segment.min;
        const segmentMax = segment.max;
        const left = $(`.segment[data-min=${segmentMin}]`).data('left');
        const right = $(`.segment[data-min=${segmentMin}]`).data('right');
        segments.push({
          left,
          right,
          dateMin: segmentMin,
          dateMax: segmentMax,
          title: segment.title,
          url: segment.url,
        });
      });
      const currentDateMin = $('.segment.active').data('min');
      let list = '';
      $.each(segments, (index, segment) => {
        if (currentDateMin === segment.dateMin) {
          const item = `<li>
          ${segment.title}
          <span class="left">${segment.left}</span>
          <span class="right">${segment.right}</span>
          <span class="min">${segment.dateMin}</span>
          <span class="max">${segment.dateMax}</span>
          <span class="url">${segment.url}</span>
          </li>`;
          list = list + item;
        }
      });
      return `<div class="details-map-picker">
          <h2>Overlay Options</h2>
          <p>Choose a map overlay</p>
          <ul>
            ${list}
          </ul>
          </div>`;
    })
    .catch((error) => console.log(error));
}

export { detailsmMapPickerList };
