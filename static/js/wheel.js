const ELIGIBLE_CONDITIONS = ["Stroke","Dementia"]
const impact_score_to_color = {"-3":"#0229bf","-2":"#3a80ec","-1":"#89c5fd","0":"#bcf5f9","1":"#bcf5f9","2":"#bcf5f9","3":"#bcf5f9"};
const flareJson = patientFlareData;


class wheel {
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
        this.clicked = this.clicked.bind(this)
    }

    computeDataHierarchy(){
        const hierarchy = d3.hierarchy(this.data)
            .count()  // Gives each leaf an equal weight
            .sort((a, b) => b.height - a.height); // Sort by depth for consistent rendering
    
        const root = d3.partition()
            .size([2 * Math.PI, hierarchy.height + 1]) // Keep radial and depth layout
            (hierarchy);
    
        root.each(d => d.current = d);
        return root;
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

    color(impact_score){
        return impact_score_to_color[impact_score]
    }

    opacity(pathData){
        return 0.4
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
        const path = svg.append("g")
        .selectAll("path")
        .data(this.root.descendants().slice(1))
        .join("path")
            .attr("fill", d => {
                if(d.data.value != null && d.data.value == ""){
                    return "#ffffff"
                }
                
                return d.data.impact_score != null ? this.color(d.data.impact_score) : this.color(d3.min(d.descendants(), node => node.data.impact_score ?? 0))
            })
            .attr("fill-opacity", d => this.opacity(d.data))
            .attr("stroke","grey")
            .attr("stroke-width","1px")
            .attr("pointer-events", d => this.arcVisible(d.current) ? "auto" : "none")
            .attr("d", d => arc(d.current));

        // Make them clickable if they have children.
        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", this.clicked);

        const format = d3.format(",d");
        path.append("title")
            .text(d => {
                let text = `${d.data.name}`;
                if(d.data.value){
                    text += `\n${format(d.data.value)}`
                    if (d.data.min !== -1) {
                        text += `\nData Range: ${format(d.data.min)} Until ${format(d.data.max)}`;
                    }
                    text += `\nIs Abnormal: ${d.data.impact_score < 0 ? "true" : "false"}`    
                }
                return text;
            });

        const label = svg.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
        .selectAll("text")
        .data(this.root.descendants().slice(1))
        .join("text")
            .attr("dy", "0.35em")
            .attr("fill",d => {
                if(d.data.value == ""){
                    return "grey"
                } else {
                    return "black"
                }
            })
            .attr("font-size","9px")
            .attr("fill-opacity", d => +this.labelVisible(d.current))
            .attr("transform", d => this.labelTransform(d.current))
            .text(d => d.data.name);

        const parent = svg.append("circle")
            .datum(this.root)
            .attr("r", this.radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", this.clicked);
        var elem = document.getElementById("svg");
        elem.appendChild(svg.node());
    }

    // Handle zoom on click.
    clicked(event, p) {
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
            .attr("fill-opacity", d => this.opacity(d.data))
            .attr("pointer-events", d => this.arcVisible(d.target) ? "auto" : "none") 

            .attrTween("d", d => () => arc(d.current));

        label.filter(function(d) {
            return +this.getAttribute("fill-opacity") || this.labelVisible(d.target);
            }).transition(t)
            .attr("fill-opacity", d => +this.labelVisible(d.target))
            .attrTween("transform", d => () => this.labelTransform(d.current));
    }

    getPathsForHover(event,d) {
        return d.data.related_conditions?.includes(event.target.id) ||  d.descendants().some(descendant => descendant.data.related_conditions?.includes(event.target.id))
    }

    onConditionMouseOver(event) {
            d3.select("svg").selectAll("path")
            .filter(d => this.getPathsForHover(event,d))
            .attr("stroke", "yellow")
            .attr("stroke-width", "6px");

            d3.select("svg").selectAll("path")
            .filter(d => !this.getPathsForHover(event,d))
            .style("fill","grey").style("fill-opacity","0.4");
      }

    onConditionOut(event) {
        d3.select("svg").remove();
        this.generateSvg();
    }
}

const wheelVar = new wheel(flareJson);
var conditionsContainer = document.getElementById("conditions")
for(let condition of ELIGIBLE_CONDITIONS){
    const button = document.createElement('button')
    button.textContent = condition
    button.className = "condition"
    button.id = condition
    button.addEventListener("click", wheelVar.onConditionMouseOver);
    button.addEventListener("mouseover", wheelVar.onConditionMouseOver);
    button.addEventListener("mouseout", wheelVar.onConditionOut);
    conditionsContainer.appendChild(button);
}