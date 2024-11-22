// Create the map and set the view to Ghana with an appropriate zoom level
const map = L.map('map').setView([7.9465, -1.0232], 7);

// Add OpenStreetMap tiles as the base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Load the GeoJSON data for Ghana's regions
fetch('/data/ghana.geojson')
  .then(response => response.json())
  .then(geojsonData => {

    // Define the style for each region
    const regionStyle = {
      color: "black",  // Border color
      weight: 1,       // Border width
      fillColor: "lightgray",  // Default fill color
      fillOpacity: 0.7 // Opacity
    };

    // Function to highlight region on hover
    function highlightRegion(event) {
      const layer = event.target;
      layer.setStyle({
        fillColor: 'orange',
        fillOpacity: 0.9
      });

      // Tooltip to display population
      const population = layer.feature.properties.population || "Unknown Population";
      layer.bindTooltip(`Population: ${population}`, {permanent: false}).openTooltip();
    }

    // Function to reset the region's style after mouseout
    function resetHighlight(event) {
      geojsonLayer.resetStyle(event.target);
    }

    // Function to handle region click - move up 10px
    function onRegionClick(event) {
      // Reset previously clicked regions
      geojsonLayer.eachLayer(function (layer) {
        layer.getElement().classList.remove('clicked-region');
      });

      const layer = event.target;
      layer.getElement().classList.add('clicked-region');
    }

    // Bind events to each region
    function onEachRegion(feature, layer) {
      layer.on({
        mouseover: highlightRegion,
        mouseout: resetHighlight,
        click: onRegionClick
      });
    }

    // Add GeoJSON layer to the map
    const geojsonLayer = L.geoJSON(geojsonData, {
      style: regionStyle,
      onEachFeature: onEachRegion
    }).addTo(map);
  })
  .catch(error => console.error('Error loading the GeoJSON data:', error));
