import D3Example from "./components/d3Example";

type Props = {
  width: number;
  height: number;
};

export default function Home() {
  return <D3Example width={200} height={200} />;
}
