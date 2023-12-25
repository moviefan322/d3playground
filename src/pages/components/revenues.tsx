import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

interface RevenueData {
  month: string;
  revenue: number;
  profit: number;
}

const Revenues = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
  const xLabelRef = useRef<SVGTextElement>(null);
  const yLabelRef = useRef<SVGTextElement>(null);
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

    // Update x-axis label
    g.select(".x.axis-label")
      .attr("x", WIDTH / 2)
      .attr("y", HEIGHT + 110)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .text("Month");

    // Update y-axis label
    g.select(".y.axis-label")
      .attr("x", -(HEIGHT / 2))
      .attr("y", -60)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text(isProfit ? "Profit ($)" : "Revenue ($)");

    // Update x-axis
    const x = d3
      .scaleBand()
      .range([0, WIDTH])
      .paddingInner(0.3)
      .paddingOuter(0.2)
      .domain(months);

    const xAxisCall = d3.axisBottom(x);
    const xAxis = d3.select(xAxisRef.current);
    xAxis
      .transition()
      .duration(750)
      .call(xAxisCall as any);

    // Update y-axis
    const value = isProfit ? "profit" : "revenue";
    const maxValue = isProfit
      ? d3.max(data, (d) => d.profit)!
      : d3.max(data, (d) => d.revenue)!;

    const y = d3.scaleLinear().range([HEIGHT, 0]).domain([0, maxValue]);

    const yAxisCall = d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat((d) => d + "m");

    const yAxis = d3.select(yAxisRef.current);
    yAxis
      .transition()
      .duration(750)
      .call(yAxisCall as any);

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

    const rects = g.selectAll("rect").data(data);

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
        <g>
          <g
            ref={xAxisRef}
            className="x axis"
            transform={`translate(0, ${HEIGHT})`}
          />
          <g ref={yAxisRef} className="y axis" transform="translate(0, 0)" />
          <text ref={xLabelRef} className="x axis-label" />
          <text ref={yLabelRef} className="y axis-label" />
        </g>
      </svg>
      <button onClick={() => setIsProfit((isProfit) => !isProfit)}>
        Toggle
      </button>
    </>
  );
};

export default Revenues;
