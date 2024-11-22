function addData() {
    // Get form values
    const income = parseFloat(document.getElementById("income").value);
    const population = parseFloat(document.getElementById("expenditure").value);
  
    // Send data to the backend for calculation
    fetch('http://localhost:3000/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ income: income, expenditure: expenditure }),
    })
    .then(response => response.json())
    .then(data => {
      const average = data.result;
  
      // Clear form inputs
      document.getElementById("dataForm").reset();
  
      // Create a new data entry element
      const entry = document.createElement("div");
      entry.classList.add("data-entry", "p-2", "border", "rounded", "shadow-sm");
      entry.innerHTML = `
        <strong>Income:</strong> ${income} | 
        <strong>Expenditure:</strong> ${population} | 
        <strong>Food Affordability Index :</strong> ${affordabilty_index_per_region}`;
  
      // Append the new entry to the data display section
      document.getElementById("dataDisplay").appendChild(entry);
    })
    .catch(error => console.error('Error:', error));
  }
  