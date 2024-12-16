const stateName = 'South Carolina'
let map;

// Load the map style from a JSON file
fetch('./Dark Map.json')
  .then(response => response.json())
  .then(mapStyle => {
    fetch('https://raw.githubusercontent.com/ChrisJacksonWx/geojson-store/main/CONUS-State-Mask.geojson')
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
      //       'data': 'https://raw.githubusercontent.com/ChrisJacksonWx/geojson-store/main/CONUS-State-Mask.geojson'
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

const onLoad = () => {
  // map.fitBounds([-83.8931,31.7307,-78.0923,35.506]);

  fetch('https://api.synopticdata.com/v2/stations/latest?state=SC&vars=air_temp,dew_point_temperature,wind_speed,wind_direction&network=1&token=d8c6aee36a994f90857925cea26934be')
      .then(response => response.json())
      .then(data => {
        let stn_id, stn_name, temp_valid, temp_f, dew_f, winds, wind_kts, wind_dir, stn_latitude, stn_longitude
        data.STATION.forEach((stn) => {
          stn_id = stn.STID;
          stn_name = stn.NAME;
          stn_latitude = parseFloat(stn.LATITUDE);
			    stn_longitude = parseFloat(stn.LONGITUDE);
          stn_elevation = parseFloat(stn.ELEVATION);
          temp_f = (stn.OBSERVATIONS.air_temp_value_1 && stn.OBSERVATIONS.air_temp_value_1.value) ? parseFloat(stn.OBSERVATIONS.air_temp_value_1.value * (9/5) + 32) : "N/A";
          dew_f = (stn.OBSERVATIONS.dew_point_temperature_value_1d && stn.OBSERVATIONS.dew_point_temperature_value_1d.value) ? parseFloat(stn.OBSERVATIONS.dew_point_temperature_value_1d.value  * (9/5) + 32) : "N/A";
          winds = (stn.OBSERVATIONS.wind_speed_value_1 && stn.OBSERVATIONS.wind_speed_value_1.value) ? Math.round(parseFloat(stn.OBSERVATIONS.wind_speed_value_1.value)) : "N/A";
          wind_kts = (winds != "N/A") ? parseFloat(winds * 0.868976) : "N/A";
          wind_dir = (winds != "N/A" && stn.OBSERVATIONS.wind_direction_value_1 && stn.OBSERVATIONS.wind_direction_value_1.value) ? parseInt(stn.OBSERVATIONS.wind_direction_value_1.value) : "N/A";

          createStationPlot(stn_id, stn_name, temp_valid, temp_f, dew_f, wind_kts, wind_dir, stn_latitude, stn_longitude, stn_elevation);

        })


      })
      .catch(error => console.error('Error fetching data:', error));

  // // Fetch data from the API
  // fetch('https://api.synopticdata.com/v2/stations/latest?state=SC&vars=air_temp&network=1&token=d8c6aee36a994f90857925cea26934be')
  //     .then(response => response.json())
  //     .then(data => {
  //       console.log(data)
  //         const stations = data.STATION.map(station => {
  //             const tempC = station.OBSERVATIONS.air_temp_value_1.value;
  //             const tempF = (tempC * 9/5) + 32;
  //             return {
  //                 type: 'Feature',
  //                 geometry: {
  //                     type: 'Point',
  //                     coordinates: [station.LONGITUDE, station.LATITUDE]
  //                 },
  //                 properties: {
  //                     name: station.NAME,
  //                     tempF: Math.round(tempF,1)
  //                 }
  //             };
  //         });
  //
  //         map.addSource('stations', {
  //             type: 'geojson',
  //             data: {
  //                 type: 'FeatureCollection',
  //                 features: stations
  //             }
  //         });
  //
  //         // Add a layer to display the points
  //         map.addLayer({
  //             id: 'stations-layer',
  //             type: 'circle',
  //             source: 'stations',
  //             paint: {
  //                 'circle-radius': 10,
  //                 'circle-color': [
  //                     'interpolate',
  //                     ['linear'],
  //                     ['get', 'tempF'],
  //                     -1000,"#0cdef2",
  //                     -30,"#73CFD8",
  //                     -25,"#A6CAE3",
  //                     -20,"#C4C2E3",
  //                     -15,"#E3B3E4",
  //                     -10,"#E096E7",
  //                     -5,"#BD83E7",
  //                     0,"#9975E7",
  //                     5,"#7B7BE7",
  //                     10,"#6F95F5",
  //                     15,"#7CB5EC",
  //                     20,"#8DC8EB",
  //                     25,"#8FD8E6",
  //                     30,"#8FE6D1",
  //                     35,"#89D5B3",
  //                     40,"#6FC992",
  //                     45,"#84B076",
  //                     50,"#B3B077",
  //                     55,"#DDCA83",
  //                     60,"#F6EA8A",
  //                     65,"#F6D88D",
  //                     70,"#F7C58D",
  //                     75,"#F7AD70",
  //                     80,"#F78F71",
  //                     85,"#EE716D",
  //                     90,"#D371A3",
  //                     95,"#F77EBE",
  //                     100,"#FF9AC5",
  //                     105,"#FFB6C5",
  //                     110,"#D7B6B3",
  //                     115,"#C0C5B2",
  //                     120,"#B2D4B1",
  //                     1000,"#A1C392",
  //                 ]
  //             }
  //         });
  //
  //         // Add a layer for text labels
  //         map.addLayer({
  //             id: 'stations-labels',
  //             type: 'symbol',
  //             source: 'stations',
  //             layout: {
  //                 'text-field': ['concat', ['to-string', ['get', 'tempF']], '°F'],
  //                 'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
  //                 'text-offset': [0, 1.25],
  //                 'text-anchor': 'top'
  //             },
  //             paint: {
  //                 'text-color': '#000000'
  //             }
  //         });
  //     })
  //     .catch(error => console.error('Error fetching data:', error));
}
