import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import "./index.css";

const Histogram = ({ data, width, metricAccessor, yAccessor }) => {
  const ref = useRef(null);

  let dimensions = {
    width: width,
    height: width * 0.6,
    margin: {
      top: 30,
      right: 10,
      bottom: 50,
      left: 50
    }
  };

  useEffect(() => {
    if (!dimensions) return;

    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    console.log("dimensions hist: ", dimensions);
    console.log("hist data: ", data);
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

    bounds
      .select(".x-axis")
      .style("transform", `translateY(${dimensions.boundedHeight}px)`);

    // 4. Create scales

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data, metricAccessor))
      .range([0, dimensions.boundedWidth])
      .nice();

    const binsGenerator = d3
      .histogram()
      .domain(xScale.domain())
      .value(metricAccessor)
      .thresholds(12);

    const bins = binsGenerator(data);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(bins, yAccessor)])
      .range([dimensions.boundedHeight, 0])
      .nice();

    // 5. Draw data

    const barPadding = 1;

    let binGroups = bounds
      .select(".bins")
      .selectAll(".bin")
      .data(bins);

    binGroups.exit().remove();

    const newBinGroups = binGroups
      .enter()
      .append("g")
      .attr("class", "bin");

    newBinGroups.append("rect");
    newBinGroups.append("text");

    // update binGroups to include new points
    binGroups = newBinGroups.merge(binGroups);

    const barRects = binGroups
      .select("rect")
      .attr("x", d => xScale(d.x0) + barPadding)
      .attr("y", d => yScale(yAccessor(d)))
      .attr("height", d => dimensions.boundedHeight - yScale(yAccessor(d)))
      .attr("width", d =>
        d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding])
      );

    const mean = d3.mean(data, metricAccessor);

    const meanLine = bounds
      .selectAll(".mean")
      .attr("x1", xScale(mean))
      .attr("x2", xScale(mean))
      .attr("y1", -20)
      .attr("y2", dimensions.boundedHeight);

    // 6. Draw peripherals

    const xAxisGenerator = d3.axisBottom().scale(xScale);

    const xAxis = bounds.select(".x-axis").call(xAxisGenerator);

    const xAxisLabel = xAxis
      .select(".x-axis-label")
      .attr("x", dimensions.boundedWidth / 2)
      .attr("y", dimensions.margin.bottom - 10)
      .text("Humidity");

    // 7. Set up interactions

    binGroups
      .select("rect")
      .on("mouseenter", onMouseEnter)
      .on("mouseleave", onMouseLeave);

    const tooltip = d3.select("#tooltip");
    function onMouseEnter(datum) {
      tooltip.select("#count").text(yAccessor(datum));

      const formatHumidity = d3.format(".2f");
      tooltip
        .select("#range")
        .text([formatHumidity(datum.x0), formatHumidity(datum.x1)].join(" - "));

      const x =
        xScale(datum.x0) +
        (xScale(datum.x1) - xScale(datum.x0)) / 2 +
        dimensions.margin.left;
      const y = yScale(yAccessor(datum)) + dimensions.margin.top;

      tooltip.style(
        "transform",
        `translate(` + `calc( -50% + ${x}px),` + `calc(-100% + ${y}px)` + `)`
      );

      tooltip.style("opacity", 1);
    }

    function onMouseLeave() {
      tooltip.style("opacity", 0);
    }
  }, [
    data,
    dimensions,
    dimensions.boundedHeight,
    dimensions.boundedWidth,
    dimensions.height,
    dimensions.margin.bottom,
    dimensions.margin.left,
    dimensions.margin.top,
    dimensions.width,
    metricAccessor,
    yAccessor
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
        <g className="bounds">
          <g className="bins" />
          <line className="mean" />
          <g className="x-axis">
            <text className="x-axis-label" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Histogram;
