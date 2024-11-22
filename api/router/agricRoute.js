const express = require('express');
const route = express();
const fs = require('fs')
const path = require('path')

const {importExport,totalStock} = require("./importExport.js")
// loading Data 
const regions = require('../data/region.json')
const regionData = require('../data/region.json')
const {populationData,totalPopulation,regionTotals} = require('./populationData')
const {baseData, calculateProjections} = require('../controllers/projectedPopulationController')
// Load JSON data

route.use('/data', express.static('data'));




const getProductData = () => {
  const productFiles = ['livestock.json', 'acquaculture.json', 'arablecrop.json', 'treecrop.json'];
  const products = [];
  

  productFiles.forEach(file => {
      const filePath = path.join(__dirname, "..",'data', file);

      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath));
        // Assuming each JSON file has a structure like { product: [...] }
        if (Array.isArray(data.product)) {
            products.push(...data.product);
        } else {
            console.error(`Data in ${file} is not an array.`);
        }
    } else {
        console.error(`File not found: ${filePath}`);
    }

  });

  return { product: products };
};



// Function to get import and export data
const getImportExportData = () => {
  const filePath = path.join(__dirname,'..', 'data', 'exportImport.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const totalImport = data.emt.reduce((sum, item) => sum + item.Import, 0);
  const totalExport = data.emt.reduce((sum, item) => sum + item.Export, 0);
  
  return { totalImport, totalExport };
};

// Function to get total agriculture production
const getTotalAgricultureProduction = () => {
  const productFiles = ['livestock.json', 'acquaculture.json', 'arablecrop.json', 'treecrop.json'];
  let totalProductionValue = 0;

  productFiles.forEach(file => {
      const filePath = path.join(__dirname, '..','data', file);
      if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        data.product.forEach(product => {
            // Sum the values for each region in the product
            Object.values(product.regions).forEach(value => {
                totalProductionValue += value; // Add the value to the total
            });
        });
      } else {
          console.error(`File not found: ${filePath}`);
      }
  });
  const convertKG = totalProductionValue * 1000;  
  return convertKG;
};

const barchart = getProductData().product.reduce((acc, product) => {
  if (!acc[product.type]) acc[product.type] = [];
  acc[product.type].push(product);
  return acc;
}, {});



// perCapitalAvailabity = production + import + stock - export / population
const perCapitalFoodAvailabity = ()=>{
  const { totalImport, totalExport } = getImportExportData();
  const production = getTotalAgricultureProduction();
  const stock = totalStock();

  return ((production + totalImport ) - totalExport)/totalPopulation; 

}

// Route to serve stockfile data

route.get('/', async (req, res) => {
  const projectedData = calculateProjections();
  const  productData = getProductData();
  
  const { totalImport, totalExport } = getImportExportData();
  const totalAgricultureProduction = getTotalAgricultureProduction();
  let SSRNote ='';
  const totals = calculateTotalByFile();
  // Calculate SSR
  const SSR = (totalAgricultureProduction / (totalAgricultureProduction + totalImport - totalExport)) *100;
  if (SSR === 100) {
    SSRNote = "The ratio is equal to 100: The country is self-sufficient";
  } else if (SSR > 100) {
      SSRNote = "The ratio is greater than 100: The country is self-sufficient and exports";
  } else if (SSR < 100) {
      SSRNote = "The ratio is less than 100: The country is not self-sufficient and imports";
  }

  let pCFAvailabity = perCapitalFoodAvailabity();
  res.render('index', {
      totals,
      barChartData: JSON.stringify(barchart),
      totalImport,
      totalExport,
      totalAgricultureProduction,
      pCFAvailabity,
      SSR,
      SSRNote,
      baseData,
      projectedData,
      populationData,totalPopulation, regionTotals,
      regions, productData: JSON.stringify(productData) 
    });
})


// Route to serve exportImport data
route.get('/export-import', (req, res) => {
  const exportImportData = require(path.join(__dirname, '../data/exportImport.json'));
  res.json(exportImportData);
});
// Route to serve /base-production data
route.get('/base-production', (req, res) => {
  const exportImportData = require(path.join(__dirname, '../data/productFromFAO.json'));
  res.json(exportImportData);
});
route.get('/exportImport2021', (req, res) => {
  const exportImportData = require(path.join(__dirname, '../data/exportImport2021.json'));
  res.json(exportImportData);
});

