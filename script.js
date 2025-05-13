document.addEventListener('DOMContentLoaded', function () {
  renderPieChart();
  renderTreeMap();

  // Re-render treemap on window resize
  window.addEventListener('resize', debounce(() => {
    document.getElementById('treeMapContainer').innerHTML = '';
    renderTreeMap();
  }, 300));
});

function renderPieChart() {
  const ctx = document.getElementById('fadoPieChart').getContext('2d');
  const data = [193669, 111283, 57960, 10605];

  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Abuse of Authority', 'Force', 'Discourtesy', 'Offensive Language'],
      datasets: [{
        data: data,
        backgroundColor: [
          'rgba(255, 206, 0, 1)',
          'rgba(255, 206, 0, 0.8)',
          'rgba(255, 206, 0, 0.6)',
          'rgba(255, 206, 0, 0.4)',
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        labels: {
          render: 'percentage',
          fontColor: '#000',
          precision: 2
        },
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 20,
            padding: 10
          }
        },
        title: {
          display: true,
          text: 'Civilian Allegations by FADO Type*',
          font: {
            size: 18,
            weight: 'bold'
          },
          color: '#000'
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#000',
          bodyColor: '#fff',
          borderColor: '#fff',
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
    { name: "Physical Force|and Violence", value: 83412 },
    { name: "Searches|and Seizures", value: 38993 },
    { name: "Interactions|and Communications", value: 37558 },
    { name: "Arrest and|Detainment", value: 33869 },
    { name: "Discrimination|and Bias", value: 7876 },
    { name: "Misc.|", value: 8056 },
  ];

  const totalValue = data.reduce((acc, item) => acc + item.value, 0);
  data.forEach(item => {
    const percentage = Math.round((item.value / totalValue) * 100);
    item.name += `|${percentage}%`;
  });

  const container = document.getElementById('treeMapContainer');
  const width = container.clientWidth;
  const height = 500;
  const margin = { top: 40, right: 10, bottom: 20, left: 10 };

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svg.append("text")
    .attr("x", width / 2 - margin.left)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .text("Civilian Allegations by Category");

  const root = d3.hierarchy({ children: data }).sum(d => d.value);
  d3.treemap()
    .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
    .padding(2)(root);

  const colorScale = d3.scaleOrdinal()
    .domain(data.map(d => d.name)) is
    .range([
      'rgba(255,154,0,1)', 'rgba(255,154,0,0.9)',
      'rgba(255,154,0,0.8)', 'rgba(255,154,0,0.7)',
      'rgba(255,154,0,0.6)', 'rgba(255,154,0,0.5)'
    ]);

  const nodes = svg.selectAll("g.cell")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "cell")
    .attr("transform", d => `translate(${d.x0},${d.y0})`);

  nodes.each(function(d) {
    const g = d3.select(this);
    const rectWidth = d.x1 - d.x0;
    const rectHeight = d.y1 - d.y0;
    const lines = d.data.name.split("|");
    const lineHeight = 14;
    const totalTextHeight = lines.length * lineHeight;
    const startY = (rectHeight - totalTextHeight) / 2 + lineHeight;

    g.append("text")
        .attr("x", rectWidth / 2)
        .attr("y", startY)
        .attr("text-anchor", "middle")
        .attr("fill", "#000")
        .style("font-size", "12px")
        .selectAll("tspan")
        .data(lines)
        .enter()
        .append("tspan")
        .attr("x", rectWidth / 2)
        .attr("dy", (_, i) => i === 0 ? 0 : lineHeight)
        .text(line => line);
    
});
  
  nodes.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .style("stroke", "#fff")
    .style("fill", d => colorScale(d.data.name.split("|")[0]));

  nodes.append("text")
    .attr("x", d => (d.x1 - d.x0) / 2)
    .attr("y", d => (d.y1 - d.y0) / 2 - 10)
    .attr("text-anchor", "middle")
    .attr("fill", "#000")
    .style("font-size", "12px")
    .selectAll("tspan")
    .data(d => d.data.name.split("|"))
    .enter()
    .append("tspan")
    .attr("x", d => 0)
    .attr("dy", (d, i) => `${i * 14}px`)
    .attr("text-anchor", "middle")
    .text(d => d);

// Utility function: debounce
function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}
