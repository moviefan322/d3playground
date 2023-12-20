import { useEffect, useRef } from "react";
import * as d3 from "d3";

const D3Example = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    draw();
  }, []);

  const draw = () => {
    const svg = d3
      .select(svgRef.current)
      .attr("width", 400)
      .attr("height", 400);

    svg
      .append("circle")
      .attr("cx", 100)
      .attr("cy", 250)
      .attr("r", 70)
      .attr("fill", "red");
  };

  return <svg ref={svgRef} />;
};

export default D3Example;