route.get('/welcome', (req, res) => {

  // Read the HTML file
  res.sendFile(path.join(__dirname, '../welcome/index.html'));
});
route.get('/calculate', (req, res) => {

  // Read the HTML file
  res.sendFile(path.join(__dirname, '../welcome/mdas.html'));
});

route.post('/calculate', (req, res) => {
  const { income, expenditure } = req.body;
  if (expenditure === 0) {
    return res.json({ result: "Expenditure cannot be zero" });
  }
  const affordabilty_index_per_region = (income / expenditure)*100;
  res.json({ result: affordabilty_index_per_region });
});
route.post('/project', (req, res) => {
  
  const { baseYear, basePopulation, projectionYear } = req.body;
  const growthRate = 0.023; // Adjust as needed

  const years = projectionYear - baseYear;
  const projectedPopulation = basePopulation * Math.pow(1 + growthRate, years);

  // Calculate male and female ratios from the region data
  const totalPopulation = regionData.regions.reduce((sum, region) => sum + region.Population.total, 0);
  const totalMale = regionData.regions.reduce((sum, region) => sum + region.Population.Male, 0);
  const totalFemale = regionData.regions.reduce((sum, region) => sum + region.Population.Female, 0);

  const maleRatio = totalMale / totalPopulation;
  const femaleRatio = totalFemale / totalPopulation;

  const projectedMale = projectedPopulation * maleRatio;
  const projectedFemale = projectedPopulation * femaleRatio;

  res.json({
      baseYear,
      basePopulation,
      projectionYear,
      projectedPopulation: Math.round(projectedPopulation),
      projectedMale: Math.round(projectedMale),
      projectedFemale: Math.round(projectedFemale)
  });
})
// Define the endpoint to get product data

route.get('/products', (req, res) => {
  const productFiles = ['livestock.json', 'acquaculture.json', 'arablecrop.json', 'treecrop.json'];
  const allProducts = [];
  const productTypes = {};

  // Initialize productTypes
  productFiles.forEach(file => {
      productTypes[file.replace('.json', '')] = []; // Create empty arrays for each product type
  });
  // Read each product file and populate allProducts and productTypes
  productFiles.forEach(file => {
      const filePath = path.join(__dirname, '..', 'data', file)
      try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          data.product.forEach(product => {
              allProducts.push(product);
              productTypes[file.replace('.json', '')].push(product); // Use file name as type
          });
      } catch (err) {
          console.error(`Error reading file ${file}:`, err);
      }
  });
x

  // Send the combined product data as a JSON response

  res.json({ allProducts, productTypes });

});

// Route to get import/export data
route.get('/export-import', (req, res) => {
  const exportImportPath = path.join(__dirname, '..', 'data', 'exportImport.json');
  fs.readFile(exportImportPath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error reading export/import data');
      }
      res.header("Content-Type", "application/json");
      res.send(data);
  });
});
route.get('/exportimportCurrent', (req, res) => {
  const exportImportPath = path.join(__dirname, '..', 'data', 'exportImport2021.json');
  fs.readFile(exportImportPath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error reading export/import data');
      }
      res.header("Content-Type", "application/json");
      res.send(data);
  });
});

// Route to get population data
route.get('/population-data', (req, res) => {
  const populationDataPath = path.join(__dirname, '..', 'data', 'populationData.json');
  fs.readFile(populationDataPath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error reading population data');
      }
      res.header("Content-Type", "application/json");
      res.send(data);
  });
});


// Function to calculate the total production for each file
const calculateTotalByFile = () => {
  const productFiles = ['livestock.json', 'acquaculture.json', 'arablecrop.json', 'treecrop.json'];
  const totals = {};

  productFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', 'data', file);

    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const totalSum = data.product.reduce((sum, product) => {
        const regionSum = Object.values(product.regions).reduce((regionTotal, value) => regionTotal + value, 0);
        return sum + regionSum;
      }, 0);
      totals[file.replace('.json', '')] = totalSum; // Use the file name without .json
    } else {
      console.error(`File not found: ${filePath}`);
    }
  });

  return totals;
};


// Render the EJS file with the totals
route.get('/chart', (req, res) => {
  
});

module.exports = route;

