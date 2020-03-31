import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const DougnutAnimated = ({ width, height, percent }) => {
  const ref = useRef(null);

  let dimensions = {
    width: width,
    height: height,
    margin: {
      top: 30,
      right: 10,
      bottom: 50,
      left: 50
    }
  };

  var ratio = percent / 100;

  var outerRadius = width / 2 - 10;
  var innerRadius = width / 2 - 30;
  var color = ["#f2503f", "#ea0859", "#404F70"];

  var createGradient = function(svg, id, color1, color2) {
    var defs = svg.append("svg:defs");

    var red_gradient = defs
      .append("svg:linearGradient")
      .attr("id", id)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "50%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    red_gradient
      .append("svg:stop")
      .attr("offset", "50%")
      .attr("stop-color", color1)
      .attr("stop-opacity", 1);

    red_gradient
      .append("svg:stop")
      .attr("offset", "100%")
      .attr("stop-color", color2)
      .attr("stop-opacity", 1);
  };
  useEffect(() => {
    if (!dimensions) return;

    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attrs({
        width: dimensions.width,
        height: dimensions.height,
        class: "shadow"
      })
      .append("g")
      .attrs({
        transform:
          "translate(" +
          dimensions.width / 2 +
          "," +
          dimensions.height / 2 +
          ")"
      });

    var pie = d3
      .pie()
      .value(d => d)
      .sort(null);

    createGradient(svg, "gradient", color[0], color[1]);

    var arc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    var arcLine = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0);

    // Add the background arc
    var pathBackground = svg
      .append("path")
      .attrs({
        d: arc
      })
      .styles({
        fill: color[2]
      });

    // Add the arc starting with 0 angle. this gets updated by the animation function
    var pathChart = svg
      .append("path")
      .datum({ endAngle: 0 })
      .attrs({
        d: arcLine,
        fill: "url(#gradient)"
      });

    let middleCount = svg
      .append("text")
      .text(function(d) {
        return d;
      })
      .attrs({
        class: "middleText",
        "text-anchor": "middle",
        dy: 30,
        dx: -15
      })
      .styles({
        fill: color[1],
        "font-size": "90px"
      });

    svg
      .append("text")
      .text("%")
      .attrs({
        class: "percent",
        "text-anchor": "middle",
        dx: 50,
        dy: -5
      })
      .styles({
        fill: color[1],
        "font-size": "40px"
      });

    var arcTween = function(transition, newAngle) {
      transition.attrTween("d", function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle);
        var interpolateCount = d3.interpolate(0, percent);
        return function(t) {
          d.endAngle = interpolate(t);
          middleCount.text(Math.floor(interpolateCount(t)));
          return arcLine(d);
        };
      });
    };

    var animate = function() {
      pathChart
        .transition()
        .duration(750)
        .call(arcTween, 2 * Math.PI * ratio);
    };

    setTimeout(animate, 0);
  }, [color, dimensions, innerRadius, outerRadius, percent, ratio, width]);

  return (
    <div className="widget">
      <div className="header">Progress Status</div>
      <div id="chart" className="chart-container" ref={ref}></div>
    </div>
  );
};

export default DougnutAnimated;
