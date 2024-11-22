const fs = require('fs');
const path = require('path');


/// Define paths to all JSON files
const jsonFiles = [
    { name: 'Fish Produced', path: path.join(__dirname, '../data/fishProduced.json'), targetColumn: 'Quantity Produced' },
    { name: 'Arable Crop', path: path.join(__dirname, '../data/arableCrop.json'), targetColumn: 'Quantity of Arable Crop' },
    { name: "Population", path: path.join(__dirname, '../data/population.json'), targetColumn: "Population" },
    { name: 'Live Stock', path: path.join(__dirname, '../data/liveStock.json'), targetColumn: 'Quantity Produced' },
    { name: 'Tree Crop', path: path.join(__dirname, '../data/treeCrop.json'), targetColumn: 'Quantity Produced' },
    { name: 'Net Import', path: path.join(__dirname, '../data/netImport.json'), targetColumn: ['Import Value', 'Export Value'] },
    { name: 'Food Item', path: path.join(__dirname, '../data/foodItem.json'), targetColumn: ['production', 'Import Value', 'Export Value'] },
    { name: 'Export Quantity', path: path.join(__dirname, '../data/exportQuantityData.json'), targetColumn: 'EmtValue' },
    { name: 'Import Quantity', path: path.join(__dirname, '../data/importQuantityData.json'), targetColumn: 'ImtValue' }
];

// Function to read JSON file and get data
const getJsonData = (filePath) => {
    try {
        const rawData = fs.readFileSync(filePath);
        return JSON.parse(rawData);
    } catch (error) {
        console.error(`Error reading or parsing JSON file at ${filePath}:`, error.message);
        return null; // Return null or an empty array to signify an error
    }
};

const sumColumn = (data, targetColumn) => {
    let totalSum = 0;

    for (const item of data) {
        if (item[targetColumn] && !isNaN(item[targetColumn])) {
            totalSum += parseFloat(item[targetColumn]);
        }
    }
    return totalSum;
};

// Variables to store total sums for specific columns from different files
let totalFishProduced = 0;
let totalLiveStock = 0;
let totalArableCrop = 0;
let totalPopulation = 0;
let totalTreeCrop = 0;
let totalImportValue = 0;
let totalExportValue = 0;
let ImtValue = 0;
let EmtValue = 0;

// Extract data from the JSON files
const processJsonFiles = async () => {
    let totals = {};
    let note = "";

    for (const file of jsonFiles) {
        const data = getJsonData(file.path);
        if (!data) {
            // Skip processing this file if there was an error reading it
            continue;
        }

        if (Array.isArray(file.targetColumn)) {
            // Handle multiple target columns
            let importValue = sumColumn(data, file.targetColumn[0]);
            let exportValue = sumColumn(data, file.targetColumn[1]);

            totalImportValue += importValue;
            totalExportValue += exportValue;
        } else {
            // Handle single target column
            const totalSum = sumColumn(data, file.targetColumn);
            totals[file.name] = totalSum;

            // Add to the relevant total based on the file name
            if (file.name.includes('Fish Produced')) {
                totalFishProduced = totalSum;
            } else if (file.name.includes('Live Stock')) {
                totalLiveStock = totalSum;
            } else if (file.name.includes('Tree Crop')) {
                totalTreeCrop = totalSum;
            } else if (file.name.includes('Arable Crop')) {
                totalArableCrop = totalSum;
            } else if (file.name.includes('Population')) {
                totalPopulation = totalSum;
            } else if (file.name.includes('Import Quantity')) {
                ImtValue = totalSum;
            } else if (file.name.includes('Export Quantity')) {
                EmtValue = totalSum;
            }
        }
    }

    // AGRIC PRODUCTION
    const AP = totalArableCrop + totalTreeCrop + totalLiveStock + totalFishProduced;
    // total agriculture production
    // let TAP = totalFishProduced + totalLiveStock + totalTreeCrop + totalArableCrop;

    // total domestic consumption

    // total domestic consumption
    let TFD = (AP + ImtValue) - EmtValue;
    const SSR = TFD > 0 ? (AP / TFD) * 100 : 0; // Prevent division by zero

    // Add note based on SSR total
    if (SSR === 100) {
        note = "The ratio is equal to 100: The country is self-sufficient";
    } else if (SSR > 100) {
        note = "The ratio is greater than 100: The country is self-sufficient and exports";
    } else if (SSR < 100) {
        note = "The ratio is less than 100: The country is not self-sufficient and imports more";
    }

    totals.tap = AP;
    totals.tfd = TFD;
    totals.note = note;
    totals.ssrNote = SSR; // total SSR

    // fssr calculate the individual row (if needed)
    const TAPi = 0; // Placeholder for total production; you can replace this with actual logic if needed
    const dTapi = 0; // Placeholder for (TAPi + import) - Export 
    const fssr = dTapi > 0 ? (TAPi / dTapi) * 100 : 0; // Prevent division by zero

    // Optionally include fssr in the totals object
    totals.fssr = fssr;

    return totals;
};

// Export the processJsonFiles function
module.exports = {
    processJsonFiles
};