import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface BuildingData {
  name: string;
  height: number;
}

const GroupMargin = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const MARGIN = { TOP: 100, BOTTOM: 100, LEFT: 100, RIGHT: 100 };
    const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT;
    const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM;

    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
      .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    d3.json<BuildingData[]>("/data/buildingsMeters.json").then((data) => {
      data!.forEach((d) => {
        d.height = Number(d.height);
      });

      const names = data!.map((d) => d.name);

      const x = d3
        .scaleBand()
        .domain(names)
        .range([0, WIDTH])
        .paddingInner(0.3)
        .paddingOuter(0.2);

      const y = d3
        .scaleLinear()
        .domain([0, d3.max(data!, (d) => d.height)!])
        .nice()
        .range([HEIGHT, 0]);

      const color = d3
        .scaleOrdinal()
        .domain(names)
        .range([
          "#c11d1d",
          "#eae600",
          "#7ebd01",
          "#f68a05",
          "#f35e9a",
          "#481e5d",
          "#b10d6a",
        ]);

      const rectangles = g.selectAll("rect").data(data!);
      rectangles
        .enter()
        .data(data!)
        .append("rect")
        .attr("x", (d) => x(d.name) || 0)
        .attr("y", (d) => y(d.height) || 0)
        .attr("width", x.bandwidth())
        .attr("height", (d) => HEIGHT - y(d.height)) // Adjust height based on MARGIN
        .attr("fill", (d) => color(d.name) as string);
    });
  }, []);

  return <svg ref={svgRef} width={600} height={400} />;
};

export default GroupMargin;
