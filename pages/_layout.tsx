export function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <title>react-htmx example</title>
      </head>
      <body>{props.children}</body>
      {Object.entries({
        htmx: "htmx.org@1.9.4",
        alpine: "alpinejs@3.12.3/dist/cdn.min.js",
      }).map(([key, value]) => (
        <script defer key={key} src={`https://unpkg.com/${value}`} />
      ))}
    </html>
  );
}
