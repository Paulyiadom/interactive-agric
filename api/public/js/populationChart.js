 const populationData = JSON.parse('<%- JSON.stringify(populationData) %>');
const ctx = document.getElementById('populationChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: populationData.map(item => item.Regions),
                datasets: [
                    {
                        label: 'Male',
                        data: populationData.map(item => item.Male),
                        borderColor: 'blue',
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: 'Female',
                        data: populationData.map(item => item.Female),
                        borderColor: 'pink',
                        fill: false,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Population Distribution by Gender Across Regions'
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Population'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Regions'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });