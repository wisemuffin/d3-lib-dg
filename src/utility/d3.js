import * as d3 from "d3";
import "d3-selection-multi";

export { halo, haloHighlight };

// This is a lightly modified version of Mike Bostock’s text halo function from @d3/connected-scatterplot
const halo = function(text, strokeWidth, color = "#ffffff") {
  text
    .select(function() {
      return this.parentNode.insertBefore(this.cloneNode(true), this);
    })
    .styles({
      fill: color,
      stroke: color,
      "stroke-width": strokeWidth,
      "stroke-linejoin": "round",
      opacity: 1
    });
};

const haloHighlight = function(
  text,
  delay,
  strokeWidth = 1,
  opacity = 1,
  color = "#000000"
) {
  let textObject = text
    .select(function() {
      return this.parentNode.insertBefore(this.cloneNode(true), this);
    })
    .styles({
      fill: "#ffffff",
      stroke: color,
      "stroke-width": 0,
      "stroke-linejoin": "round",
      opacity: opacity
    });
  textObject
    .transition()
    .ease(d3.easeLinear)
    .delay(delay)
    .duration(250)
    .styles({
      "stroke-width": strokeWidth
    })
    .transition()
    .ease(d3.easeLinear)
    .delay(500)
    .duration(250)
    .styles({
      "stroke-width": 0
    });
};
