 // Fetch data from JSON files
 async function fetchData() {
    try {
        const productResponse = await fetch('/data/products.json');
        products = await productResponse.json();

        const importExportResponse = await fetch('/data/exportImport.json');
        importExportData = await importExportResponse.json();

        const populationResponse = await fetch('/data/populationData.json');
        populationData = await populationResponse.json();

        initializeMap(); // Initialize the map after product data is loaded
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

  fetchData(); // Fetch data and initialize the map
    


/*
async function showRegionInfo(regionName, productsInfo) {
    console.log(productsInfo, regionName);

    const tabsContainer = document.getElementById('tabs-container'); // Ensure this ID matches your HTML
    const tableContainer = document.getElementById('table-container'); // Ensure this ID matches your HTML
    const regionInfoContainer = document.getElementById('region-info-container'); // Ensure this ID matches your HTML


    // Clear existing content

    tabsContainer.innerHTML = '';
    tableContainer.innerHTML = '';
    regionInfoContainer.innerHTML = '';

    // Populate tabs
    let allProducts = [];
    let productTypes = {
        'Livestock': [],
        'Acquaculture': [],
        'Arable Crop': [],
        'Tree Crop': []
    };

    // Load product data from JSON files
    try {
        const response = await fetch('/products'); // Fetch from the API endpoint
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        let data = await response.json();
        allProducts = data.allProducts;
        productTypes = data.productTypes;
    } catch (error) {
        console.error('Error fetching product data:', error);
        return; // Exit the function if there's an error
    }



    // Create tabs
    // Create a tab for "All Products"
    const allProductsTab = document.createElement('div');
    allProductsTab.className = 'tab active';
    allProductsTab.textContent = 'All Products';
    allProductsTab.addEventListener('click', () => populateTable(allProducts, regionName));
    tabsContainer.appendChild(allProductsTab);

    Object.keys(productTypes).forEach(type => {
        const typeTab = document.createElement('div');
        typeTab.className = 'tab';
        typeTab.textContent = type;
        typeTab.addEventListener('click', () => populateTable(productTypes[type], regionName));
        tabsContainer.appendChild(typeTab);

        // Create sub-tabs for extra types
        productTypes[type].forEach(product => {
            if (product.extra) {
                const subTab = document.createElement('div');
                subTab.className = 'sub-tab';
                subTab.textContent = product.extra;
                subTab.addEventListener('click', () => populateTable([product], regionName));
                tabsContainer.appendChild(subTab);
            }
        });
    });

    // Populate the table when a tab is clicked
    function populateTable(products, regionName) {
        tableContainer.innerHTML = ''; // Clear existing table

        const headerRow = `
            <tr>
                <th>ALL PRODUCT</th>
                <th>REGION</th>
                <th>Quantity (KG)</th>
                <th>GROWTH RATE</th>
            </tr>`;
        tableContainer.innerHTML = headerRow;

        // Create dropdown for regions
        const regionSelect = document.createElement('select');
        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;
            const filteredProducts = products.filter(product => product.regions[selectedRegion]);
            filteredProducts.forEach(product => {
                const row = `
                    <tr>
                        <td>${product.name}</td>
                        <td>${selectedRegion}</td>
                        <td>${product.regions[selectedRegion]}</td>
                        <td>${calculateGrowthRate(product, selectedRegion)}</td>
                    </tr>`;
                tableContainer.innerHTML += row;
            });
        });

        // Populate region dropdown
        const regions = Object.keys(products[0].regions); // Assuming all products have the same regions
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            regionSelect.appendChild(option);
        });
        tableContainer.appendChild(regionSelect);
    }

    // Calculate fSSR
    const fSSR = calculateFSSR(regionName);
    regionInfoContainer.innerHTML = `
                <h3>Food Self Sufficiency Ratio (fSSR): ${fSSR.toFixed(2)}</h3>
        <div>Total Food Available: ${calculateTotalFoodAvailable(regionName).toFixed(2)}</div>
        <div>Total Food Available per Region: ${calculateTotalFoodAvailablePerRegion(regionName).toFixed(2)}</div>
    `;

    // Show the modal
    showModal();
}
*/
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
// Now call showRegionInfo with the region name and product information
showRegionInfo(regionName, productsInfo, currentProduct, currentProduct ? currentProduct.name : null);



const chart = new Chart(agricCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(totals), // Product types
      datasets: [{
        label: 'Total Production',
        data: Object.values(totals), // Total values
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

let fixed the populatedtabs .
when user click on the barChart
i want you to make the category the user clicked active tab 
when the modal is open
additionally add  "All Product" tap when user click on it ,it will display all the product 
so the end the tab will look like this 

All Product  --- onclick display all product productData on the table
Acqua Culture --- onclick display all category in acquaculture on the table
Arable Crop --- onclick display all category in  Arablecrop on the table
Livestock --- clicked Active tab .  displayed all category in Livestockon the table
Tree Crop --- onclick  display all category in . Treecrop

dynamically without user close tab to click on another bar

  function populateTabs(activeCategory) {
    modalTabs.innerHTML = '';
    Object.keys(productData).forEach(category => {
      const tab = document.createElement('li');
      tab.textContent = category;
      tab.classList.add('tab');
      if (category === activeCategory) {
        tab.classList.add('active');
      }
      tab.addEventListener('click', () => {
        document.querySelector('.tab.active').classList.remove('active');
        tab.classList.add('active');
        modalTitle.textContent = category;
        populateTable(category);
      });
      modalTabs.appendChild(tab);
    });
  }