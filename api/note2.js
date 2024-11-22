i want to calculate for the growthrate and the project the product to 2030 per createTopButtons, so when a crop or a product is search and it exit in both the base product and currentProduct you
calculate for it growthrate and project it to 2030 and show the result on a graph
this a sample of the files to use 
for the base product 
{
    "base":[
        {
            "Year": 2016,
            "Production": "Avocados",
            "Value": 8949.59
        },
        {
            "Year": 2016,
            "Production": "Bananas",
            "Value": 87505
        },
        {
            "Year": 2016,
            "Production": "Beans",
            "Value": 167940.95
        }
    ]
}

current product 
{
    "product":[
     {
      "name": "Maize",
      "type": "Arable Crop",
        "regions" : {
            "Western": 10126,
            "Central": 77425,
            "Greater Accra": 13929,
            "Volta": 123504,
            "Eastern": 122565,
            "Ashanti": 125560,
            "Western North": 10106,
            "Ahafo": 17535,
            "Bono": 31563,
            "Bono East": 61360,
            "Oti": 50631,
            "Northern": 130809,
            "Savannah": 38737,
            "North East": 58247,
            "Upper East": 111317,
            "Upper West": 75467
        },
        "mapColor": "#d74f37",
        "facilities": 0,
        "note":0
     },
     {
        "name": "Cassava",
        "type": "Arable Crop",
        "regions" : {
            "Western": 48075,
            "Central": 114915,
            "Greater Accra": 12198,
            "Volta": 79296,
            "Eastern": 120416,
            "Ashanti": 151000,
            "Western North": 37310,
            "Ahafo": 21650,
            "Bono": 32626,
            "Bono East": 26110,
            "Oti": 46108,
            "Northern": 32223,
            "Savannah": 8979,
            "North East": 163,
            "Upper East": 55,
            "Upper West": 1565
        },
        "mapColor": "#16c82e",
        "facilities": 0,
        "note":0
    }
]
}

take the current product to be 2017, on the currentproduct  sum the total regions 

plot the result on the graph
