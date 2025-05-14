document.addEventListener('DOMContentLoaded', function () {
    renderPieChart();
    renderTreeMap();
});

function renderPieChart() {
    const ctx = document.getElementById('fadoPieChart').getContext('2d');
    const data = [193669, 111283, 57960, 10605];
    const total = data.reduce((acc, value) => acc + value, 0);
    const fadoPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Abuse of Authority', 'Force', 'Discourtesy', 'Offensive Language'],
            datasets: [{
                data: data,
                backgroundColor: [
                    'rgba(255,206,0, 1)',
                    'rgba(255,206,0, 0.8)',
                    'rgba(255,206,0, 0.6)',
                    'rgba(255,206,0, 0.4)',
                ],
                borderColor: ['rgba(255, 255, 255, 1)'],
                borderWidth: 3
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            animation: {
                animateScale: true,
                animateRotate: true
            },
            plugins: {
                labels: {
                    render: 'percentage',
                    fontColor: '#000',
                    precision: 2
                },
                legend: {
                    onClick: (e) => e.stopPropagation(),
                    position: 'bottom',
                    labels: {
                        boxWidth: 20,
                        padding: 10,
                        align: 'center'
                    }
                },
                title: {
                    display: true,
                    text: 'Civilian Allegations by FADO Type*',
                    font: {
                        size: 18,
                        weight: 'bold',
                        color: '#000'
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 1)',
                    bodyFont: { size: 14 },
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1,
                    cornerRadius: 4,
                    displayColors: false
                }
            }
        }
    });
}

function renderTreeMap() {
    const data = [
        {"name": "Physical Force|and Violence", "value": 83412},
        {"name": "Searches|and Seizures", "value": 38993},
        {"name": "Interactions|and Communications", "value": 37558},
        {"name": "Arrest and|Detainment", "value": 33869},
        {"name": "Discrimination|and Bias", "value": 7876},
        {"name": "Misc.|", "value": 8056},
    ];

    const totalValue = data.reduce((acc, item) => acc + item.value, 0);
    data.forEach(item => {
        const percentage = Math.round((item.value / totalValue) * 100);
        item.name += `|${percentage}%`;
    });

    const margin = {top: 50, right: 10, bottom: 20, left: 10},
          width = document.getElementById('treeMapContainer').clientWidth - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom;

    const svg = d3.select("#treeMapContainer").append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                  .attr("transform", `translate(${margin.left}, ${margin.top})`);

    svg.append("text")
       .attr("x", width / 2)
       .attr("y", -15)
       .attr("text-anchor", "middle")
       .style("font-size", "18px")
       .style("font-weight", "bold")
       .text("Civilian Allegations by Category");

    const root = d3.hierarchy({children: data}).sum(d => d.value);
    d3.treemap()
      .size([width, height])
      .padding(2)
      .tile(d3.treemapSquarify.ratio(1))
      (root);

    const colorScale = d3.scaleOrdinal()
                         .domain(data.map(d => d.name))
                         .range(["rgba(255,154,0, 1)", "rgba(255,154,0, 0.9)", "rgba(255,154,0, 0.8)", "rgba(255,154,0, 0.7)", "rgba(255,154,0, 0.6)", "rgba(255,154,0, 0.5)"]);

    svg.selectAll("g.cell")
       .data(root.leaves())
       .enter()
       .append("g")
       .attr("class", "cell")
       .attr('transform', d => `translate(${d.x0},${d.y0})`)
       .each(function(d) {
           const g = d3.select(this);
           g.append("rect")
            .attr('width', d.x1 - d.x0)
            .attr('height', d.y1 - d.y0)
            .style("stroke", "white")
            .style("fill", colorScale(d.data.name.split("|")[0]));

           const lines = d.data.name.split("|");
           const lineHeight = 20;
           const yCenter = (d.y1 - d.y0) / 2;

           g.append("text")
             .attr("x", (d.x1 - d.x0) / 2)
             .attr("y", yCenter - (lines.length * lineHeight) / 2 + lineHeight / 2)
             .attr("text-anchor", "middle")
             .attr("fill", "black")
             .style("font-size", "14px")
             .selectAll("tspan")
             .data(lines)
             .enter()
             .append("tspan")
             .attr("x", (d.x1 - d.x0) / 2)
             .attr("dy", (d, i) => `${i * lineHeight}px`)
             .text(d => d);
       });
}
