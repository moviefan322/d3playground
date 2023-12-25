import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

interface RevenueData {
  month: string;
  revenue: number;
  profit: number;
}

const Revenues = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isProfit, setIsProfit] = useState<boolean>(true);
  const [data, setData] = useState<RevenueData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const svgHeight = 400;
  const svgWidth = 600;
  const MARGIN = { LEFT: 100, RIGHT: 20, TOP: 10, BOTTOM: 130 };
  const WIDTH = svgWidth - MARGIN.LEFT - MARGIN.RIGHT;
  const HEIGHT = svgHeight - MARGIN.TOP - MARGIN.BOTTOM;

  useEffect(() => {
    if (!svgRef.current) return;

    d3.csv("/data/revenues.csv", (d) => ({
      month: d.month,
      revenue: +d.revenue,
      profit: +d.profit,
    })).then((data: RevenueData[]) => {
      setMonths(data.map((d) => d.month));
      setData(data);
    });
  }, [isProfit]);

  useEffect(() => {
    if (!svgRef.current || !data.length || !months.length) return;

    const svg = d3.select(svgRef.current);
    const g = svg
      .select("g")
      .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    const x = d3
      .scaleBand()
      .range([0, WIDTH])
      .paddingInner(0.3)
      .paddingOuter(0.2);

    const y = d3.scaleLinear().range([HEIGHT, 0]);

    const xAxisGroup = g
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${HEIGHT})`);

    const yAxisGroup = g
      .append("g")
      .attr("class", "y axis")
      .attr("transform", `translate(0, 0)`);

    // X Label
    g.append("text")
      .attr("class", "x axis-label")
      .attr("x", WIDTH / 2)
      .attr("y", HEIGHT + 110)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Month");

    // Y Label
    const yLabel = g
      .append("text")
      .attr("class", "y axis-label")
      .attr("x", -(HEIGHT / 2))
      .attr("y", -80)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)");

    const color = d3
      .scaleOrdinal()
      .domain(months)
      .range([
        "#c11d1d",
        "#eae600",
        "#7ebd01",
        "#f68a05",
        "#f35e9a",
        "#481e5d",
        "#b10d6a",
      ]);

    const value = isProfit ? "profit" : "revenue";
    const maxValue = isProfit
      ? d3.max(data, (d) => d.profit)
      : d3.max(data, (d) => d.revenue);

    x.domain(months);
    y.domain([0, maxValue || 0]);

    const xAxisCall = d3.axisBottom(x);

    xAxisGroup
      .transition()
      .duration(750)
      .call(xAxisCall as any)
      .selectAll("text")
      .attr("y", "10")
      .attr("x", "-5")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-40)");

    const yAxisCall = d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat((d) => d + "m");

    yAxisGroup
      .transition()
      .duration(750)
      .call(yAxisCall as any)
      .selectAll("text")
      .attr("font-size", "15px");

    const rects = g.selectAll("rect").data(data);

    rects
      .exit()
      .transition()
      .duration(750)
      .attr("height", 0)
      .attr("y", y(0))
      .remove();

    rects
      .transition()
      .duration(750)
      .attr("x", (d) => x(d.month) || 0)
      .attr("y", (d) => y(d[value]) || 0)
      .attr("width", x.bandwidth())
      .attr("height", (d) => HEIGHT - y(d[value]))
      .attr("fill", (d) => color(d.month) as string);

    yLabel.text(isProfit ? "Profit ($)" : "Revenue ($)");

    rects
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.month) || 0)
      .attr("width", x.bandwidth())
      .attr("fill", (d) => color(d.month) as string)
      .attr("y", y(0))
      .attr("height", 0)
      .merge(
        rects as unknown as d3.Selection<
          SVGRectElement,
          RevenueData,
          SVGGElement,
          unknown
        >
      )
      .transition()
      .duration(750)
      .attr("y", (d) => y(d[value]) || 0)
      .attr("height", (d) => HEIGHT - y(d[value]));
  }, [data, months, isProfit, WIDTH, HEIGHT]);

  return (
    <>
      <svg ref={svgRef} height={svgHeight} width={svgWidth}>
        <g></g>
      </svg>
      <button onClick={() => setIsProfit((isProfit) => !isProfit)}>
        Toggle
      </button>
    </>
  );
};

export default Revenues;
