import React, { useRef, useEffect, useState } from "react";
import { select, arc, pie, interpolate } from "d3";
import useResizeObserver from "../../../hooks/useResizeObserver";

function GaugeChart({ data }) {
  const svgRef = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  // will be called initially and on every data change
  useEffect(() => {
    const svg = select(svgRef.current);
    console.log(dimensions);

    if (!dimensions) return;

    // 1. Access data - MOVED outside of component
    // 2. Create chart dimensions -
    // 3. Draw canvas - replaced with HOOK - useResizeObserver
    // 4. Create scales
    const arcGenerator = arc()
      .innerRadius(75)
      .outerRadius(150);

    const pieGenerator = pie()
      .startAngle(-0.5 * Math.PI)
      .endAngle(0.5 * Math.PI)
      .sort(null);

    const instructions = pieGenerator(data);

    // 5. Draw data
    svg
      .selectAll(".slice")
      .data(instructions)
      .join("path")
      .attr("class", "slice")
      .attr("fill", (instruction, index) => (index === 0 ? "#ffcc00" : "#eee"))
      .style(
        "transform",
        `translate(${dimensions.width / 2}px, ${dimensions.height}px)`
      )
      .transition()
      .attrTween("d", function(nextInstruction, index) {
        // bonus, which wasn't in video 07:
        // animate chart initially, but setting initial instruction
        const initialInstruction = pieGenerator([0, 1])[index];
        const interpolator = interpolate(
          this.lastInstruction || initialInstruction,
          nextInstruction
        );
        this.lastInstruction = interpolator(1);
        return function(t) {
          return arcGenerator(interpolator(t));
        };
      });
    // 6. Draw peripherals
    // 7. Set up interactions
  }, [data, dimensions]);

  return (
    <div ref={wrapperRef} style={{ marginBottom: "2rem" }}>
      <svg ref={svgRef}>
        <g className="x-axis" />
        <g className="y-axis" />
      </svg>
    </div>
  );
}

export default GaugeChart;
