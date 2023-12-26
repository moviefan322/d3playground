import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
interface DataPoint {
  year: string;
  value: number;
}

const LineChart = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<DataPoint[]>([]);
  const svgWidth = 800;
  const svgHeight = 500;
  const parseTime = d3.timeParse("%Y");
  const bisectDate = d3.bisector((d) => (d as any).year).left;

  useEffect(() => {
    d3.json<DataPoint[]>("data/example.json").then((data) => {
      data!.forEach((d) => {
        d.year =
          parseTime(d.year)?.toISOString() || new Date(d.year).toISOString();
        d.value = Number(d.value);
      });

      setData(data as DataPoint[]);
    });
  }, []);

  if (!data.length) return <div>Loading...</div>;
  console.log(data);

  return (
    <svg ref={svgRef} width={svgWidth} height={svgHeight}>
      <g></g>{" "}
    </svg>
  );
};

export default LineChart;
