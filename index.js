"use strict";
(function () {
    let data = ""
    let svgContainer = ""

    // Color
    const colors = {

        "Bug": "#4E79A7",

        "Dark": "#A0CBE8",

        "Electric": "#F28E2B",

        "Fairy": "#FFBE7D",

        "Fighting": "#59A14F",

        "Fire": "#8CD17D",

        "Ghost": "#B6992D",

        "Grass": "#499894",

        "Ground": "#86BCB6",

        "Ice": "#FABFD2",

        "Normal": "#E15759",

        "Poison": "#FF9D9A",

        "Psychic": "#79706E",

        "Steel": "#BAB0AC",

        "Water": "#D37295"

    }


    // Dimensions for svg
    const measurements = {
        width: 1220,
        height: 600,
        marginAll: 50,
        padding: 100
    }


    // Loading data and appending svg to body
    svgContainer = d3.select('body').append("svg")
        .attr('width', measurements.width)
        .attr('height', measurements.height);
    d3.csv("pokemon.csv")
        .then((csvData) => data = csvData)
        .then(() => makeScatterPlot())


    // Making scatter plot
    function makeScatterPlot() {

        // Creating x and y coordinates
        let spDef = data.map((row) => parseInt(row["Sp. Def"]))
        let total = data.map((row) => parseFloat(row["Total"]))

        const limits = findMinMax(spDef, total)

        let scaleX = d3.scaleLinear()
            .domain([limits.sdmin - 13, limits.sdmax + 20])
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll])

        let scaleY = d3.scaleLinear()
            .domain([limits.totalMax + 50, limits.totalMin - 50])
            .range([0 + measurements.marginAll, measurements.height - measurements.marginAll])

        // Creating x and y axes' labels
        svgContainer.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (measurements.padding / 5) + "," + (measurements.height / 2) + ")rotate(-90)")
            .style('font-size', '10pt')
            .style('font-weight', 'bolder')
            .text("Total");

        svgContainer.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (measurements.width / 2) + "," + (measurements.height - (measurements.padding / 8)) + ")")
            .style('font-size', '10pt')
            .style('font-weight', 'bolder')
            .text("Sp. Def");


        // Users interation
        filterData()

        let newData = data
        let dropdown, userSelect
        let gen, len;

        d3.select('#lenFilter').on("change", function(d) {
            // Getting user's inputs
            dropdown = document.getElementById("len-dropdown");
            userSelect = dropdown.options[dropdown.selectedIndex].value;
            
            // Filtering data
            if (userSelect != 'All') {
                newData = data.filter(function(d) {
                    return d['Legendary'] == userSelect
                });
            } else {
                newData = data
            }

            // Delete old plot
            d3.selectAll("svg > *").remove();

            // Update new plot
            drawAxes(scaleX, scaleY)
            plotData(newData, scaleX, scaleY)
        });

        d3.select('#genFilter').on("change", function(d) {
            // Getting user's inputs
            dropdown = document.getElementById("gen-dropdown");
            userSelect = dropdown.options[dropdown.selectedIndex].value;

            // Filtering data
            if (userSelect != 'All') {
                newData = data.filter(function(d) {
                    return d['Generation'] == userSelect
                });
            } else {
                newData = data
            }

            // Delete old plot
            d3.selectAll("svg > *").remove();

            // Update new plot
            drawAxes(scaleX, scaleY)
            plotData(newData, scaleX, scaleY)
        });

        // Creating 1st scatter plot
        drawAxes(scaleX, scaleY)
        plotData(newData, scaleX, scaleY)

    }


    // Helper function for makeScatterPlot()
    function findMinMax(spDef, total) {
        return {
            sdmin: d3.min(spDef),
            sdmax: d3.max(spDef),
            totalMin: d3.min(total),
            totalMax: d3.max(total)
        }
    }


    // Helper function for makeScatterPlot(): Drawing x and y axes
    function drawAxes(scaleX, scaleY) {
        let xAxis = d3.axisBottom()
            .scale(scaleX)
            .ticks(20);

        let yAxis = d3.axisLeft()
            .scale(scaleY)

        // Appending x and y axes to svgContainer
        svgContainer.append('g')
            .attr('transform', 'translate(0, 550)')
            .call(xAxis)

        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)

    }


    // Helper function for makeScatterPlot(): Filtering data
    function filterData() {
        const generations = ['All', 1, 2, 3, 4, 5, 6];
        const legendary = ['All', 'True', 'False'];

        d3.select('#lenFilter')
            .append('select')
            .attr('id', 'len-dropdown')
            .selectAll('option')
            .data(legendary)
            .enter()
            .append('option')
            .attr('id', 'len-option')
            .attr("value", function (d) { return d; })
            .html(function (d) { return d })
  
        d3.select('#genFilter')
            .append('select')
            .attr('id', 'gen-dropdown')
            .selectAll('option')
            .data(generations)
            .enter()
            .append('option')
            .attr('id', 'gen-option')
            .attr('value', function (d) { return d })
            .html(function (d) { return d }) 
    }

    function updateData(len, gen) {
        newData.filter(function(d) {
            return d.Legendary == len && d.Generation == gen
        });
    }

    
    let firstArray = []


    // Helper function for makeScatterPlot(): Making a plot
    function plotData(newData, scaleX, scaleY) {
        const xMap = function (d) { return scaleX(+d["Sp. Def"]) }
        const yMap = function (d) { return scaleY(+d["Total"]) }
        const type1Color = function (d) { return colors[d["Type 1"]] }
        const type1 = function (d) {
            if (!firstArray.includes(d["Type 1"])) {
                firstArray.push(d["Type 1"])
            }
            
            return d["Type 1"]
        }



        // Making tooltips
        let div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("background", "#e4edf8")
            .style("color", "#154360")
            .style('font-size', '10pt')
            .style("text-align", "center")
            .style("padding", "10px")
            .style('box-shadow', "0 0 5px #999999")
            .style("position", "absolute")

        // Ploting data and pop-up tooltips
        const circles = svgContainer.selectAll(".circle")
            .data(newData)
            .enter()
            .append('circle')
            .attr('cx', xMap)
            .attr('cy', yMap)
            .attr('r', 9)
            .attr('fill', type1Color)
            .style("cursor", "pointer")
            .style("opacity", .9)

            // Adding tooltip pop-up
            .on("mouseover", (d) => {
                div.transition()
                    .duration(200)
                    .style("opacity", .9)
                div.html(d["Name"] + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 25) + "px")
            })
            .on("mouseout", (d) => {
                div.transition()
                    .duration(500)
                    .style("opacity", 0)
                    .style("cursor", "default");
            });


        // Making legend of plot
        var legend = svgContainer.selectAll(".legend")
            .data(newData)
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) { return "translate(5," + (i + .6) * 20 + ")"; });

        // Drawing legend rectangles
        legend.append("rect")
            .attr("x", measurements.width - 80)
            .attr("width", 12)
            .attr("height", 12)
            .style("fill", type1Color)
            .style("opacity", .9);

        // Drawing legend text
        legend.append("text")
            .attr("x", measurements.width - 55)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(type1)

    }

})()