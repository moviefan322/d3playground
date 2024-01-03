import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

interface TweetData {
  content: string;
  externalLinkContent: string[];
  externalLinks: string[];
  likes: number;
  mentionedUsers: string[];
  negativeSentiment: number;
  neutralSentiment: number;
  positiveSentiment: number;
  quoteTweets: number;
  replies: number;
  retweets: number;
  translatedContent: string;
  tweetID: string;
  url: string;
  user: string;
  verifiedStatus: string;
  views: number;
  date: Date;
  media: string;
}

const Candidates = () => {
  const [data, setData] = useState<TweetData[]>();
  const svgRef = useRef<SVGSVGElement>(null);
  const svgWidth = 800;
  const svgHeight = 600;

  useEffect(() => {
    d3.csv("data/twitter_data.csv").then((d) => {
      const modifiedData: TweetData[] = d.map((tweet) => ({
        content: tweet.Content,
        externalLinkContent: [tweet["External Link Content"]],
        externalLinks: [tweet["External links"]],
        mentionedUsers: [tweet["Mentioned Users"]], // Wrap the value in an array
        translatedContent: tweet["Translated content"],
        tweetID: tweet["Tweet ID"],
        likes: +tweet.Likes || 0,
        negativeSentiment: +tweet["Negative sentiment"] || 0,
        neutralSentiment: +tweet["Neutral sentiment"] || 0,
        positiveSentiment: +tweet["Positive sentiment"] || 0,
        quoteTweets: +tweet["Quote tweets"] || 0,
        replies: +tweet.Replies || 0,
        retweets: +tweet.Retweets || 0,
        views: +tweet.Views || 0,
        url: tweet.URL,
        user: tweet.User,
        verifiedStatus: tweet["Verified status"],
        date: new Date(Date.parse(tweet.date)),
        media: tweet.media,
      }));

      setData(modifiedData);
    });
  }, []);

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
      .text("# of tweets");
  }, [data]);

  if (!data) {
    return <div>Loading...</div>;
  }

  console.log(data);

  return (
    <div>
      <h1>Fuckers</h1>
      <svg ref={svgRef} width={svgWidth} height={svgHeight}></svg>
    </div>
  );
};

export default Candidates;
