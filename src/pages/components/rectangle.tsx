import { useEffect, useRef } from "react";
import * as d3 from "d3";

const Rectangle = () => {
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
      .append("rect")
      .attr("x", 10)
      .attr("y", 120)
      .attr("width", 200)
      .attr("height", 100)
      .attr("stroke", "black")
      .attr("fill", "green");
  };

  return <svg ref={svgRef} />;
};

export default Rectangle;
