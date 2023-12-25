import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

interface RevenueData {
  month: string;
  revenue: number;
  profit: number;
}

const Revenues = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isProfit, setIsProfit] = useState<boolean>(true); // Boolean flag state
  const [data, setData] = useState<RevenueData[]>([]); // Data state
  const [months, setMonths] = useState<string[]>([]); // Months state
  const [max, setMax] = useState<number>(0); // Max state
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
      setMax(
        isProfit
          ? d3.max(data, (d) => d.profit)!
          : d3.max(data, (d) => d.revenue)!
      );
      setData(data);
    });
  }, [isProfit]);

  useEffect(() => {
    if (!svgRef.current || !data.length || !months.length || !max) return;

    // Clear all
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

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
      .attr("y", -60)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)");

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

    const yAxisGroup = g.append("g").attr("class", "y axis");

    // d3.interval(() => {
    //   setIsProfit((isProfit) => !isProfit);
    //   update(data);
    //   const newData = isProfit ? data : data.slice(1);
    // }, 2000);

    var update = (data: RevenueData[]) => {
      const value = isProfit ? "profit" : "revenue";

      x.domain(months);
      y.domain([0, max]);

      const xAxisCall = d3.axisBottom(x);

      xAxisGroup
        .transition()
        .duration(750)
        .call(xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");

      const yAxisCall = d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((d) => d + "m");

      yAxisGroup.transition().duration(750).call(yAxisCall);

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

      // JOIN new data with old elements.
      const rects = g.selectAll("rect").data(data);

      // EXIT old elements not present in new data.
      rects
        .exit()
        .attr("fill", "red")
        .transition()
        .duration(750)
        .attr("height", 0)
        .attr("y", y(0))
        .remove();

      // UPDATE old elements present in new data.
      rects
        .transition()
        .duration(750)
        .attr("x", (d) => x(d.month) || 0)
        .attr("y", (d) => y(d[value]) || 0)
        .attr("width", x.bandwidth())
        .attr("height", (d) => HEIGHT - y(d[value]));

      // ENTER new elements present in new data.
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

      const text = isProfit ? "Profit ($)" : "Revenue ($)";
      yLabel.text(text);
    };

    update(data);
  }, [data, months, max, isProfit, MARGIN.LEFT, MARGIN.TOP, WIDTH, HEIGHT]);

  return (
    <>
      <svg ref={svgRef} height={svgHeight} width={svgWidth} />
      <button onClick={() => setIsProfit((isProfit) => !isProfit)}>
        Toggle
      </button>
    </>
  );
};

export default Revenues;
