import { useEffect, useRef } from "react";
import * as d3 from "d3";

const Canvas = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    draw();
  }, []);

  const draw = () => {
    const svg = d3
      .select(svgRef.current)
      .attr("width", 500)
      .attr("height", 400);

    svg
      .append("rect")
      .attr("x", 10)
      .attr("y", 120)
      .attr("width", 200)
      .attr("height", 100)
      .attr("stroke", "black")
      .attr("fill", "green");

    svg
      .append("line")
      .attr("x1", 10)
      .attr("y1", 220)
      .attr("x2", 450)
      .attr("y2", 450)
      .attr("stroke", "red");

    svg
      .append("text")
      .attr("x", 300)
      .attr("y", 50)
      .text("Fuck my Balls")
      .attr("stroke", "blue")
      .attr("font-size", 25);

    svg
      .append("ellipse")
      .attr("cx", 350)
      .attr("cy", 300)
      .attr("rx", 100)
      .attr("ry", 60)
      .attr("fill", "pink")
      .attr("stroke", "blue");
  };

  return <svg ref={svgRef} />;
};

export default Canvas;
