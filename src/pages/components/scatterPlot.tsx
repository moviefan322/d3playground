import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

interface CountryData {
  continent: string;
  country: string;
  income: number;
  life_exp: number;
  population: number;
}

interface GDPData {
  countries: CountryData[];
  year: number;
}

const ScatterPlot = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<GDPData[]>([]);

  const svgWidth = 600;
  const svgHeight = 400;
  const MARGIN = { TOP: 10, BOTTOM: 130, LEFT: 130, RIGHT: 10 };
  const WIDTH = svgWidth - MARGIN.LEFT - MARGIN.RIGHT;
  const HEIGHT = svgHeight - MARGIN.TOP - MARGIN.BOTTOM;

  useEffect(() => {
    d3.json<GDPData[]>("/data/data.json").then((responseData) => {
      if (responseData && responseData.length > 0) {
        const filteredData = responseData.filter((d) => {
          if (d.year !== null && d.countries) {
            d.countries = d.countries.filter(
              (e) =>
                e.income !== null &&
                e.life_exp !== null &&
                e.population !== null
            );
            return true;
          }
          return false;
        });
        setData(filteredData);
      }
    });
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const data1800 = data[0].countries;

      const maxLifeExp1800 = d3.max(data1800, (d) => d.life_exp);

      const svg = d3.select(svgRef.current);
      const g = svg
        .append("g")
        .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

      // Update x-axis label
      g.select(".x.axis-label")
        .attr("x", WIDTH / 2)
        .attr("y", HEIGHT + 110)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("GDP Per Capita ($)");

      // Update y-axis label
      g.select(".y.axis-label")
        .attr("x", -(HEIGHT / 2))
        .attr("y", -60)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)");

      const x = d3.scaleLog([100, 150000], [0, WIDTH]);
      const y = d3
        .scaleLinear()
        .domain([0, maxLifeExp1800 || 0])
        .range([HEIGHT, 0]);

      const xAxisCall = d3.axisBottom(x);
      const xAxis = svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(${MARGIN.LEFT}, ${HEIGHT + MARGIN.TOP})`);
      xAxis.call(xAxisCall as any);

      const yAxisCall = d3.axisLeft(y);
      const yAxis = svg
        .append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);
      yAxis.call(yAxisCall as any);
    }
  }, [data, MARGIN, WIDTH, HEIGHT]);

  console.log(data);

  if (!data.length) return <p>Loading...</p>;

  return (
    <>
      <svg ref={svgRef} width={svgWidth} height={svgHeight} />
      {data[200].countries.map((d, i) => (
        <>
          <h2 key={i}>{d.country}</h2>
          <p key={"continent" + i}>Continent: {d.continent}</p>
          <p key={"year" + i}>Year: {data[0].year}</p>
          <p key={"income" + i}>Income: {d.income}</p>
          <p key={"le" + i}>Life Expectancy: {d.life_exp}</p>
          <p key={"pop" + i}>Population: {d.population}</p>
        </>
      ))}
    </>
  );
};

export default ScatterPlot;
