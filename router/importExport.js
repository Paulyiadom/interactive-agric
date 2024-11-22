const filePath = require('../data/exportImport.json');
const stock = require("../data/stock.json");

// Calculate totals from region.json data
const importExport = {
    totalImport: filePath.emt.reduce((sum, item) => sum + item.Import, 0),
     totalExport: filePath.emt.reduce((sum, item) => sum + item.Export, 0)
};

const totalStock = () => {
    return stock.reduce((sum, item) => sum + item.TotalFoodReserve, 0);
}

module.exports = {
    importExport,
    totalStock
};