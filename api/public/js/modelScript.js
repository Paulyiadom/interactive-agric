// first model script 
alert('first script')
const regionData = {
    "maize": {
        "regions": {
            "Ashanti": ["Kumasi", "Ejisu"],
            "Northern": ["Tamale", "Yendi"]
        },
        "mapColor": "red",
        "percentage": 70
    },
    "cassava": {
        "regions": {
            "Volta": ["Ho", "Kpando"],
            "Eastern": ["Koforidua", "Nkawkaw"]
        },
        "mapColor": "green",
        "percentage": 80
    },
    "cattle": {
        "regions": {
            "Northern": ["Tamale", "Gushegu"],
            "Upper West": ["Wa", "Jirapa"]
        },
        "mapColor": "brown",
        "percentage": 60
    },
    "pepper": {
        "regions": {
            "Greater Accra": ["Accra", "Tema"],
            "Ashanti": ["Kumasi", "Obuasi"]
        },
        "mapColor": "yellow",
        "percentage": 55
    },
    "yam": {
        "regions": {
            "Brong Ahafo": ["Sunyani", "Techiman"],
            "Northern": ["Tamale", "Savelugu"]
        },
        "mapColor": "purple",
        "percentage": 65
    }
}

    // Modal handling
    function openModal(cropOrLivestock) {
        const modal = document.getElementById('modal');
        const regionDetails = document.getElementById('regionDetails');
        const miniMap = document.getElementById('miniMap');
        const cropData = regionData[cropOrLivestock];

        // Populate region details
        regionDetails.innerHTML = '';
        for (const region in cropData.regions) {
            const towns = cropData.regions[region];
            const regionItem = document.createElement('li');
            regionItem.innerHTML = region;

            const townList = document.createElement('ul');
            towns.forEach(town => {
                const townItem = document.createElement('li');
                townItem.innerHTML = town;
                townList.appendChild(townItem);
            });

            regionItem.appendChild(townList);
            regionDetails.appendChild(regionItem);
        }

        // Show the mini map with the highlighted region
        miniMap.style.backgroundColor = cropData.mapColor;

        // Show modal
        modal.style.display = 'block';
    }

    function closeModal() {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
    }

    // Button tab click handler to highlight region on main map
    function highlightRegion(cropOrLivestock) {
        const cropData = regionData[cropOrLivestock];
        // Here you will use Leaflet to highlight the actual region on the main map
        alert(`Highlighting ${cropOrLivestock}: Regions - ${Object.keys(cropData.regions).join(', ')}`);
        // You can also update tooltips or display percentages using cropData.percentage
    }

    // Search bar functionality (mocking search behavior)
    document.getElementById('searchBar').addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        if (regionData[query]) {
            openModal(query);
        }
    });
    