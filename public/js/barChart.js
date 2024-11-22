    alert('something')
    

    const barChart = new Chart(document.getElementById('barChart'), {
      type: 'bar',
      data: {
        labels: Object.keys(totals),
        datasets: [{
          label: 'Total Production',
          data: Object.values(totals),
          backgroundColor: ['#835238', '#8e4ec7', '#d74f37', '#ffdb6c'],
        }],
      },
      options: {
        responsive: true,
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const clickedIndex = elements[0].index;
            const category = Object.keys(totals)[clickedIndex];
            openModalChart(category);
          }
        },
      },
    });

    // Modal functionality
    const modalBx = document.getElementById('dataModal');
    const closeButton = document.querySelector('.close-button');
    const modalTitle = document.getElementById('modalTitle');
    const modalTabs = document.getElementById('modalTabs');
    const dataTable = document.getElementById('dataTable').querySelector('tbody');

    function openModalChart(category) {
      modalTitle.textContent = category;
      populateTabs(category);
      populateTable(category);
      modalBx.style.display = 'block';
    }

    function closeModal() {
        modalBx.style.display = 'none';
    }

    closeButton.addEventListener('click', closeModal);

    function populateTabs(activeCategory) {
      modalTabs.innerHTML = '';
      Object.keys(barChartData).forEach(category => {
        const tab = document.createElement('li');
        tab.textContent = category;
        tab.classList.add('tab');
        if (category === activeCategory) {
          tab.classList.add('active');
        }
        tab.addEventListener('click', () => {
          document.querySelector('.tab.active').classList.remove('active');
          tab.classList.add('active');
          modalTitle.textContent = category;
          populateTable(category);
        });
        modalTabs.appendChild(tab);
      });
    }

    function populateTable(category) {
      dataTable.innerHTML = '';
      const products = barChartData[category];
      products.forEach(product => {
        Object.entries(product.regions).forEach(([region, quantity]) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${product.name}</td>
            <td>${region}</td>
            <td>${quantity}</td>
          `;
          dataTable.appendChild(row);
        });
      });
    }