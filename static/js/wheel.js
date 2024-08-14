var theData = {
    "name": "flare",
    "children": [
    {
      "name": "Behavior",
      "children": [
        {
          "name": "Substances",
          "children": [
            {"name": "Illicits",
            "value": 3812 },
            {"name": "EtOH",
            "value": 3812 },
            {"name": "Smoking",
            "value": 3812 }
          ]
        },
        {
          "name": "Enrichment",
          "children": [
            {"name": "School",
            "value": 3812 },
            {"name": "Mental Activity",
            "value": 3812 }
          ]
        },
        {
          "name": "Sleep",
          "children": [
            {"name": "PRO",
            "value": 3812 }
          ]
        },
        {
          "name": "Nutrition",
          "children": [
            {"name": "Diet Score",
            "value": 3812 }
          ]
        },
        {
          "name": "Activity",
          "children": [
            {"name": "Physical Activity",
            "value": 3812 }
          ]
        }
      ]
    },
    {
      "name": "Body",
      "children": [
        {
          "name": "BMI",
          "children": [
            {"name": "BMI",
            "value": 3812 }
          ]
        },
        {
          "name": "A1C",
          "children": [
            {"name": "A1C",
            "value": 3812 }
          ]
        },
        {
          "name": "Lipids",
          "children": [
            {"name": "Lipids",
            "value": 3812 }
          ]
        },
        {
          "name": "Blood Pressure",
          "children": [
            {"name": "Blood Pressure",
            "value": 3812 }
          ]
        }
      ]
    },
    {
      "name": "Genetics",
      "children": [
        {
          "name": "Gene1",
          "children": [
            {"name": "Neuroinflammation",
            "value": 3812 }
          ]
        },
        {
          "name": "Gene2",
          "children": [
            {"name": "Headache/Migrane",
            "value": 3812 }
          ]
        },
        {
          "name": "Gene3",
          "children": [
            {"name": "AD",
            "value": 3812 }
          ]
        },
        {
          "name": "Gene4",
          "children": [
            {"name": "Blank",
            "value": 3812 }
          ]
        }
      ]
    },
    {
      "name": "Environment",
      "children": [
        {
          "name": "SES",
          "children": [
            {"name": "Income",
            "value": 3812 }
          ]
        },
        {
          "name": "Race/Ethnicity",
          "children": [
            {"name": "Race/Ethnicity",
            "value": 3812 }
          ]
        },
        {
          "name": "Trauma",
          "children": [
            {"name": "Trauma Score",
            "value": 3812 }
          ]
        },
        {
          "name": "Safety",
          "children": [
            {"name": "Crime Score",
            "value": 3812 }
          ]
        },
        {
          "name": "Air",
          "children": [
            {"name": "AQ Score",
            "value": 3812 }
          ]
        },
        {
          "name": "Walk",
          "children": [
            {"name": "Walk Score",
            "value": 3812 }
          ]
        }
      ]
    }
    ]
  };
function createZoomableSunburst(data){
    // Specify the chart’s dimensions.
    const width = 928;
    const height = width;
    const radius = width / 6;

    // Create the color scale.
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    // Compute the layout.
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])
    (hierarchy);
    root.each(d => d.current = d);

    // Create the arc generator.
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("viewBox", [-width / 2, -height / 2, width, width])
        .style("font", "10px sans-serif");

    // Append the arcs.
    const path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")

        .attr("d", d => arc(d.current));

    // Make them clickable if they have children.
    path.filter(d => d.children)
        .style("cursor", "pointer")
        .on("click", clicked);

    const format = d3.format(",d");
    path.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

    const label = svg.append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);

    const parent = svg.append("circle")
        .datum(root)
        .attr("r", radius)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("click", clicked);

    // Handle zoom on click.
    function clicked(event, p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
    });

    const t = svg.transition().duration(750);

    // Transition the data on all arcs, even the ones that aren’t visible,
    // so that if this transition is interrupted, entering arcs will start
    // the next transition from the desired position.
    path.transition(t)
        .tween("data", d => {
            const i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
        })
        .filter(function(d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
        })
        .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 

        .attrTween("d", d => () => arc(d.current));

    label.filter(function(d) {
        return +this.getAttribute("fill-opacity") || labelVisible(d.target);
        }).transition(t)
        .attr("fill-opacity", d => +labelVisible(d.target))
        .attrTween("transform", d => () => labelTransform(d.current));
    }

    function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
    document.body.appendChild(svg.node());
};
createZoomableSunburst(theData);