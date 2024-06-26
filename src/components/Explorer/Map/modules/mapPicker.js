import $ from 'jquery';
import axios from 'axios';
import { Api } from '../../../../config/data';

const { MAP_PICKER } = Api;

function mapPickerList() {
  return axios
    .post(MAP_PICKER)
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

      let list = '';
      $.each(segments, (index, segment) => {
        const item = `<li class="overlay">
        ${segment.title}
        <span class="left">${segment.left}</span>
        <span class="right">${segment.right}</span>
        <span class="min">${segment.dateMin}</span>
        <span class="max">${segment.dateMax}</span>
        <span class="url">${segment.url}</span>
        </li>`;
        list = list + item;
      });
      return `<div class="main-map-picker">
          <h2>Map Options</h2>
          <p>Choose a map overlay</p>
          <ul>
            ${list}
          </ul>
          <p>Choose a basemap</p>
            <ul>
              <li class="basemap"><span class="default">Default</span></li>
              <li class="basemap"><span class="topo">Topo</span></li>
              <li class="basemap"><span class="terrain">Terrain</span></li>
              <li class="basemap"><span class="satalite">Satellite</span></li>
            </ul>
          </div>`;
    })
    .catch((error) => console.log(error));
}

export { mapPickerList };
