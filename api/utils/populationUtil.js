const fs = require('fs');
const path = require('path');

// Load population data from JSON file
const populationData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/population.json'), 'utf8')
);

function getPopulationByRegion(regionName) {
    const regionData = populationData.find(item => item.region === regionName);
    return regionData ? regionData.population : 'N/A';
}

module.exports = {
    getPopulationByRegion
};
