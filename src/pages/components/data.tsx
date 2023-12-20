import { useEffect, useRef } from "react";
import * as d3 from "d3";

const Data = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    d3.csv("/data/ages.csv").then((data) => {
      data.forEach((d) => (d.age = Number(d.age) as unknown as string));

      const svg = d3
        .select(svgRef.current)
        .attr("width", 400)
        .attr("height", 400);

      const circles = svg.selectAll("circle").data(data);

      circles
        .enter()
        .append("circle")
        .attr("cx", (d, i) => i * 50 + 50)
        .attr("cy", 250)
        .attr("r", (d) => (.5 * Number(d.age)) as any)
        .attr("fill", (d) => {
          if (d.name === "Jim") {
            return "blue";
          } else {
            return "red";
          }
        });
    });
  }, []);

  return <svg ref={svgRef} />;
};

export default Data;
