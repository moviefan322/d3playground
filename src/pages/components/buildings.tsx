import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface BuildingData {
  name: string;
  height: string | number;
}

const Data = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const colors = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"];

  useEffect(() => {
    d3.json<BuildingData[]>("/data/buildings.json").then((data) => {
      // Parse 'height' property as numbers
      data!.forEach((d) => {
        d.height = Number(d.height);
        d.name = d.name;
      });

      const svg = d3
        .select(svgRef.current)
        .attr("width", 800)
        .attr("height", 400);

      const rectangles = svg.selectAll("rect").data(data || []);

      rectangles
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 100 + 100)
        .attr("y", 150)
        .attr("width", 40)
        .attr("height", (d) => Number(d.height) / 3)
        .attr("fill", (d, i) => colors[i]);

      const textLabels = svg.selectAll("text").data(data || []);

      textLabels
        .enter()
        .append("text")
        .text((d) => d.name)
        .attr("x", (d, i) => i * 100 + 100) // Adjust x position for text
        .attr("y", 140)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .attr("font-size", "12px");
    });
  }, []);

  return <svg ref={svgRef} />;
};

export default Data;
