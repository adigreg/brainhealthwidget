const flareJson = {"name": "flare","children": []}
function translateToDiagramJson() {
  setOneChildren = []
  for(const setOne in jsonResponse){
    setTwoChildren = []
    for(const setTwo in jsonResponse[setOne]){
      setThreeChildren = []
      for(const setThree in jsonResponse[setOne][setTwo]){
        setThreeChildren.push({"name": setThree,"value": jsonResponse[setOne][setTwo][setThree]["score"]})
      }
      setTwoChildren.push({"name": setTwo, "children": setThreeChildren})
    }
    flareJson["children"].push({"name":setOne, "children": setTwoChildren})
  }
}
translateToDiagramJson()

function createZoomableSunburst(data){
    // Specify the chart’s dimensions.
    const width = 928;
    const height = width;
    const radius = width / 8;

    // Create the color scale.
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    // Compute the layout.
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value) // Assigns a value to each node in the hierarchy, sum of all of the children's nodes
        .sort((a, b) => b.value - a.value); // sorts nodes based on their values in descending order
    // Used to compute the coordinates of each node in a hierarchical layout
    // 2*pi represents total angle of partition (360)
    // Hierarchy.height + 1 gives the radial size of layout
    const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])
    (hierarchy);
    root.each(d => d.current = d); // Storing the current node 

    // Create the arc generator. This is used to generate the svg path data for each segment of the sunburst chart
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
    return d.y1 <= 4 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d) {
    return d.y1 <= 4 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    document.body.appendChild(svg.node());
};
const conditions_to_fields = {"Epilepsy":["Enrichment","blood pressure","SES"]}
function onConditionClick(event) {
  d3.select("svg").selectAll("path").filter(d => {
    return conditions_to_fields[event.target.id].includes(d.data.name) ||
      d.descendants().some(descendant => conditions_to_fields[event.target.id].includes(descendant.data.name));
  }).style("stroke","green").style("stroke-weight","10px").raise()
}
function onConditionOut(event) {
  d3.select("svg").selectAll("path").filter(d => {
    return conditions_to_fields[event.target.id].includes(d.data.name) ||
    d.descendants().some(descendant => conditions_to_fields[event.target.id].includes(descendant.data.name));
  }).style("stroke","none")

}
createZoomableSunburst(flareJson);
var inputs = document.getElementsByClassName("condition");
for(var i = 0; i < inputs.length; i++){
    inputs[i].addEventListener("mouseover", onConditionClick);
    inputs[i].addEventListener("mouseout", onConditionOut);
}