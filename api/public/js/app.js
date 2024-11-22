var map = L.map('map').setView([7.946527, -1.023194], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
  subdomains: ['a', 'b', 'c']
}).addTo(map);

// Add Ghana boundaries
var ghanaBoundaries = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [-3.216667, 4.733333],
            [-3.216667, 11.183333],
            [11.083333, 11.183333],
            [11.083333, 4.733333],
            [-3.216667, 4.733333]
          ]
        ]
      }
    }
  ]
};

L.geoJSON(ghanaBoundaries).addTo(map);

map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
  
    getRegionData(lat, lng).then(regionData => {
      if (regionData) {
        displayModal(regionData); // Display the modal with the region data
      } else {
        alert('No region found for this location.');
      }
    }).catch(error => {
      console.error('Error fetching region data:', error);
    });
  });



  function getRegionData(lat, lng) {
    // Fetch the region data from the JSON file
    return fetch('data/region.json') // Adjust the path as necessary
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON data
      })
      .then(regionData => {
        console.log(regionData.regions[0].name);
        
        // Find the region that corresponds to the clicked location
        let clickedRegion = null;
  
        regionData.regions.forEach(region => {
            if (region.name === regionName) { // Check if the region name matches
              clickedRegion = region;
            }
          });
  
        return clickedRegion; // Return the found region or null
      })
      .catch(error => {
        console.error('Error fetching region data:', error);
        return null; // Return null on error
      });
  }
  function displayModal(regionData) {
    // Create the modal elements
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const modalDialog = document.createElement('div');
    modalDialog.className = 'modal-dialog';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h5');
    modalTitle.className = 'modal-title';
    modalTitle.innerText = regionData.name;
    
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function() {
      document.body.removeChild(modal); // Close the modal
    };
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);
    
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row';
    
    const colDiv = document.createElement('div');
    colDiv.className = 'col-md-4';
    
    const navTabs = document.createElement('ul');
    navTabs.className = 'nav nav-tabs';
    
    const townsTab = document.createElement('li');
    townsTab.className = 'active';
    townsTab.innerHTML = '<a href="#towns" data-toggle="tab">Towns</a>';
    
    const cropsTab = document.createElement('li');
    cropsTab.innerHTML = '<a href="#crops" data-toggle="tab">Crops</a>';
    
    navTabs.appendChild(townsTab);
    navTabs.appendChild(cropsTab);
    
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    
    const townsPane = document.createElement('div');
    townsPane.className = 'tab-pane active';
    townsPane.id = 'towns';
    
    const table = document.createElement('table');
    table.className = 'table table-striped';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Town Name</th><th>Crop Grown</th><th>Farm Land Size</th><th>Crop Production</th>';
    thead.appendChild(headerRow);
    
    const tbody = document.createElement('tbody');
    
    // Loop through the towns and add them to the table
    regionData.towns.forEach(town => {
      const row = document.createElement('tr');
      row.innerHTML = `<td>${town.name}</td><td>${town.cropsGrown}</td><td>${town.farmLandSize}</td><td>${town.cropProduction}</td>`;
      tbody.appendChild(row);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    townsPane.appendChild(table);
    
    const cropsPane = document.createElement('div');
    cropsPane.className = 'tab-pane';
    cropsPane.id = 'crops';
    cropsPane.innerHTML = '<p>Crops data will go here</p>';
    
    tabContent.appendChild(townsPane);
    tabContent.appendChild(cropsPane);
    
    colDiv.appendChild(navTabs);
    colDiv.appendChild(tabContent);
    
    rowDiv.appendChild(colDiv);
    modalBody.appendChild(rowDiv);
    
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalDialog.appendChild(modalContent);
    modal.appendChild(modalDialog);
    
    // Append the modal to the body  // Append the modal to the body
  document.body.appendChild(modal);

  // Show the modal by adding a class to display it
  modal.style.display = 'block';

  // Optional: Add a backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade show';
  document.body.appendChild(backdrop);
  
  // Close the modal when clicking outside of it
  modal.onclick = function(event) {
    if (event.target === modal) {
      document.body.removeChild(modal);
      document.body.removeChild(backdrop);
    }
  };
}