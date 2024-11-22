const populationData = require('../data/populationData.json');
const regionData = require('../data/region.json');


// Calculate totals from region.json data
const regionTotals = {
    totalPopulation: regionData.regions.reduce((sum, region) => sum + region.Population.total, 0),
    totalMale: regionData.regions.reduce((sum, region) => sum + region.Population.Male, 0),
    totalFemale: regionData.regions.reduce((sum, region) => sum + region.Population.Female, 0)
};




// Calculate total population
const totalPopulation = populationData.reduce((acc, curr) => acc + curr.Population, 0);

module.exports = {
    regionTotals,
    populationData,
    totalPopulation
};