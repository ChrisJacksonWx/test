// Updated map-layers.js to use mesoToken and API call from obs.js
const stateName = 'South Carolina';
let map;

// Import mesoToken from obs.js
import { mesoToken } from './obs';

// Load the map style from a JSON file
fetch('./roads-basemap-with-terrain.json')
  .then(response => response.json())
  .then(mapStyle => {
    fetch('https://raw.githubusercontent.com/ChrisJacksonWx/geojson-store/main/CONUS-State-Mask.geojson')
      .then(response => response.json())
      .then(data => {
        const targetFeature = data.features.find(feature => feature.properties.NAME === stateName);

        // Extract the coordinates from the GeoJSON object
        const bboxCoordinates = targetFeature.geometry.coordinates;

        // Iterate over each layer and add the filter
        mapStyle.layers.forEach(layer => {
          if (layer.type === 'symbol') {
            layer.filter = ["all", ["within", {
              "type": "MultiPolygon",
              "coordinates": bboxCoordinates
            }]];
          } else if (layer.id === 'other-states') {
            layer.filter = ["!=", "NAME", stateName];
          } else if (layer.id === 'target-state') {
            layer.filter = ["==", "NAME", stateName];
          }
        });

        // Initialize the map with the modified style
        map = new maplibregl.Map({
          container: 'map', // container ID
          style: mapStyle, // style object
          center: [-81, 33.6], // starting position [lng, lat]
          zoom: 7, // starting zoom
          minZoom: 5,
          maxBounds: [-98, 27, -65, 40],
        });

        map.on('load', () => {
          onLoad();
        });
      })
      .catch(error => {
        console.error('Error loading states geojson:', error);
      });
  })
  .catch(error => {
    console.error('Error loading map style:', error);
  });

// Fetch observations using mesoToken
const fetchObservations = () => {
  const apiUrl = `https://api.synopticlabs.org/v2/stations/latest`;
  const queryParams = new URLSearchParams({
    token: mesoToken,
    state: 'SC',
    vars: 'air_temp,dew_point_temperature,wind_speed,wind_direction',
    network: '1',
  });

  return fetch(`${apiUrl}?${queryParams}`)
    .then(response => response.json())
    .then(data => {
      data.STATION.forEach(station => {
        const {
          STID: id,
          NAME: name,
          LATITUDE: lat,
          LONGITUDE: lon,
          ELEVATION: elev,
          OBSERVATIONS: {
            air_temp_value_1: temp,
            dew_point_temperature_value_1d: dew,
            wind_speed_value_1: speed,
            wind_direction_value_1: direction,
          },
        } = station;

        createStationPlot(
          id,
          name,
          temp?.value,
          temp?.value ? temp.value * 9 / 5 + 32 : 'N/A',
          dew?.value ? dew.value * 9 / 5 + 32 : 'N/A',
          speed?.value,
          direction?.value,
          lat,
          lon,
          elev
        );
      });
    })
    .catch(error => console.error('Error fetching observations:', error));
};

const onLoad = () => {
  fetchObservations();
};

const createStationPlot = (id, name, tempValid, temp, dew, speed, direction, lat, lon, elev) => {
  // Station plot creation logic remains unchanged
  console.log(`Station: ${name} at [${lat}, ${lon}]`);
};
