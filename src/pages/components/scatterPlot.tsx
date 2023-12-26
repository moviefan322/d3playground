import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import styles from "./scatterPlot.module.css";

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
  const [showTooltip, setShowTooltip] = useState(true);
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const yearLabelRef = useRef<SVGTextElement>(null);
  const [data, setData] = useState<GDPData[]>([]);
  const [year, setYear] = useState<number>(0);
  const [index, setIndex] = useState<number>(0);
  const [currentDataSet, setCurrentDataSet] = useState<CountryData[]>();
  const svgWidth = 600;
  const svgHeight = 400;

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
      setCurrentDataSet(data[index].countries as CountryData[]);
      setYear(data[index].year);
    }
  }, [data, index]);

  useEffect(() => {
    if (data.length > 0) {
      const timer = d3.interval(() => {
        if (index < data.length - 1) {
          setIndex(index + 1);
        } else {
          setIndex(0);
        }
      }, 100);
      return () => timer.stop();
    }
  }, [data, index]);

  useEffect(() => {
    if (!currentDataSet) return;

    const MARGIN = { TOP: 10, BOTTOM: 100, LEFT: 100, RIGHT: 10 };
    const WIDTH = svgWidth - MARGIN.LEFT - MARGIN.RIGHT;
    const HEIGHT = svgHeight - MARGIN.TOP - MARGIN.BOTTOM;
    const continents = ["europe", "asia", "americas", "africa"];
    if (data.length > 0) {
      const svg = d3.select(svgRef.current);
      const g = svg.append("g");

      // Update x-axis label
      g.append("text")
        .attr("class", "x axis-label")
        .attr("x", WIDTH / 2 + MARGIN.LEFT)
        .attr("y", HEIGHT + 60)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("GDP Per Capita ($)");

      // Update y-axis label
      g.append("text")
        .attr("class", "y axis-label")
        .attr("x", -(HEIGHT / 2))
        .attr("y", 50)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Life Expectancy (Years)");

      //Year label
      const yearLabel = d3
        .select(yearLabelRef.current)
        .attr("class", "year-label")
        .attr("font-size", "40px")
        .attr("opacity", "0.4")
        .attr("text-anchor", "end")
        .attr("fill", "grey")
        .text(year)
        .attr("x", svgWidth)
        .attr("y", svgHeight - 130);

      const x = d3.scaleLog([100, 150000], [0, WIDTH]);
      const y = d3.scaleLinear().domain([0, 100]).range([HEIGHT, 0]);
      const area = d3
        .scaleLinear()
        .range([25 * Math.PI, 1500 * Math.PI])
        .domain([2000, 1400000000]);

      const continentColor = d3.scaleOrdinal(d3.schemePastel1);

      const xAxisCall = d3
        .axisBottom(x)
        .tickValues([400, 4000, 40000])
        .tickFormat(d3.format("$"));
      const xAxis = g
        .append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(${MARGIN.LEFT}, ${HEIGHT + MARGIN.TOP})`);
      xAxis.call(xAxisCall as any);

      const yAxisCall = d3.axisLeft(y);
      const yAxis = g
        .append("g")
        .attr("class", "y axis")
        .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);
      yAxis.call(yAxisCall as any);

      const legend = g
        .append("g")
        .attr("transform", `translate(${WIDTH - 10}, ${HEIGHT - 125})`);

      legend
        .append("rect")
        .attr("width", 100)
        .attr("height", 80)
        .attr("x", -80)
        .attr("y", -6)
        .style("stroke", "black")
        .style("stroke-width", 1)
        .style("fill", "#ffe6f2");

      continents.forEach((continent, i) => {
        const legendRow = legend
          .append("g")
          .attr("transform", `translate(0, ${i * 20})`)
          .style("border", "5px solid black");

        legendRow
          .append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("stroke", "black")
          .attr("fill", continentColor(continent));

        legendRow
          .append("text")
          .attr("x", -10)
          .attr("y", 10)
          .attr("text-anchor", "end")
          .style("text-transform", "capitalize")
          .text(continent);
      });

      const circles = svg
        .selectAll("circle")
        .data(currentDataSet, (d: any) => d.country);

      circles.exit().remove();

      circles
        .enter()
        .append("circle")
        .attr("fill", (d) => continentColor(d.continent))
        .on("mouseover", (event, d) => {
          setShowTooltip(true);
          const [x, y] = d3.pointer(event);
          setTooltipPosition({ x, y });
          setTooltipContent(
            `<strong>Country: </strong>
              <span style="color: red;text-transform:capitalize">${
                d.country
              }</span><br/>
              <strong>Continent: </strong>
              <span style="color: red;text-transform:capitalize">${
                d.continent
              }</span><br/>
              <strong>Life Expectancy: </strong>
              <span style="color: red">${d3.format(".2f")(
                d.life_exp
              )}</span><br/>
              <strong>GDP Per Capita: </strong>
              <span style="color: red">${d3.format("$,.0f")(
                d.income
              )}</span><br/>
              <strong>Population: </strong>
              <span style="color: red">${d3.format(",.0f")(
                d.population
              )}</span><br/>`
          );
        })
        .on("mouseout", () => {
          setShowTooltip(false);
        })
        .merge(circles as any)
        .transition()
        .duration(100)
        .attr("cx", (d) => x(d.income))
        .attr("cy", (d) => y(d.life_exp))
        .attr("r", (d) => Math.sqrt(area(d.population) / Math.PI));

      yearLabel.text(year);
    }
  }, [currentDataSet, data, svgHeight, svgWidth, year]);

  console.log("showTooltip:", showTooltip);
  console.log("tooltipContent:", tooltipContent);
  console.log("tooltipPosition:", tooltipPosition);

  if (!data.length) return <p>Loading...</p>;

  return (
    <>
      <svg ref={svgRef} width={svgWidth} height={svgHeight}>
        <text ref={yearLabelRef}>{year}</text>
      </svg>
      {showTooltip && (
        <div
          className={styles.tooltip}
          style={{
            left: `${tooltipPosition.x}px`, // Adjust left position
            top: `${tooltipPosition.y}px`, // Adjust top position
          }}
          dangerouslySetInnerHTML={{ __html: tooltipContent }}
        />
      )}
    </>
  );
};

export default ScatterPlot;
