import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface BuildingData {
  name: string;
  height: string | number;
}

const DomRange = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const colors = [
    "#e41a1c",
    "#377eb8",
    "#4daf4a",
    "#984ea3",
    "#ff7f00",
    "#ffff33",
    "#a65628",
  ];

  useEffect(() => {
    d3.json<BuildingData[]>("/data/buildingsMeters.json").then((data) => {
      // Parse 'height' property as numbers
      data!.forEach((d) => {
        d.height = Number(d.height);
        d.name = d.name;
      });

      const x = d3
        .scaleBand()
        .domain(data!.map((d) => d.name))
        .range([0, 400])
        .paddingInner(0.3)
        .paddingOuter(0.2);

      console.log(x("Burj Khalifa"));

      const y = d3.scaleLinear().domain([0, 828]).range([0, 400]);

      const svg = d3
        .select(svgRef.current)
        .attr("width", 400)
        .attr("height", 400);

      const rectangles = svg.selectAll("rect").data(data || []);

      rectangles
        .enter()
        .append("rect")
        .attr("y", 0)
        .attr("x", (d, i) => x(d.name) || 0)
        .attr("width", x.bandwidth)
        .attr("height", (d) => y(Number(d.height)))
        .attr("fill", (d, i) => colors[i]);

      const textLabels = svg.selectAll("text").data(data || []);

      // textLabels
      //   .enter()
      //   .append("text")
      //   .text((d) => d.name)
      //   .attr("x", (d, i) => i * 100 + 100) // Adjust x position for text
      //   .attr("y", 140)
      //   .attr("text-anchor", "middle")
      //   .attr("fill", "black")
      //   .attr("font-size", "12px");
    });
  }, []);

  return <svg ref={svgRef} />;
};

export default DomRange;
