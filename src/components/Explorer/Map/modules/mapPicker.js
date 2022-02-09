import $ from 'jquery';
import axios from 'axios';

function mapPickerList() {
  return axios
    .post('http://geospatialresearch.mtu.edu/date_picker.php')
    .then((res) => {
      console.log('RES', res);
      const min = res.data.min;
      const max = res.data.max;
      const total = max - min;
      const segmentData = res.data.segments;
      const segments = [];
      let prevPercent = 0;
      const segmentNum = segmentData.length;
      segmentData.forEach((segment, index) => {
        const segmentMin = segment.min;
        const segmentMax = segment.max;
        const segmentTotal = segmentMax - segmentMin;
        const segmentPercent = (segmentTotal / total) * 100;
        const left = `${prevPercent}%`;
        const right =
          segmentNum === index + 1
            ? '100%'
            : `${prevPercent + segmentPercent}%`;
        prevPercent = prevPercent + segmentPercent;
        segments.push({
          id: index + 1,
          size: segmentPercent,
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
        const item = `<li>
        ${segment.title}
        <span class="left">${segment.left}</span>
        <span class="right">${segment.right}</span>
        <span class="min">${segment.dateMin}</span>
        <span class="max">${segment.dateMax}</span>
        <span class="url">${segment.url}</span>
        </li>`;
        list = list + item;
      });
      return `<div class="map-picker">
          <h2>Overlay Options</h2>
          <p>Choose a map overlay</p>
          <ul>
            ${list}
          </ul>
          </div>`;
    })
    .catch((error) => console.log(error));
}

export { mapPickerList };
