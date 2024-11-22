// configure map
const mapConfig = {
    center: [7.9465, -1.0232], // Center Ghana
    zoom: 2,
    maxZoom: 8,
    minZoom: 7,
    zoomControl: false, // Disable zoom controls to prevent zooming
    dragging: false, // Disable dragging
    scrollWheelZoom: false, // Disable scroll zooming
    doubleClickZoom: false, // Disable double-click zoom
    touchZoom: false, // Disable touch zooming (for mobile devices)
    boxZoom: false, // Disable zooming using box selection
    keyboard: false // Disable keyboard-based map controls
};

let map;
let geojsonLayer;
let regionData;
let currentProduct = null;

// Load GeoJSON and region data
async function loadData() {
    try {
        const geojsonResponse = await fetch('/ghana-geojson');
        const geojsonData = await geojsonResponse.json();

        const regionDataResponse = await fetch('/region-data');
        regionData = await regionDataResponse.json();

        return { geojsonData, regionData };
    } catch (error) {
        console.error('Error loading data:', error);
        alert('An error occurred while loading data. Please try again later.');
    }
}

async function initMap() {
    const { geojsonData, regionData } = await loadData();
    map = L.map('map',mapConfig);

    geojsonLayer = L.geoJSON(geojsonData, {
        style: defaultStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

    createRegionTabs();
    addResetButton()
}
// map styling 
function defaultStyle(feature) {
    return {
        fillColor: '#3388ff',
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Create region tabs for navigation
function createRegionTabs() {
    const tabsContainer = document.querySelector('.tabs');
    regionData.regions.forEach((region, index) => {
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.textContent = region.name;
        tab.addEventListener('click', () => showRegionInfo(region.name));
        tabsContainer.appendChild(tab);
    }); 
}
// Handle each feature interaction
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: (e) => {
            showModal();
            showRegionInfo(feature.properties.name)
        }    
    });
}
// Highlight feature on mouseover
function highlightFeature(e) {
    const layer = e.target;

    if (!currentProduct) {
        layer.setStyle({
            weight: 1,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7,
            fillColor: 'green'
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }else {
             // If currentProduct is set, show the product name and quantity in the tooltip
            const region = layer.feature.properties.name;
            const quantity = currentProduct.regions[region] || 0; // Get the quantity for the current product
            console.log(quantity);
            
            layer.bindTooltip(`Product: ${currentProduct.name}<br>Region: ${region}<br>Quantity: ${quantity}`, {
                className: 'custom-tooltip',
                sticky: true
            }).openTooltip();
        }
    }

    updateTooltip(layer);
}
// / Reset highlight on mouseout
function resetHighlight(e) {
    const layer = e.target;

    if (!currentProduct) {
        geojsonLayer.resetStyle(layer);
        layer.unbindTooltip();
    }
    map.closeTooltip();
}

// Update tooltip content
function updateTooltip(layer) {
    const regionName = layer.feature.properties.name;
    const region = regionData.regions.find(r => r.name === regionName);

 // Default population value if not available
 const population = region && region.Population && region.Population.total !== undefined ? region.Population.total : "NA";

// Calculate total farmland size if region exists
const totalFarmLandSize = region ? region.districts.reduce((sum, district) => sum + parseFloat(district.farmLandSize || 0), 0) : 0;

// Get the product quantity for the current region
const quantity = currentProduct && currentProduct.regions[regionName] !== undefined 
 ? currentProduct.regions[regionName] 
 : "NA"; // Default to "NA" if quantity is not available



    if (region) {
        // const totalFarmLandSize = region.districts.reduce((sum, district) => sum + parseFloat(district.farmLandSize), 0);
        const tooltipContent = `
            <div class="tip-content">
                <h2>Region Infomation</h2>
                <ul>
                    <li>
                        <mark>Region: </mark>
                         <small>${regionName}</small>
                    </li>
                    <li>
                        <mark>Population: </mark>
                         <small>${population}</small>
                    </li>
                    <li>
                        <mark>Farm Size acres: </mark>
                         <small>${totalFarmLandSize.toFixed(2)}</small>
                    </li>
                    <li>
                        <mark>Quantity: </mark>
                        <small>${quantity}</small>
                    </li>
                    <li>
                        <mark>SSR: </mark>
                         <small>29</small>
                    </li>
                </ul>
                <div class="tipPopulation"></div>
            </div>
        
        `;
        
        // Remove existing tooltip if any
        if (layer.getTooltip()) {
            layer.unbindTooltip();
        }

        layer.bindTooltip(tooltipContent, {
            className: 'custom-tooltip',
            sticky: true
        }).openTooltip();
    }
}

// Update the map based on selected product
function updateMap(product) {
    currentProduct = product;
    
    geojsonLayer.eachLayer(layer => {
        const region = layer.feature.properties.name;
        const isIncluded = Object.keys(product.regions).includes(region)
        
        const newStyle = {
            fillColor: isIncluded ? product.mapColor : '#CCCCCC',
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
        
        layer.setStyle(newStyle);
        
        if (isIncluded) {
            
            layer.bindTooltip(`Product: ${product.name}<br>Region: ${region}`, {
                className: 'custom-tooltip',
                sticky: true
            });
        } else {
            layer.unbindTooltip(); // Remove tooltip if not included
        }
    });
}
// Reset the map to its default state
function resetMap() {
    currentProduct = null; // Reset current product
    
    geojsonLayer.eachLayer(layer => {
        layer.setStyle(defaultStyle(layer.feature));
        if (layer.getTooltip()) {
            layer.unbindTooltip();
        }
    });
}

// Add a reset button to the map
function addResetButton() {
    const resetButton = L.control({position: 'topright'});
    resetButton.onAdd = function(map) {
        const btn = L.DomUtil.create('button', 'reset-button');
        btn.innerHTML = 'Reset Map';
        btn.onclick = resetMap;
        return btn;
    };
    resetButton.addTo(map);
}

// Setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    searchButton.addEventListener('click', () => {
        searchProduct(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchProduct(searchInput.value);
        }
    });
}
// Search for a product by name
function searchProduct(searchTerm) {
    if (!productData || !Array.isArray(productData.product)) {
        alert('Product data is not available or is not an array');
        return;
    }
    const product = productData.product.find(p => p.name.toLowerCase() === searchTerm.toLowerCase());
    
    if (product) {
        updateMap(product);
    } else {
        alert('Product not found');
    }
}

// Shuffle an array of products

// Function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Create top buttons for quick access to products
function createTopButtons() {
    const buttonContainer = document.querySelector('.button-tab');
    buttonContainer.innerHTML = ''; // Clear existing buttons
    
    // Shuffle products and limit to 5
    const shuffledProducts = shuffleArray([...productData.product]).slice(0, 5);
    shuffledProducts.forEach(product => {
        const button = document.createElement('button');
        button.className = "item-button";
        button.textContent = product.name;
        button.addEventListener('click', () => updateMap(product));
        buttonContainer.appendChild(button);
    });
}
// Show the modal dialog
function showModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
}
// Display region information in the modal

// Function to calculate fSSR
function calculateFSSR(regionName) {
    const selectedProduct = currentProduct; // Assuming currentProduct is set when a product is selected
    const production = selectedProduct.regions[regionName] || 0;

    // Calculate total import and export for the selected product
    const { totalImport, totalExport } = getImportExportDataForProduct(selectedProduct.name);

    return (production) / ((production) + totalImport - totalExport);
}

// Function to get total import and export for a specific product
function getImportExportDataForProduct(productName) {
    const exportImportData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'exportImport.json'), 'utf8'));
    let totalImport = 0;
    let totalExport = 0;

    exportImportData.emt.forEach(item => {
        if (item.Product.toLowerCase().includes(productName.toLowerCase())) {
            totalImport += item.Import;
            totalExport += item.Export;
        }
    });

    return { totalImport, totalExport };
}

// Function to calculate total food available
function calculateTotalFoodAvailable(regionName) {
    const production = currentProduct.regions[regionName] || 0;
    const { totalImport, totalExport } = getImportExportDataForProduct(currentProduct.name);
    const totalPopulation = getTotalPopulation();

    return ((production + totalImport) - totalExport) / totalPopulation;
}

// Function to calculate total food available per region
function calculateTotalFoodAvailablePerRegion(regionName) {
    const production = currentProduct.regions[regionName] || 0;
    const { totalImport, totalExport } = getImportExportDataForProduct(currentProduct.name);
    const regionPopulation = getRegionPopulation(regionName);

    return ((production + totalImport) - totalExport) / regionPopulation;
}

// Function to get total population from populationData.json
function getTotalPopulation() {
    const populationData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'populationData.json'), 'utf8'));
    return populationData.reduce((sum, region) => sum + region.Population, 0);
}

// Function to get population for a specific region
function getRegionPopulation(regionName) {
    const populationData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'populationData.json'), 'utf8'));
    const region = populationData.find(r => r.Regions === regionName);
    return region ? region.Population : 0;
}

/*
function showRegionInfo(regionName, highlightTab) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        if (tab.textContent === regionName) {
            tab.classList.add('active');
            if (highlightTab) {
                tab.classList.add('highlighted');
            }
        } else {
            tab.classList.remove('active');
            if (highlightTab) {
                tab.classList.remove('highlighted');
            }
        }
    });

    const region = regionData.regions.find(r => r.name === regionName);
    if (!region) return;

    const regionInfoContainer = document.querySelector('.region-info');
    regionInfoContainer.innerHTML = `
        <h2>${region.name}</h2>
        <p>Total Crops: ${region.totalCrops}</p>
        <p>Crops Added: ${region.cropsAdded}</p>
        <p>Annual Growth: ${region.annualGrowth}%</p>
    `;

    const tableContainer = document.querySelector('.table-container');
    tableContainer.innerHTML = `
        <table class="table-container">
            <thead>
                <tr>
                    <th>District</th>
                    <th>Crops Grown</th>
                    <th>Farm Land Size</th>
                    <th>Crop Production</th>
                </tr>
            </thead>
            <tbody>
                ${region.districts.map(district => `
                    <tr>
                        <td>${district.name}</td>
                        <td>${district.cropsGrown}</td>
                        <td>${district.farmLandSize}</td>
                        <td>${district.cropProduction}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}*/
// Hide the modal dialog
function hideModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    // Remove highlight from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('highlighted');
    });
}
// Event listener for closing the modal
document.querySelector('.close-btn').addEventListener('click', hideModal);

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Initialize buttons and search functionality on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    createTopButtons(); // Create top buttons for products
    setupSearch(); // Setup search functionality
});

// Initialize the map
initMap();