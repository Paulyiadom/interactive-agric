// configure map
const mapConfig = {
    center: [7.9465, -1.0232], // Center Ghana
    zoom: 2,
    maxZoom: 3,
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
let xexportImport = [];
let currentProduct = null;
let projectionChart = null;
let currentExportImportData = [];
let baseExportImportData = [];
let totalProductionPerProduct;

async function loadExportImportData() {
    try {
        const currentResponse = await fetch('/export-import'); // Fetch current year data
        currentExportImportData = await currentResponse.json();
        const baseResponse = await fetch('/exportImport2021'); // Fetch base year data
        baseExportImportData = await baseResponse.json();
    } catch (error) {
        console.error('Error loading export/import data:', error);    
    }
}

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

async function fetchExportImportData() {
    try {
        const response = await fetch('/export-import'); // Fetch from the new endpoint
        xexportImport = await response.json();
    } catch (error) {
        console.error('Error fetching the JSON file:', error);
        return null; // Return null or handle the error as needed
    }
}
async function initMap() {
    const { geojsonData, regionData } = await loadData();
    await loadExportImportData(); // Load export/import data
    map = L.map('map',mapConfig);

    geojsonLayer = L.geoJSON(geojsonData, {
        style: defaultStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

    // createRegionTabs();
    addResetButton()
}
function calculateGrowthRate(productName) {
    
    const currentData = currentExportImportData.emt.find(item => item.Product.toLowerCase() === productName.toLowerCase());
    const baseData = baseExportImportData.emt.find(item => item.Product.toLowerCase() === productName.toLowerCase());
    
    if (currentData && baseData) {
        const currentImport = currentData.Import;
        const previousImport = baseData.Import;
        if (previousImport === 0) return null; // Avoid division by zero
        let baseToKg = previousImport / 1000;

        const growthRate = ((currentImport / baseToKg) - 1) * 100;
        return growthRate;
    }
    return null; // Product not found
}

// Project values to 2030
function projectTo2030(productName, growthRate) {

    const currentData = totalProductionPerProduct;
    if (currentData && growthRate !== null) {
        const yearsToProject = 2030 - new Date().getFullYear(); // Calculate years to 2030
        const projectedImport = currentData.Import * Math.pow(1 + (growthRate / 100), yearsToProject);
        return {
            product: productName,
            projectedImport: projectedImport.toFixed(2), // Round to two decimal places
            currentImport: currentData.Import,
            growthRate: growthRate.toFixed(2) // Round to two decimal places

        };;
    }
    return null; // Unable to project
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


function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: (e) => {
            
            const regionName = feature.properties.name; // Get the clicked region name
            const productsInfo = []; // Array to hold product information
            // Iterate through all products to find those available in the clicked region
            productData.product.forEach(product => {
                if (product.regions[regionName] !== undefined) {
                    productsInfo.push({
                        name: product.name,
                        type: product.type,
                        quantity: product.regions[regionName],
                        regions: product.regions
                    });
                }
            });            
            showRegionInfo(regionName, productsInfo, currentProduct, currentProduct ? currentProduct.name : null);
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
// Calculate total farmland size if region exists
// const afir = region ? region.AffordabilityindexbyRegion !== undefined ? region.Population.total : "NA";;

// Get the product quantity for the current region
const quantity = currentProduct && currentProduct.regions[regionName] !== undefined ? currentProduct.regions[regionName] : "NA"; // Default to "NA" if quantity is not available
const productName = currentProduct && currentProduct.name !== undefined ? currentProduct.name: "NA"; // Default to "NA" if quantity is not available



    if (region) {
        // const totalFarmLandSize = region.districts.reduce((sum, district) => sum + parseFloat(district.farmLandSize), 0);
        const tooltipContent = `
            <div class="tip-content">
                <h2>Region Infomation</h2>
                <ul>
                    <li>
                        <mark>Product: </mark>
                            <small>${productName}</small>
                    </li>
                    <li>
                        <mark>Region: </mark>
                            <small>${regionName}</small>
                    </li>
                    <li>
                        <mark>Population: </mark>
                            <small>${population}</small>
                    </li>
                    <li>
                        <mark>Land Available: </mark>
                            <small>${totalFarmLandSize.toFixed(2)}</small>
                    </li>
                    <li>
                        <mark>Quantity Produced: </mark>
                        <small>${quantity}</small>
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
    const majorProduct = ['Palm oil', "maize", "cocoa", "Tilapia", "coffee", "Yam", "coconut", "Avocados", "Mango", "cattle", "sheep", "goat", "Turkey", "rabbit"];
    const buttonContainer = document.querySelector('.button-tab');
    buttonContainer.innerHTML = ''; // Clear existing buttons
    
    // Shuffle major products
    const shuffledMajorProducts = shuffleArray([...majorProduct]).slice(0, 5);

    shuffledMajorProducts.forEach(productName => {
        // Check if the product exists in productData.product
        const product = productData.product.find(p => p.name.toLowerCase() === productName.toLowerCase());
        
        // Create a button regardless of existence, but handle differently if product is not found
        const button = document.createElement('button');
        button.className = "item-button";
        button.textContent = productName;

        // Set the initial background color
        button.style.backgroundColor = '';

        button.addEventListener('click', () => {
            if (product) {
                // Perform activities for existing product
                updateMap(product);

                // Remove 'active' class from all buttons
                const allButtons = buttonContainer.querySelectorAll('.item-button');
                allButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.style.backgroundColor = ''; // Reset background color
                });

                // Add 'active' class to the clicked button
                button.classList.add('active');
                button.style.backgroundColor = product.mapColor; // Set background color to mapColor
            } else {
                // Handle case for non-existing product
                console.log(`Product "${productName}" does not exist in productData.`);
                alert(`The product "${productName}" is not available in the current dataset.`);
            }
        });
        buttonContainer.appendChild(button);
    });
}


// Show the modal dialog
function showModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
}
// Display region information in the modal

async function showRegionInfo(regionName, productsInfo, currentProduct,selectedProductName = null) {
    // add product name to the top
   
    const tabsContainer = document.getElementById('tabs-container');
    const totalImportDisplay = document.getElementById('totalImport');
    const totalExportDisplay = document.getElementById('totalExport');
    const tableContainer = document.getElementById('table-container');
    const totalFSSRDisplay = document.getElementById('totalFSSR');
    const totalProductionDisplay = document.getElementById('totalProduction');
    const productInfo = document.getElementById('productInfo');
    const regionInfoData = document.getElementById('regionInfoData');
    const fssrChartPc = document.getElementById('fssrChartPc');
    const regionInfoContainer = document.getElementById
    ('region-info-container');
    
    // Clear existing content
    tabsContainer.innerHTML = '';
    tableContainer.innerHTML = '';
    regionInfoContainer.innerHTML = '';
    fssrChartPc.innerHTML = '';
    totalImportDisplay.innerHTML = '';
    totalExportDisplay.innerHTML = '';
    totalFSSRDisplay.innerHTML = '';
    totalProductionDisplay.innerHTML = '';
    productInfo.innerHTML = '';
    regionInfoData.innerHTML = '';


    // Calculate growth rate and projection for the current product

    if (currentProduct) {
        console.log(currentProduct)
        const growthRate = calculateGrowthRate(currentProduct.name);
        const projection = projectTo2030(currentProduct.name, growthRate);
        if (projection) {
            // Display the projection in the modal
            const projectionInfo = `
                <h3>Growth Rate and Projection to 2030 for ${projection.product}</h3>
                <ul>
                    <li>Current Import: ${projection.currentImport} KG</li>
                    <li>Projected Import in 2030: ${projection.projectedImport} KG</li>
                    <li>Growth Rate: ${projection.growthRate} %</li>
                </ul>
            `;
            fssrChartPc.innerHTML += projectionInfo;
        }
        
    }


    function projectTo2030(productName, growthRate) {
        const currentData = currentExportImportData.emt.find(item => item.Product.toLowerCase() === productName.toLowerCase());
    
        if (currentData && growthRate !== null) {
            const yearsToProject = 2030 - new Date().getFullYear(); // Calculate years to 2030
            const projectedImport = currentData.Import * Math.pow(1 + (growthRate / 100), yearsToProject);
            return projectedImport;
        }
        return null; // Unable to project
    }
    
    
    // Function to plot the projection chart
    
    
     // Create a dropdown for regions
     const regionDropdown = document.createElement('select');
     productsInfo.forEach(product => {
        if (product.regions && typeof product.regions === 'object') {
            Object.keys(product.regions).forEach(region => {
                if (![...regionDropdown.options].some(option => option.value === region)) {
                    const option = document.createElement('option');
                    option.value = region;
                    option.textContent = region;
                    regionDropdown.appendChild(option);
                }
            });
        }
    });
 
     regionDropdown.value = regionName; // Set the default to the clicked region
 
     // Add event listener to switch region dynamically
     regionDropdown.onchange = () => {
         const selectedRegion = regionDropdown.value;
         const selectedProduct = currentProduct || (selectedProductName ? { name: selectedProductName } : null);
         showRegionInfo(selectedRegion, productsInfo, selectedProduct, selectedProductName);
     };
 
     regionInfoContainer.appendChild(regionDropdown);
 
    // Create a set to hold unique product types
    const productTypes = new Set();
    
    // Populate the product types set
    productsInfo.forEach(product => {
        productTypes.add(product.type);
    });

    
    // Create the "All Products" tab
    const allProductsTab = document.createElement('li');
    allProductsTab.className = 'tab active';
    allProductsTab.textContent = 'All Products';
    tabsContainer.appendChild(allProductsTab);

    // Create tabs for each product type
    productTypes.forEach(type => {
        const typeTab = document.createElement('li');
        typeTab.className = 'tab';
        typeTab.textContent = type;
        tabsContainer.appendChild(typeTab);

        // Add click event to filter products by type
        typeTab.onclick = () => {
            displayProductsByType(type, regionName, productsInfo);
            setActiveTab(typeTab);
        };
    });


    // Add click event for "All Products" tab
    allProductsTab.onclick = () => {
        displayAllProducts(regionName, productsInfo);
        setActiveTab(allProductsTab);
    };
    // Create a dropdown for regions

     // Populate the table based on currentProduct or selectedProductName
    if (currentProduct || selectedProductName) {
        const productToDisplay = currentProduct
            ? currentProduct
            : productsInfo.find(product => product.name === selectedProductName);

        if (productToDisplay) {
            // Display only the current product
            displayProductsByType(productToDisplay.type, regionName, [productToDisplay]);
        } else {
            console.warn("Product not found.");
        }
    } else {
        // Default to displaying all products
        displayAllProducts(regionName, productsInfo);
    }


    //fssr calculation 
    if (currentProduct) {
        const production = Object.values(currentProduct.regions).reduce((a, b) => a + b, 0);
        
        totalProductionPerProduct = production ;

        const totalImport = await getTotalImport(currentProduct.name);
        const totalExport = await getTotalExport(currentProduct.name);
        const fSSR = calculateFSSR(production,totalImport, totalExport);

        const fssrInfo = `<h3>The TABLE below shows the Food Self-Sufficiency Ratio (fSSR) for ${currentProduct.name} in Ghana</h3>`;
        const regionInfo = `<h3>The Table below shows the Region contribution towards ${currentProduct.name} fSSR Ghana</h3>`;
        totalImportDisplay.innerHTML += totalImport.toLocaleString();
        totalExportDisplay.innerHTML += totalExport.toLocaleString();
        totalFSSRDisplay.innerHTML += fSSR.toFixed(2);
        totalProductionDisplay.innerHTML += (production*1000).toLocaleString();
        productInfo.innerHTML += fssrInfo;
        regionInfoData.innerHTML += regionInfo;
    }
    if (currentProduct) {
        plotProjectionChart(currentProduct.name, totalProductionPerProduct);
    } 
    // Show the modal
    showModal();
}
// Project values to a specific year
function projectToYear(productName, growthRate, year) {

    const currentData = totalProductionPerProduct

    if (currentData && growthRate !== null) {
        const yearsToProject = year - new Date().getFullYear();
        const projectedImport = currentData.Import * Math.pow(1 + (growthRate / 100), yearsToProject);
        return {
            product: productName,
            projectedImport: projectedImport.toFixed(2),
            currentImport: currentData.Import,
            growthRate: growthRate.toFixed(2)
        };
    }
    return null; // Unable to project
}

// Function to plot the projection chart
function plotProjectionChart(productName,production) {
    const growthRate = calculateGrowthRate(productName);
    console.log("growth" + growthRate);
    
    const currentData = currentExportImportData.emt.find(item => item.Product.toLowerCase() === productName.toLowerCase());

    if (!currentData || growthRate === null) {
        console.error('Unable to plot chart: Data not found or growth rate is null.');
        return;
    }

    const currentImport = currentData.Import;
    const projectedImport = projectToYear(productName, growthRate, 2030).projectedImport;
    // Destroy the existing chart if it exists
    if (projectionChart) {
        projectionChart.destroy();
        projectionChart = null; // Reset the chart instance
    }
    // Prepare data for the chart
    const labels = ['Current Production', 'Projected Production'];
    const dataIE = [currentImport, projectedImport];
    const dataProduction = [null,production];

    // Create the chart
    const fssrCtx = document.getElementById('fssrChart');


    if (!fssrCtx) {
        console.error('Canvas element with id "fssrChart" not found.');
        return;
    }
    projectionChart = new Chart(fssrCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
    
                type: 'bar', // Second dataset (line chart)
                label: 'Total Production (KG)',
                data: dataProduction, // No line for imports
                borderColor: '#000000',
                backgroundColor: '#0f9b0f',
                borderWidth: 2,
                tension: 0.4, // For smooth curves
                pointRadius: 4,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)'
                },
                {
                    label: 'current',
                    data: dataIE,
                    backgroundColor: ['#642B73'],
                    borderColor: ['#C6426E'],
                    borderWidth: 1
                }
        ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantity Produce for ${productName} (KG)'
                    }
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `FSSR for ${productName}`
                }
            }
        }
    });
}
// Function to calculate FSSR
function calculateFSSR(production, totalImport, totalExport) {
    production *= 1000; 
    if (production + totalImport - totalExport === 0) {
        return 0; // Avoid division by zero
    }
    return (production / (production + totalImport - totalExport))*100;
}

async function getTotalImport(productName) {
    const exportImportData = await fetchExportImportData();
    const importExportData = xexportImport.emt.filter(item => item.Product.toLowerCase() === productName.toLowerCase());
    const totalImport = importExportData.reduce((sum, item) => sum + item.Import, 0);
    // const totalExport = importExportData.reduce((sum, item) => sum + item.Export, 0);

    return totalImport;  
}

async function getTotalExport(productName) {
    const exportImportData = await fetchExportImportData();
    const importExportData = xexportImport.emt.filter(item => item.Product.toLowerCase() === productName.toLowerCase());
    const totalExport = importExportData.reduce((sum, item) => sum + item.Export, 0);

    return totalExport
}

// Function to set the active tab
function setActiveTab(activeTab) {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    activeTab.classList.add('active');
}
// Function to display all products for a specific region

async function displayAllProducts(regionName, productsInfo) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '';

    const regionP = await getRegionPopulation(regionName);

    const table = document.createElement('table');
    table.innerHTML = createHeaderRow();
    
    productsInfo.forEach(product => {
        // console.log(product);
        if (product.regions && typeof product.regions === 'object') {
            // Check if the specific region exists in the product's regions
            const quantity = product.regions[regionName] !== undefined ? product.regions[regionName] : 0;
            let cal = calfoodPerAvailable(regionP,quantity)
            const row = `
            <tbody>
                <tr>
                    <td>${product.name}</td>
                    <td>${product.type}</td>
                    <td>${regionName}</td>
                    <td>${quantity}</td>
                    <td>${cal.toFixed(2)}</td>
                </tr>
            </tbody>`;
            table.appendChild(htmlToElement(row));
            
            rowElement.onclick = () => {
                const fSSR = calculateFSSR(product.name, regionName);
                const totalImport = getTotalImport(product.name);
                const totalExport = getTotalExport(product.name);
                alert(`Product: ${product.name}\nTotal fSSR: ${fSSR.toFixed(2)}\nTotal Import: ${totalImport}\nTotal Export: ${totalExport}`);
            };
            table.appendChild(rowElement);

            // table.appendChild(htmlToElement(row));
        } else {
            console.warn(`Product ${product.name} does not have a valid regions object.`,product.regions);
        }
    });
    tableContainer.appendChild(table);
}
// Function to display products by type
// createHeaderRow();
async function displayProductsByType(productType, regionName, productsInfo, selectedProductName = null) {
    const tableContainer = document.getElementById('table-container');
    tableContainer.innerHTML = '';
    const regionP = await getRegionPopulation(regionName);
   
    const table = document.createElement('table');
    table.innerHTML = createHeaderRow(); // Create the header row
    productsInfo.forEach(product => {
        if (product.type === productType) {
            const quantity = product.regions[regionName] || 0;

            let cal = calfoodPerAvailable(regionP,quantity)
            
            // calfoodPerAvailable(p,quantity);
            const row = `
            <tbody>
                <tr>
                    <td>${product.name}</td>
                    <td>${product.type}</td>
                    <td>${regionName}</td>
                    <td>${quantity}</td>
                    <td>${cal.toFixed(2)}</td>
                </tr>
            </tbody>`;
            table.appendChild(htmlToElement(row));
        }
    });
    tableContainer.appendChild(table);
}

// Function to create the header row for the table
function createHeaderRow() {
    return `
    <table>
        <thead>
        <tr>
            <th>Product Name</th>
            <th>Product Type</th>
            <th>Region</th>
            <th>Quantity (KG)</th>
            <th>Per Capital Food Available (KG) Year</th>
        </tr>
        </thead>`;
}

// Function to get total import and export for a specific product
function getImportExportData(productName) {    
    const exportImportData = fetchExportImportData();
    if (!exportImportData) return { totalImport: 0, totalExport: 0 };

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
    const { totalImport, totalExport } = getImportExportData(currentProduct.name);
    const totalPopulation = getTotalPopulation();

    return ((production + totalImport) - totalExport) / totalPopulation;
}

// Function to calculate total food available per region
function calculateTotalFoodAvailablePerRegion(regionName) {
    const production = currentProduct.regions[regionName] || 0;
    const { totalImport, totalExport } = getImportExportData(currentProduct.name);
    const regionPopulation = getRegionPopulation(regionName);

    return ((production + totalImport) - totalExport) / regionPopulation;
}

// Function to get total population from populationData.json
function getTotalPopulation() {
    const populationData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'populationData.json'), 'utf8'));
    return populationData.reduce((sum, region) => sum + region.Population, 0);
}


// Function to get population for a specific region
async function getRegionPopulation(regionName) {
    try {
        const { geojsonData, regionData } = await loadData();
        const region = regionData.regions.find(r => r.name.toLowerCase() === regionName.toLowerCase());
        console.log(region.Population.total );
        
        return region ? region.Population.total : 0; // Return total population or 0
    } catch (error) {
        console.error("Error fetching region population:", error);
        return 0; // Return 0 in case of an error
    }

}
const calfoodPerAvailable = (regionP, regionF) => {
    if (regionP === 0) {
        console.warn("Population is 0. Cannot divide by zero.");
        return 0; // Return 0 to avoid NaN if population is 0
      }
      return (regionF / regionP) * 1000;
}

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
// food available / region population

function htmlToElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim(); // Trim to remove extra whitespace
    return template.content.firstChild; // Return the first child of the template
}
// Initialize buttons and search functionality on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    createTopButtons(); // Create top buttons for products
    setupSearch(); // Setup search functionality
});

// Initialize the map
initMap();