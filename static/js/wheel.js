import { getSeverity } from "./brainhealthscores.js"

const flareJson = {"name": "flare","children": []}
function translateToDiagramJson() {
  for(const setOne in jsonResponse){
    let setTwoChildren = []
    let maxSetTwoSeverity = 0
    for(const setTwo in jsonResponse[setOne]){
      let setThreeChildren = []
      let maxSetThreeSeverity = 0
      for(const setThree in jsonResponse[setOne][setTwo]){
        let severity = getSeverity(setThree,jsonResponse[setOne][setTwo][setThree]["raw_value"])
        maxSetThreeSeverity = Math.max(maxSetThreeSeverity,severity)
        setThreeChildren.push({"name": setThree,"size": jsonResponse[setOne][setTwo][setThree]["raw_value"],"value": 1,"severity": getSeverity(setThree,jsonResponse[setOne][setTwo][setThree]["raw_value"])})
      }
      setTwoChildren.push({"name": setTwo, "children": setThreeChildren, "severity": maxSetThreeSeverity})
      maxSetTwoSeverity = Math.max(maxSetTwoSeverity,maxSetThreeSeverity)
    }
    flareJson["children"].push({"name":setOne, "children": setTwoChildren, "severity": maxSetTwoSeverity})
  }
}
translateToDiagramJson()


class wheel {
    static conditions_to_fields = {"Epilepsy":["a1c","Smoking","Neuroinflammation"],"Depression":["hearing","lipids","PRO"]}
    constructor(data){
        this.data = data;
        this.width = 900;
        this.height = this.width;
        this.radius = this.width / 8
        this.root = this.computeDataHierarchy();
        this.generateSvg();
        this.generateSvg = this.generateSvg.bind(this)
        this.onConditionOut = this.onConditionOut.bind(this)
        this.onConditionMouseOver = this.onConditionMouseOver.bind(this)
        this.onConditionClick = this.onConditionClick.bind(this)
        this.computeDataHierarchyCond = this.computeDataHierarchyCond.bind(this)
    }

    computeDataHierarchy(){
        const hierarchy = d3.hierarchy(this.data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);
        const root = d3.partition()
        .size([2 * Math.PI, hierarchy.height + 1])
        (hierarchy);
        root.each(d => d.current = d);
        return root
    }

    computeDataHierarchyCond(condition){
        const newRoot = this.root.descendants().filter(d => d.depth > 0 && wheel.conditions_to_fields[condition].includes(d.data.name))
        this.root = newRoot
    }

    arcVisible(d) {
        return d.y1 <= 4 && d.y0 >= 1 && d.x1 > d.x0;
    }
    
    labelVisible(d) {
        return d.y1 <= 4 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }
    
    labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * this.radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    color(pathData){
        let score = pathData.severity
        if(score == 0){
            return "#cccccc"
        } else if (score <= 0.2){
            return "#accbff"
        } else if (score <= 0.4){
            return "#92bbff"
        } else {
            return "#4188ff"
        }
    }

    generateSvg(){
        const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(this.radius * 1.5)
        .innerRadius(d => d.y0 * this.radius)
        .outerRadius(d => Math.max(d.y0 * this.radius, d.y1 * this.radius - 1))
            // Create the SVG container.
        const svg = d3.create("svg")
        .attr("viewBox", [-this.width / 2, -this.height / 2, this.width, this.width])
        .style("font", "10px sans-serif");

        // Append the arcs.
        // const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, this.data.children.length + 1));
        console.log("new root ",this.root)
        const path = svg.append("g")
        .selectAll("path")
        .data(this.root.descendants().slice(1))
        .join("path")
            .attr("fill", d => { while (d.depth > 1) d = d.parent; return this.color(d.data); })
            .attr("fill-opacity", d => d.data.severity)
            .attr("stroke","grey")
            .attr("stroke-width","1px")
            .attr("pointer-events", d => this.arcVisible(d.current) ? "auto" : "none")
            .attr("d", d => arc(d.current));

        // Make them clickable if they have children.
        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);

        const format = d3.format(",d");
        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.data.size)}`);

        const label = svg.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
        .selectAll("text")
        .data(this.root.descendants().slice(1))
        .join("text")
            .attr("dy", "0.35em")
            .attr("fill","black")
            .attr("font-size","9px")
            .attr("fill-opacity", d => +this.labelVisible(d.current))
            .attr("transform", d => this.labelTransform(d.current))
            .text(d => d.data.name);

        const parent = svg.append("circle")
            .datum(this.root)
            .attr("r", this.radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", clicked);

        // Handle zoom on click.
        function clicked(event, p) {
        parent.datum(p.parent || this.root);

        this.root.each(d => d.target = {
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
            return +this.getAttribute("fill-opacity") || this.arcVisible(d.target);
            })
            .attr("fill-opacity", d => d.data.severity)
            .attr("pointer-events", d => this.arcVisible(d.target) ? "auto" : "none") 

            .attrTween("d", d => () => arc(d.current));

        label.filter(function(d) {
            return +this.getAttribute("fill-opacity") || this.labelVisible(d.target);
            }).transition(t)
            .attr("fill-opacity", d => +this.labelVisible(d.target))
            .attrTween("transform", d => () => this.labelTransform(d.current));
        }
        var elem = document.getElementById("svg");
        elem.appendChild(svg.node());
    }

    getPathsForHover(d) {
        return wheel.conditions_to_fields[event.target.id].includes(d.data.name) ||
        d.descendants().some(descendant => wheel.conditions_to_fields[event.target.id].includes(descendant.data.name))
    }

    onConditionMouseOver(event) {
            // d3.select("svg").selectAll("path")
            // .filter(d => this.getPathsForHover(d))
            // .attr("stroke", "grey")
            // .attr("stroke-width", "8px");

            d3.select("svg").selectAll("path")
            .filter(d => !this.getPathsForHover(d))
            .style("fill","white").style("fill-opacity","0.4");
      }

    onConditionOut(event) {
        d3.select("svg").remove();
        this.generateSvg();
    }

    onConditionClick(event) {
    }
}

const wheelVar = new wheel(flareJson);
var inputs = document.getElementsByClassName("condition");
for(var i = 0; i < inputs.length; i++){
    inputs[i].addEventListener("click", wheelVar.onConditionClick);
    inputs[i].addEventListener("mouseover", wheelVar.onConditionMouseOver);
    inputs[i].addEventListener("mouseout", wheelVar.onConditionOut);
}