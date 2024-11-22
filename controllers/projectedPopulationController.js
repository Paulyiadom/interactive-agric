const baseData = {
    year: 2022,
    population: 31548148
};

const growthRate = 0.023;

function calculateProjections() {
    const projections = [];
    let currentYear = baseData.year;
    let currentPopulation = baseData.population;

    while (currentYear <= 2030) {
        projections.push({
            year: currentYear,
            population: Math.round(currentPopulation)
        });

        currentPopulation *= (1 + growthRate);
        currentYear++;
    }

    return projections;
}
module.exports = {
    baseData, calculateProjections
}