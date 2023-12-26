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

  if (!data) return <div>Loading...</div>;
  console.log(data);

  return (
    <svg ref={svgRef} width={svgWidth} height={svgHeight}>
      <g></g>{" "}
    </svg>
  );
};

export default LineChart;
