import { useState, useEffect } from "react";
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
  date: string;
  media: string;
}

const Candidates = () => {
  const [data, setData] = useState<TweetData[]>();

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
        date: tweet.date,
        media: tweet.media,
      }));

      setData(modifiedData);
    });
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  console.log(data);

  return (
    <div>
      <h1>Fuckers</h1>
    </div>
  );
};

export default Candidates;
