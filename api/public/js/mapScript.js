const geoJsonUrl = '/data/ghana.geojson'; //   Ghana GeoJSON file
const populationDataUrl = '/data/population.json'; //  Ghana population file
// const regionData = '/data/regionData.json';  // Ghana cropdata file
const regionData = '/data/region.json';  // Ghana cropdata file
let cropData;

// map config
const mapConfig = {
    center: [7.9465, -1.0232], // Center Ghana
    zoom: 10,
    maxZoom: 10,
    minZoom: 6.4,
    zoomControl: false, // Disable zoom controls to prevent zooming
    dragging: false, // Disable dragging
    scrollWheelZoom: false, // Disable scroll zooming
    doubleClickZoom: false, // Disable double-click zoom
    touchZoom: false, // Disable touch zooming (for mobile devices)
    boxZoom: false, // Disable zooming using box selection
    keyboard: false // Disable keyboard-based map controls
  };
  
const map = L.map('map', mapConfig);

// toolTip
const tooltip = document.getElementById('tooltip');
let lastClickedLayer = null; // To keep track of the last clicked region


// Function to update the dashboard inside the modal with crop and region data
function updateDashboard(regionName, cropData) {
    // Find the region's data from cropData
    if (!cropData || !cropData.regions) {
        console.error('cropData or regions is undefined.');
        return;
    }
    const region = cropData.regions.find(r => r.name === regionName);
    // const region = cropData.regions.find((r) => r.name === regionName);

    if (!region) {
        console.error(`No data found for ${regionName}`);
        return;
    }

    // Update info boxes
    document.getElementById('total-crops-value').innerText = region.totalCrops || 'N/A';
    document.getElementById('crops-added-value').innerText = region.cropsAdded || 'N/A';
    document.getElementById('annual-growth-value').innerText = region.annualGrowth || 'N/A';

    // Update the table with towns data
    const tbody = document.getElementById('region-data');
    tbody.innerHTML = ''; // Clear previous rows

    region.towns.forEach((town) => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.innerText = town.name;
        row.appendChild(nameCell);

        const cropsCell = document.createElement('td');
        cropsCell.innerText = town.cropsGrown;
        row.appendChild(cropsCell);

        const landSizeCell = document.createElement('td');
        landSizeCell.innerText = town.farmLandSize;
        row.appendChild(landSizeCell);

        const productionCell = document.createElement('td');
        productionCell.innerText = town.cropProduction;
        row.appendChild(productionCell);

        tbody.appendChild(row);
    });
}



// end of modal


// Fetch GeoJSON and add it to the map
Promise.all([
    fetch(geoJsonUrl).then(response => response.json()), // this show draw the map
    fetch(populationDataUrl).then(response => response.json()),
    fetch(regionData).then(response => response.json()) // this will show the crop info {dataset of region and crops}
])
.then(([geoData, populationData,data]) => {
    cropData = data;
    if (!cropData || !cropData.regions) {
        console.error('first cropData is missing or does not contain regions');
        return;
    }

    const populationMap = new Map(populationData.map(item => [item.region, item.population]));
    
    const ghanaLayer = L.geoJson(geoData, {
        style: feature => ({ fillColor: '#3388ff', weight: 2 }),
        onEachFeature: (feature, layer) => onEachFeature(feature, layer, populationMap,cropData)
    }).addTo(map);

    // Fit the map view to the boundaries of Ghana only
    map.fitBounds(ghanaLayer.getBounds());
    
})
.catch(error => console.error('Error loading data:', error));


