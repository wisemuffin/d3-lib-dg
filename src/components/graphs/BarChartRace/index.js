import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "d3-selection-multi";
import _ from "lodash";
import "./index.css";

import { haloHighlight, halo } from "../../../utility/d3";

/*
code taken from https://observablehq.com/@johnburnmurdoch/bar-chart-race-the-most-populous-cities-in-the-world
then refactored to react
then made more reusable
*/

/* Required Data Structure
[
    {"date": 2019, "value": 100, "name": "dave", "group": "India", "subgroup": "India"}
]

groups can be asigned a colour scheme for the bars e.g. content or state
*/

const BarChartRace = ({
  data,
  width,
  dateGrain,
  top_n,
  startDate,
  endDate
}) => {
  const ref = useRef(null);
  const [start, setStart] = useState(false);

  let dimensions = {
    width: width,
    height: 600,
    margin: {
      top: 80,
      right: 5,
      bottom: 5,
      left: 5
    }
  };

  const tickDuration = 250;

  let barPadding =
    (dimensions.height - (dimensions.margin.bottom + dimensions.margin.top)) /
    (top_n * 5);

  useEffect(() => {
    if (!dimensions) return;
    if (!data) return;

    // 1. prep data
    console.log("barchartrace data: ", data);

    let dataset = data;

    let date = startDate;

    let dateSlice = dataset
      .filter(d => d.date === date && !isNaN(d.value))
      .sort((a, b) => b.value - a.value)
      .slice(0, top_n);

    dateSlice.forEach((d, i) => (d.rank = i));

    // 2. Create chart dimensions

    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    // 3. Draw canvas
    const wrapper = d3
      .select(ref.current)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);
    const bounds = wrapper
      .select(".bounds")
      .style(
        "transform",
        `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
      );

    // 4. Create scales

    let x = d3
      .scaleLinear()
      .domain([0, d3.max(dateSlice, d => d.value)])
      .range([
        dimensions.margin.left,
        dimensions.width - dimensions.margin.right - 65
      ]);

    let y = d3
      .scaleLinear()
      .domain([top_n, 0])
      .range([
        dimensions.height - dimensions.margin.bottom,
        dimensions.margin.top
      ]);

    // draw axis
    let groups = dataset.map(d => d.group);
    groups = [...new Set(groups)];

    let colourScale = d3
      .scaleOrdinal()
      .range([
        "#adb0ff",
        "#ffb3ff",
        "#90d595",
        "#e48381",
        "#aafbff",
        "#f7bb5f",
        "#eafb50"
      ])
      .domain(dataset.map(d => d.group));
    // .domain(groups);

    let xAxis = d3
      .axisTop()
      .scale(x)
      .ticks(dimensions.width > 500 ? 5 : 2)
      .tickSize(
        -(dimensions.height - dimensions.margin.top - dimensions.margin.bottom)
      )
      .tickFormat(d => d3.format(",")(d));

    bounds
      .select(".x-axis")
      .attr("transform", `translate(0, ${dimensions.margin.top})`)
      .call(xAxis)
      .selectAll(".tick line")
      .classed("origin", d => d == 0);

    // draw chart
    bounds
      .selectAll("rect.bar")
      .data(dateSlice, d => d.name)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", x(0) + 1)
      .attr("width", d => x(d.value) - x(0) - 1)
      .attr("y", d => y(d.rank) + 5)
      .attr("height", y(1) - y(0) - barPadding)
      .style("fill", d => colourScale(d.group));

    bounds
      .selectAll("text.label")
      .data(dateSlice, d => d.name)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr(
        "transform",
        d =>
          `translate(${x(d.value) - 5}, ${y(d.rank) +
            5 +
            (y(1) - y(0)) / 2 -
            8})`
      )
      .attr("text-anchor", "end")
      .selectAll("tspan")
      .data(d => [
        { text: d.name, opacity: 1, weight: 600 },
        { text: d.subGroup, opacity: 1, weight: 400 }
      ])
      .enter()
      .append("tspan")
      .attr("x", 0)
      .attr("dy", (d, i) => i * 16)
      .style("fill", d => (d.weight == 400 ? "#444444" : ""))
      .style("font-weight", d => d.weight)
      .style("font-size", d => (d.weight == 400 ? "12px" : ""))
      .html(d => d.text);

    bounds
      .selectAll("text.valueLabel")
      .data(dateSlice, d => d.name)
      .enter()
      .append("text")
      .attr("class", "valueLabel")
      .attr("x", d => x(d.value) + 5)
      .attr("y", d => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1)
      .text(d => d3.format(",")(d.lastValue));

    // draw peripherals

    let title = wrapper
      .select(".title")
      .attr("y", 24)
      .html("The most populous cities in the world from 1500 to 2018");
    haloHighlight(title, 250, 2, 1, "#000000");

    let subTitle = wrapper
      .select(".subTitle")
      .attr("y", 55)
      .html("Population (thousands)");
    haloHighlight(subTitle, 1750, 1, 1, "#777777");

    let credit = bounds
      .append("text")
      .attrs({
        class: "caption",
        x: dimensions.width,
        y: dimensions.height - 28
      })
      .styles({
        "text-anchor": "end"
      })
      .html("Graphic: @jburnmurdoch")
      .call(halo, 10);

    let sources = bounds
      .append("text")
      .attrs({
        class: "caption",
        x: dimensions.width,
        y: dimensions.height - 6
      })
      .styles({
        "text-anchor": "end"
      })
      .html(
        "Sources: Reba, M. L., F. Reitsma, and K. C. Seto. 2018; Demographia"
      )
      .call(halo, 10);

    let dateIntro = bounds
      .append("text")
      .attrs({
        class: "dateIntro",
        x: dimensions.width - 225,
        y: dimensions.height - 195
      })
      .styles({
        "text-anchor": "end"
      })
      .html(`${_.startCase(_.toLower(dateGrain))}: `);

    haloHighlight(dateIntro, 3000, 3, 1, "#cccccc");

    let dateText = bounds
      .append("text")
      .attrs({
        class: "dateText",
        x: dimensions.width - 225,
        y: dimensions.height - 195
      })
      // .styles({
      //   'text-anchor': 'end'
      // })
      .html(~~date);

    dateText.call(halo, 10);

    haloHighlight(dateText, 3000, 8, 1, "#cccccc");

    // interactivity

    d3.timeout(_ => {
      bounds
        .selectAll(".dateIntro")
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .styles({
          opacity: 0
        });

      let ticker = d3.interval(e => {
        dateSlice = dataset
          .filter(d => d.date == date && !isNaN(d.value))
          .sort((a, b) => b.value - a.value)
          .slice(0, top_n);

        dateSlice.forEach((d, i) => (d.rank = i));

        x.domain([0, d3.max(dateSlice, d => d.value)]);

        bounds
          .select(".xAxis")
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .call(xAxis);

        let bars = bounds.selectAll(".bar").data(dateSlice, d => d.name);

        bars
          .enter()
          .append("rect")
          .attrs({
            class: d => `bar ${d.name.replace(/\s/g, "_")}`,
            x: x(0) + 1,
            width: d => x(d.value) - x(0) - 1,
            y: d => y(top_n + 1) + 5,
            height: y(1) - y(0) - barPadding
          })
          .styles({
            fill: d => colourScale(d.group)
            // fill: d => d.colour
          })
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attrs({
            y: d => y(d.rank) + 5
          });

        bars
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attrs({
            width: d => x(d.value) - x(0) - 1,
            y: d => y(d.rank) + 5
          });

        bars
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attrs({
            width: d => x(d.value) - x(0) - 1,
            y: d => y(top_n + 1) + 5
          })
          .remove();

        let labels = bounds.selectAll(".label").data(dateSlice, d => d.name);

        labels
          .enter()
          .append("text")
          .attrs({
            class: "label",
            transform: d =>
              `translate(${x(d.value) - 5}, ${y(top_n + 1) +
                5 +
                (y(1) - y(0)) / 2 -
                8})`,
            "text-anchor": "end"
          })
          .html("")
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attrs({
            transform: d =>
              `translate(${x(d.value) - 5}, ${y(d.rank) +
                5 +
                (y(1) - y(0)) / 2 -
                8})`
          });

        let tspans = labels.selectAll("tspan").data(d => [
          { text: d.name, opacity: 1, weight: 600 },
          { text: d.subGroup, opacity: 1, weight: 400 }
        ]);

        tspans
          .enter()
          .append("tspan")
          .html(d => d.text)
          .attrs({
            x: 0,
            dy: (d, i) => i * 16
          })
          .styles({
            // opacity: d => d.opacity,
            fill: d => (d.weight == 400 ? "#444444" : ""),
            "font-weight": d => d.weight,
            "font-size": d => (d.weight == 400 ? "12px" : "")
          });

        tspans
          .html(d => d.text)
          .attrs({
            x: 0,
            dy: (d, i) => i * 16
          })
          .styles({
            // opacity: d => d.opacity,
            fill: d => (d.weight == 400 ? "#444444" : ""),
            "font-weight": d => d.weight,
            "font-size": d => (d.weight == 400 ? "12px" : "")
          });

        tspans.exit().remove();

        labels
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attrs({
            transform: d =>
              `translate(${x(d.value) - 5}, ${y(d.rank) +
                5 +
                (y(1) - y(0)) / 2 -
                8})`
          });

        labels
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attrs({
            transform: d => `translate(${x(d.value) - 8}, ${y(top_n + 1) + 5})`
          })
          .remove();

        let valueLabels = bounds
          .selectAll(".valueLabel")
          .data(dateSlice, d => d.name);

        valueLabels
          .enter()
          .append("text")
          .attrs({
            class: "valueLabel",
            x: d => x(d.value) + 5,
            y: d => y(top_n + 1) + 5
          })
          .text(d => d3.format(",.0f")(d.lastValue))
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attrs({
            y: d => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1
          });

        valueLabels
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attrs({
            x: d => x(d.value) + 5,
            y: d => y(d.rank) + 5 + (y(1) - y(0)) / 2 + 1
          })
          .tween("text", function(d) {
            let i = d3.interpolateRound(d.lastValue, d.value);
            return function(t) {
              this.textContent = d3.format(",")(i(t));
            };
          });

        valueLabels
          .exit()
          .transition()
          .duration(tickDuration)
          .ease(d3.easeLinear)
          .attrs({
            x: d => x(d.value) + 5,
            y: d => y(top_n + 1) + 5
          })
          .remove();

        dateText.html(~~date);

        if (date == endDate) ticker.stop();
        date = date + 1;
      }, tickDuration);
    }, 6000);
  }, [
    barPadding,
    data,
    dateGrain,
    dimensions,
    dimensions.boundedHeight,
    dimensions.boundedWidth,
    dimensions.height,
    dimensions.margin.bottom,
    dimensions.margin.left,
    dimensions.margin.top,
    dimensions.width,
    endDate,
    startDate,
    top_n,
    width
  ]);

  return (
    <div style={{ position: "relative" }}>
      <div id="tooltip" className="tooltip">
        <div className="tooltip-range">
          Humidity: <span id="range"></span>
        </div>
        <div className="tooltip-value">
          <span id="count"></span> days
        </div>
      </div>
      <svg ref={ref} className="wrapper">
        <text className="title" />
        <text className="subTitle" />
        <g className="bounds">
          <g className="bins" />
          <g className="x-axis">
            <text className="x-axis-label" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default BarChartRace;
