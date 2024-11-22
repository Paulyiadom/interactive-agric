alert('with mini map')
const map = L.map('map', { 
    center: [7.9465, -1.0232],
    zoom: 7
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// GeoJSON data (replace with actual file path if needed)
const geoJsonUrl = '/data/ghana.geojson';

// Load and display the main map with regions
fetch(geoJsonUrl)
    .then(response => response.json())
    .then(geoData => {
        L.geoJson(geoData).addTo(map);
    });

// Handle search and display the modal with a mini map
document.getElementById('search-btn').addEventListener('click', () => {
    const searchTerm = document.getElementById('search').value.toLowerCase();

    // Search logic here (you can use populationData or region data to match the term)
    // Show modal box with mini-map and region info
    document.getElementById('modal').style.display = 'block';
    const miniMap = L.map('mini-map', {
        center: [7.9465, -1.0232],
        zoom: 7
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(miniMap);

    // Add GeoJSON to mini map, highlight regions
    fetch(geoJsonUrl)
        .then(response => response.json())
        .then(geoData => {
            L.geoJson(geoData, {
                style: (feature) => {
                    if (searchTerm.includes(feature.properties.name.toLowerCase())) {
                        return { color: 'red' };
                    }
                    return { color: '#3388ff' };
                }
            }).addTo(miniMap);
        });
});

// Close the modal when clicking outside (optional)
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
};
