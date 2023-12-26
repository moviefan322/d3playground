import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

interface CoinList {
  [key: string]: CoinData[];
}

interface CoinData {
  vol_24h: string | null;
  date: string;
  market_cap: string | null;
  price_usd: string | null;
}

const LineChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<CoinList>();
  const svgWidth = 800;
  const svgHeight = 500;
  const parseDate = (dateString: string): Date | null => {
    const [day, month, year] = dateString.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };
  const bisectDate = d3.bisector((d) => (d as any).year).left;

  useEffect(() => {
    d3.json("data/coins.json").then((coinData: any) => {
      const parsedCoinData = coinData as CoinList;

      Object.keys(coinData).forEach((coinKey) => {
        parsedCoinData[coinKey] = coinData[coinKey].map((coin: CoinData) => ({
          ...coin,
          date: coin.date ? parseDate(coin.date) : null,
          vol_24h: coin.vol_24h ? +coin.vol_24h : null,
          market_cap: coin.market_cap ? +coin.market_cap : null,
          price_usd: coin.price_usd ? +coin.price_usd : null,
        }));
      });

      setData(parsedCoinData);
    });
  }, []);

  useEffect(() => {
    const MARGIN = { LEFT: 20, RIGHT: 100, TOP: 50, BOTTOM: 100 };
    const WIDTH = svgWidth - MARGIN.LEFT - MARGIN.RIGHT;
    const HEIGHT = svgHeight - MARGIN.TOP - MARGIN.BOTTOM;
    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("width", WIDTH)
      .attr("height", HEIGHT);

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    // scales
    const x = d3.scaleTime().range([0, WIDTH]);
    const y = d3.scaleLinear().range([HEIGHT, 0]);

    // axis generators
    const xAxisCall = d3.axisBottom(x);
    const yAxisCall = d3
      .axisLeft(y)
      .ticks(6)
      .tickFormat((d) => `${+((d as any) / 1000)}k`);

    // axis groups
    const xAxis = g
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${HEIGHT})`);
    const yAxis = g.append("g").attr("class", "y axis");

    // y-axis label
    yAxis
      .append("text")
      .attr("class", "axis-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .attr("fill", "#5D6971")
      .text("Price (USD)");

    // line path generator
    const line = d3
      .line<CoinData>()
      .x((d) => (d.date ? x(+d.date) : 0))
      .y((d) => (d.price_usd ? y(+d.price_usd) : 0));

    if (data?.bitcoin) {
      const coinDataArray = data.bitcoin;

      x.domain(
        d3.extent(coinDataArray, (d) =>
          d.date ? new Date(d.date) : new Date()
        ) as [Date, Date]
      );

      y.domain([
        d3.min(coinDataArray, (d) =>
          d.price_usd ? +d.price_usd! : Infinity
        )! / 1.005,
        d3.max(coinDataArray, (d) => (d.price_usd ? +d.price_usd! : 0))! *
          1.005,
      ]);
    }

    // generate axes once scales have been set
    xAxis.call(xAxisCall.scale(x));
    yAxis.call(yAxisCall.scale(y));

    // add line to chart
    g.append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "grey")
      .attr("stroke-width", "3px")
      // .attr("d", line(data as unknown as CoinData[]));

    console.log(data);

    /******************************** Tooltip Code ********************************/

    const focus = g.append("g").attr("class", "focus").style("display", "none");

    focus
      .append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", HEIGHT);

    focus
      .append("line")
      .attr("class", "y-hover-line hover-line")
      .attr("x1", 0)
      .attr("x2", WIDTH);

    focus.append("circle").attr("r", 7.5);

    focus.append("text").attr("x", 15).attr("dy", ".31em");

    g.append("rect")
      .attr("class", "overlay")
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .on("mouseover", () => focus.style("display", null))
      .on("mouseout", () => focus.style("display", "none"))
      .on("mousemove", (event) => {});

    // function mousemove() {
    //   const x0 = x.invert(d3.mouse(this)[0]);
    //   const i = bisectDate(data as any, x0, 1);
    //   const d0 = data![i - 1];
    //   const d1 = data![i];
    //   const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    //   focus.attr("transform", `translate(${x(d.date)}, ${y(d.price_usd)})`);
    //   focus.select("text").text(d.price_usd);
    //   focus.select(".x-hover-line").attr("y2", HEIGHT - y(d.price_usd));
    //   focus.select(".y-hover-line").attr("x2", -x(d.date));
    // }
  }, [data]);

  if (!data) return <div>Loading...</div>;
  console.log(data);

  return <svg ref={svgRef} width={svgWidth} height={svgHeight}></svg>;
};

export default LineChart;
