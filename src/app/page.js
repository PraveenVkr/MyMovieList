export default function Home() {
  const Temp = (props) => {
    return <h1 className="text-amber-300">inner comp {props.name}</h1>;
  };
  return <main>hi</main>;
}
