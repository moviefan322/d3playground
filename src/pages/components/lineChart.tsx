import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

interface CoinList {
  [key: string]: CoinData[];
}

interface CoinData {
  vol_24h: number | null;
  date: any;
  market_cap: number | null;
  price_usd: number | null;
}

const LineChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const focusRef = useRef<SVGGElement>(null);
  const circleRef = useRef<SVGLineElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const [data, setData] = useState<CoinData[]>();
  const [selectedCoin, setSelectedCoin] = useState<string>("bitcoin");
  const svgWidth = 800;
  const svgHeight = 600;
  const parseDate = (dateString: string): Date | null => {
    const [day, month, year] = dateString.split("/").map(Number);
    return new Date(year, month - 1, day);
  };
  const bisectDate = d3.bisector((d) => (d as any).year).left;

  useEffect(() => {
    d3.json<CoinList>("data/coins.json").then((coinData: any) => {
      console.log(coinData[selectedCoin]);
      const parsedCoinData = coinData[selectedCoin] as CoinData[];

      parsedCoinData.forEach((d) => {
        d.date = parseDate(d.date);
        d.price_usd = d.price_usd ? +d.price_usd : null;
        d.market_cap = d.market_cap ? +d.market_cap : null;
        d.vol_24h = d.vol_24h ? +d.vol_24h : null;
      });

      setData(parsedCoinData);
    });
  }, [selectedCoin]);

  useEffect(() => {
    const MARGIN = { LEFT: 20, RIGHT: 100, TOP: 50, BOTTOM: 100 };
    const WIDTH = svgWidth - MARGIN.LEFT - MARGIN.RIGHT;
    const HEIGHT = svgHeight - MARGIN.TOP - MARGIN.BOTTOM;
    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);

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
      .x((d) => (d.date ? x(d.date! as Date | any) : 0)) // Adjust here
      .y((d) => (d.price_usd ? y(+d.price_usd) : 0));

    if (data) {
      const coinDataArray = data;

      const sanitizedCoinDataArray = coinDataArray.filter(
        (data) => data.price_usd !== null && data.date !== null
      );

      console.log(data);

      // Ensure sanitizedCoinDataArray has at least one valid data point
      if (sanitizedCoinDataArray.length > 0) {
        x.domain([
          d3.min(sanitizedCoinDataArray, (d) => d.date as unknown as Date)!, // Ensure the date type is Date here
          d3.max(sanitizedCoinDataArray, (d) => d.date as unknown as Date)!,
        ]).nice();

        y.domain([
          d3.min(sanitizedCoinDataArray, (d) =>
            d.price_usd ? +d.price_usd! : Infinity
          )! / 1.005,
          d3.max(sanitizedCoinDataArray, (d) =>
            d.price_usd ? +d.price_usd! : 0
          )! * 1.005,
        ]);

        // Generate axes once scales have been set
        xAxis.call(xAxisCall.scale(x));
        yAxis.call(yAxisCall.scale(y));

        const line = d3
          .line<CoinData>()
          .x((d) => (d.date ? x(d.date as unknown as Date) : 0))
          .y((d) => (d.price_usd ? y(+d.price_usd) : 0));

        // Add line to chart
        g.append("path")
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", "grey")
          .attr("stroke-width", "3px")
          .attr("d", line(sanitizedCoinDataArray)); // Pass sanitized data here
      }
    }

    /******************************** Tooltip Code ********************************/

    const focus = d3.select(focusRef.current); // Select the tooltip group

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

    focus
      .append("circle")
      .attr("r", 7.5)
      .attr("class", "circle")
      .style("display", "none"); // Initially hide the circle

    focus
      .append("text")
      .attr("x", 15)
      .attr("dy", ".31em")
      .attr("class", "tooltip-text")
      .style("display", "none"); // Initially hide the text

    const overlay = d3
      .select(svgRef.current)
      .append("rect")
      .attr("class", "overlay");

    overlay
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .style("fill", "none")
      .on("mouseover", () => {
        focus.selectAll(".circle, .tooltip-text").style("display", "block");
      })
      .on("mouseout", () => {
        focus.selectAll(".circle, .tooltip-text").style("display", "none");
      })
      .on("mousemove", (event) => {
        mousemove(event);
      });

    function mousemove(event: any) {
      const [x0, y0] = d3.pointer(event); // Get mouse coordinates relative to the SVG

      const invertedX: any = x.invert(x0); // Invert x coordinate to get the corresponding date
      const i = bisectDate(data as any, invertedX, 1);

      const d0 = data![i - 1];
      const d1 = data![i];
      const d =
        invertedX - (d0?.date ?? 0) > (d1?.date ?? 0) - invertedX ? d1 : d0;

      focus.attr("transform", `translate(${x(d.date)}, ${y(d.price_usd!)})`);
      d3.select(circleRef.current).attr("transform", "translate(0, 0)");
      d3.select(textRef.current).text(`Price: ${d.price_usd} USD`);
    }
  }, [bisectDate, data]);

  if (!data) return <div>Loading...</div>;

  return (
    <svg ref={svgRef} width={svgWidth} height={svgHeight}>
      <g ref={focusRef} className="focus"></g>
    </svg>
  );
};

export default LineChart;
