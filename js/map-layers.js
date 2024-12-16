const stateName = 'South Carolina'
let map;

// Load the map style from a JSON file
fetch('./roads-basemap-with-terrain.json')
  .then(response => response.json())
  .then(mapStyle => {
    fetch('https://raw.githubusercontent.com/EFisher828/geojson-store/main/CONUS-State-Mask.geojson')
    .then(response => response.json())
    .then(data => {
      const targetFeature = data.features.find(feature => feature.properties.NAME === stateName);

      // Extract the coordinates from the GeoJSON object
      const bboxCoordinates = targetFeature.geometry.coordinates

      // Iterate over each layer and add the filter
      mapStyle.layers.forEach(layer => {
        if (layer.type == 'symbol') {
          layer.filter = ["all", ["within", {
            "type": "MultiPolygon",
            "coordinates": bboxCoordinates
          }]];
        } else if (layer.id == 'other-states') {
          layer.filter = ["!=", "NAME", stateName]
        } else if (layer.id == 'target-state') {
          layer.filter = ["==", "NAME", stateName]
        }
        // if ((!layer.filter) && layer.type == 'symbol') {
        //   console.log(layer)
        //   layer.filter = ["all", ["within", {
        //     "type": "MultiPolygon",
        //     "coordinates": bboxCoordinates
        //   }]];
        // }// } else {
        //   layer.filter = ["all", ...layer.filter, ["within", {
        //     "type": "MultiPolygon",
        //     "coordinates": bboxCoordinates
        //   }]];
        // }
      });

      // Initialize the map with the modified style
      map = new maplibregl.Map({
        container: 'map', // container ID
        style: mapStyle, // style object
        center: [-81, 33.6], // starting position [lng, lat]
        zoom: 7, // starting zoom
        minZoom: 5,
        maxBounds: [-98,27,-65,40]
      });

      map.on('load', () => {
        onLoad();
      })

      // map.on('load', () => {
      //   map.addSource('states', {
      //       'type': 'geojson',
      //       'data': 'https://raw.githubusercontent.com/EFisher828/geojson-store/main/CONUS-State-Mask.geojson'
      //   });
      //
      //   // Add another layer for the remaining polygons with solid white fill
      //   map.addLayer({
      //     id: 'other-states',
      //     type: 'fill',
      //     source: 'states',
      //     paint: {
      //       'fill-color': '#FEFEFF', // Solid white fill color
      //       'fill-opacity': 1 // Adjust the opacity as needed
      //     },
      //     filter: ['!=', 'NAME', stateName] // Filter for "NAME" not equal to "New York"
      //   }, 'place_hamlet');
      // });
    })
    .catch(error => {
      console.error('Error loading states geojson:', error);
    });
  })
  .catch(error => {
    console.error('Error loading map style:', error);
  });

const createStationPlot = (id, name, tempv, temp, td, spd, dir, lat, lon, elev) => {
  var html = "<div style='min-width:225px;font-size:0.9em;margin-top:5px;font-family:'Avenir Next W00', 'Avenir Next', Avenir;'>";
	html += "	<div class='row' style='background:rgb(245,245,245);margin-top:20px;border:1px solid #959595;'>";
	html += "		<div class='col-xs-4' style='padding:1px 0px 1px 3px;'><font style='font-size:1.1em;font-weight:bold;'>" + id + "</font></div>";
	html += "		<div class='col-xs-8' style='padding:1px 3px 1px 0px;text-align:right;'> " + lat.toFixed(2) + "/" + lon.toFixed(2) + " @ " + elev + "ft." + "</div>";
	html += "	</div>";
	html += "	<div class='row' style='margin-top:5px;'>";
	html += "		<div class='col-xs-4' style='padding:0px;'>Name: </div>";
	html += "		<div class='col-xs-8' style='padding:0px;'> " + name + "</div>";
	html += "	</div>";

	if (temp != "N/A") {
		html += "	<div class='row'>";
		html += "		<div class='col-xs-4' style='padding:0px;'> " + Math.round(temp) + " &deg;F</div>";
		html += "	</div>";
	}
	if (td != "N/A") {
		html += "	<div class='row'>";
		html += "		<div class='col-xs-5' style='padding:0px;'>Dew Point: </div>";
		html += "		<div class='col-xs-4' style='padding:0px;'> " + Math.round(td) + " &deg;F</div>";
		html += "	</div>";
	}
  if (spd != "N/A") {
		html += "	<div class='row'>";
		html += "		<div class='col-xs-5' style='padding:0px;'>Wind Speed: </div>";
		html += "		<div class='col-xs-3' style='padding:0px;'> " + Math.round(spd) + " kts</div>";
		html += "	</div>";
	}
	if (dir != "N/A") {
		html += "	<div class='row'>";
		html += "		<div class='col-xs-5' style='padding:0px;'>Wind Dir: </div>";
		html += "		<div class='col-xs-3' style='padding:0px;'> " + dir + "&deg;</div>";
		html += "	</div>";
	}

	var c1_val = "";
	var startAscii = 197; // starting ascii char for font
  var wspdKts;
  try {
    wspdKts = parseFloat(spd.toFixed(5)); // wind speed kts rounded  to the nearest 5
  } catch {
    wspdKts = 5
  }

  if (wspdKts < 5) {
    wspdKts = 5
  }
	var wxChar = startAscii + Math.floor(wspdKts / 5) - 1;
	// console.log("Orig: " + spd + " Spd: " + wspdKts + " Char: " + wxChar);
	var windStr = String.fromCharCode(wxChar);
	var top = 0;
	var left = 0;
	var top = -17 + (-7 * Math.cos((dir * (Math.PI / 180))));
	var left = 6 * Math.sin((dir * (Math.PI / 180)));

	var stnPlot = "";
	stnPlot = "<div class='station-plot-div' style='position:absolute;width:" + station_plot_size + "px;height:" + station_plot_size + "px;'>";
	stnPlot += "	<div class='temp' style='font-size: " + station_font_size + "px;'>" + Math.round(temp) + "</div>";
	stnPlot += "	<div class='dew' style='font-size: " + station_font_size + "px;'>" + Math.round(td) + "</div>";
	stnPlot += "	<div class='windbarb-container' style='width:" + windbarb_container_size + "px;height:" + windbarb_container_size + "px;'>";
	stnPlot += "		<div class='windbarb' style='top:" + top + "px;left:" + left + "px;transform:rotate(" + dir + "deg);font-weight:bold;font-size: " + windbarb_size + "px;line-height:" + windbarb_size + "px;'>" + windStr + "</div>";
	stnPlot += "	</div>";
	stnPlot += "</div>";

  var el = document.createElement('div');
  el.className = 'wx-icon';
  el.innerHTML = stnPlot;
  el.style.width = '40px';
  el.style.height = '40px';

  // Create the custom marker
  var wxMarker = new maplibregl.Marker({ element: el })
    .setLngLat([lon, lat])
    .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(html)) // add popup
    .addTo(map);

  // Add hover events
  // if (obsHover) {
  //   el.addEventListener('mouseover', function() {
  //     wxMarker.togglePopup();
  //   });
  //   el.addEventListener('mouseout', function() {
  //     wxMarker.togglePopup();
  //   });
  // }
}

var station_font_size = 12;
var station_plot_size = 40;
var windbarb_size = 56;
var windbarb_container_size = 20;
var text_marker_size = 18;
var center_font = 20

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
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch observations');
      return response.json();
    })
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