function onEachFeature(feature, layer, populationMap,cropData) {

    layer.on({
        mouseover: function (e) {
            const layer = e.target;
            layer.setStyle({
                fillColor: 'yellow'
            });

            const region = feature.properties.name;
            const population = populationMap.get(region) || 'No data'; // Fetch population from populationMap
            
            tooltip.innerHTML = `
            <strong>${regionName}</strong><br>
            Farm Land Size: ${totalFarmLandSize.toFixed(2)} hectares
            
            <div class="tip-content">
                <h2>Region Infomation</h2>
                <ul>
                    <li>
                        <mark>Region: </mark>
                         <small>${region}</small>
                    </li>
                    <li>
                        <mark>Population: </mark>
                         <small>${population}</small>
                    </li>
                    <li>
                        <mark>Farm Size acres: </mark>
                         <small>300</small>
                    </li>
                    <li>
                    <mark>Type of crop cultivated</mark>
                    <small>16</small>
                    </li>
                    <li>
                        <mark>SSR: </mark>
                         <small>29</small>
                    </li>
                </ul>
                <div class="tipPopulation"></div>
            </div>`
            tooltip.style.display = 'block';
            tooltip.style.top = e.originalEvent.pageY + 'px';
            tooltip.style.left = e.originalEvent.pageX + 'px';
        },
        mouseout: function (e) {
            const layer = e.target;
            layer.setStyle({
                fillColor: '#3388ff'
            });
            tooltip.style.display = 'none';
        },
        click: function (e) {
            
            const region = feature.properties.name;  // Get the clicked region's name
            showModalDashboard(region,cropData);  // Show the modal and pass cropData
        } 
    });
}


 // Function to display the modal and highlight the clicked region's tab
 function showModalDashboard(regionName, cropData) {
    if (!cropData) {
        console.error('cropData is not loaded yet.');
        return;
    }

    const modal = document.getElementById("regionModal");
    const title = document.getElementById("modal-title");

    const totalCropsValue = document.getElementById("total-crops-value");
    const cropsAddedValue = document.getElementById("crops-added-value");
    const annualGrowthValue = document.getElementById("annual-growth-value");
    const regionDataTable = document.getElementById("region-data");
    const closeModal = document.getElementsByClassName("close")[0];
    
    // Update modal title and content
    
    title.innerText = `${regionName} Region Information`;
    // Fetch the relevant region's data and update the modal content
   
    updateDashboard(regionName, cropData);
  


    // Highlight the selected region's tab dynamically
    // Highlight the selected region's tab
  document.querySelectorAll('.region-tabs li').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`${regionName.toLowerCase()}-tab`).classList.add('active');

    modal.style.display = "block";
    
}
function closeModal() {
    const modal = document.getElementById("regionModal");
    modal.style.display = "none";
}



// Load the agricultural data JSON
fetch(regionData)
    .then(response => response.json())
    .then(agricData => {
        // Set up tab button click events to update the map based on the selected crop
        document.querySelectorAll('.tab-btn').forEach(button => {
            
            button.addEventListener('click', () => {
                const crop = button.dataset.crop.toLowerCase();  // Get the crop name from the button

                // Check if the crop exists in agricData
                if (agricData[crop]) {
                    const cropData = agricData[crop];
                    const cropRegions = cropData.regions;
                    const cropColor = cropData.mapColor;

                    // Fetch the GeoJSON map data for Ghana
                    fetch(geoJsonUrl)
                        .then(response => response.json())
                        .then(geoData => {
                            // Remove existing layers from the map (optional)
                            map.eachLayer(layer => {
                                if (layer.options && layer.options.pane !== 'tilePane') {
                                    map.removeLayer(layer);
                                }
                            });

                            // Add the GeoJSON layer and style it based on the crop data
                            L.geoJson(geoData, {
                                style: feature => {
                                    const regionName = feature.properties.name;
                                    // Check if the region is one where the crop is grown
                                    if (cropRegions.hasOwnProperty(regionName)) {
                                        return { fillColor: cropColor, fillOpacity: 0.7, color: 'white', weight: 2 };
                                    }
                                    // style: feature => ({ fillColor: '#3388ff', weight: 2 }),
                                    return { fillColor: '#3388ff', fillOpacity: 0.4, weight: 2 };
                                },
                                onEachFeature: (feature, layer) => {
                                    const regionName = feature.properties.name;
                                    // If the region is in the crop data, bind a tooltip with the towns and percentage
                                    if (cropRegions[regionName]) {
                                        const towns = cropRegions[regionName].join(', ');
                                        layer.bindTooltip(`
                                            <div class="tip-content">
                                                <h2>Region Information</h2>
                                                <ul>
                                                    <li>
                                                        <mark>Region: </mark>
                                                        <small>${regionName}</small>
                                                    </li>
                                                    <li>
                                                        <mark>Population: </mark>
                                                        <small>${cropData.percentage}</small>
                                                    </li>
                                                    <li>
                                                        <mark>towns: </mark>
                                                        <small>${towns}</small>
                                                    </li>
                                                    <li>
                                                        <mark>Type of crop cultivated: </mark>
                                                        <small>16</small>
                                                    </li>
                                                    <li>
                                                        <mark>SSR: </mark>
                                                        <small>29</small>
                                                    </li>
                                                </ul>
                                                <div class="tipPopulation"></div>
                                            </div>`, 
                                             {className: 'custom-tooltip-container'},
                                            { sticky: true }
                                        );
                                    }
                                }
                            }).addTo(map);
                        })
                        .catch(error => console.error('Error loading GeoJSON:', error));
                } else {
                    console.error(`Crop ${crop} not found in agricData`);
                }
            });
        });
    })
    .catch(error => console.error('Error loading agricData:', error));
