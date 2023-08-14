import { useLogger } from "@/server";

let counter = 0;

export function GET(props: { search: URLSearchParams }) {
  return (
    <>
      <h1 style={{ color: "red" }}>Hello world!</h1>
      <pre>{JSON.stringify(props.search)}</pre>
      <Counter value={counter} />
    </>
  );
}

export function POST() {
  counter++;

  const log = useLogger();
  log.info({ counter }, "incremented counter");

  return <Counter value={counter} />;
}

function Counter(props: { value: number }) {
  return (
    <button hx-target="this" hx-swap="outerHTML" hx-post="/">
      Click to increase: {props.value}
    </button>
  );
}
