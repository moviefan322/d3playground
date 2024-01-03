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

interface NegativeTweets {
  [key: string]: {
    date: Date;
    tweets: TweetData[];
    count: number;
    dateInt: number | undefined;
  };
}

const Candidates = () => {
  const [data, setData] = useState<TweetData[]>();
  const [negativeTweets, setNegativeTweets] = useState<NegativeTweets>();
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
    if (data) {
      const negativeTweetsByDate: NegativeTweets = {};
      const dateMap = new Map<string, number>(); // Map to store dates and corresponding indices

      data.forEach((tweet) => {
        if (tweet.negativeSentiment > 62) {
          const tweetDate = tweet.date.toISOString().slice(0, 10); // Format date as "YYYY-MM-DD"
          if (!negativeTweetsByDate[tweetDate]) {
            negativeTweetsByDate[tweetDate] = {
              date: new Date(tweetDate),
              tweets: [],
              count: 0,
              dateInt: 0,
            };
            dateMap.set(tweetDate, dateMap.size); // Store the date and its index in the map
          }
          negativeTweetsByDate[tweetDate].tweets.push(tweet);
          negativeTweetsByDate[tweetDate].count =
            negativeTweetsByDate[tweetDate].tweets.length;
        }
      });

      const sortedEntries = Object.values(negativeTweetsByDate).sort((a, b) => {
        // Sort entries by date
        return a.date.getTime() - b.date.getTime();
      });

      sortedEntries.forEach((tweet, index) => {
        tweet.dateInt = index;
      });

      setNegativeTweets(negativeTweetsByDate);
    }
  }, [data]);

  const drawLineChart = (data: { date: Date; count: number }[]) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const MARGIN = { LEFT: 80, RIGHT: 20, TOP: 50, BOTTOM: 100 };
    const WIDTH = svgWidth - MARGIN.LEFT - MARGIN.RIGHT;
    const HEIGHT = svgHeight - MARGIN.TOP - MARGIN.BOTTOM;

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

    const x = d3.scaleTime().range([0, WIDTH]); // Use time scale for x-axis
    const y = d3.scaleLinear().range([HEIGHT, 0]);

    const xAxisCall = d3.axisBottom(x);
    const yAxisCall = d3.axisLeft(y).ticks(6);

    const dates = data.map((entry) => entry.date);
    const count = data.map((entry) => entry.count);

    x.domain(d3.extent(dates) as [Date, Date]); // Set x-domain to the range of dates
    y.domain([0, d3.max(count) as number]);

    g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${HEIGHT})`)
      .call(xAxisCall.scale(x));

    g.append("g").attr("class", "y axis").call(yAxisCall.scale(y));

    const line = d3
      .line<{ date: Date; count: number }>()
      .x((d) => x(d.date) ?? 0) // Use date for x-coordinate
      .y((d) => y(d.count) ?? 0) // Use count for y-coordinate

    g.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add y-axis label
    g.append("text")
      .attr("class", "y axis-label")
      .attr("x", -(HEIGHT / 2))
      .attr("y", -40)
      .attr("font-size", "20px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("# of tweets");
  };

  useEffect(() => {
    if (negativeTweets && Object.keys(negativeTweets).length > 0) {
      const values = Object.values(negativeTweets);

      // Restructure data for the line chart
      const chartData = values.reduce((acc, entry) => {
        return acc.concat(
          entry.tweets.map((tweet) => ({
            date: tweet.date,
            count: entry.count, // Keep the count as it is
            dateInt: entry.dateInt ?? 0,
          }))
        );
      }, [] as { date: Date; count: number; dateInt: number }[]);

      // Sort the chartData by date
      chartData.sort((a, b) => a.date.getTime() - b.date.getTime());

      drawLineChart(chartData);
    }
  }, [negativeTweets]);

  if (!data) {
    return <div>Loading...</div>;
  }

  console.log(negativeTweets);

  return (
    <div>
      <h1>Fuckers</h1>
      <svg ref={svgRef} width={svgWidth} height={svgHeight}></svg>
    </div>
  );
};

export default Candidates;
