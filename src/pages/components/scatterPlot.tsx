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
