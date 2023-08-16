export function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
        <link rel="stylesheet" href="/static/index.css" />
        <title>react-htmx example</title>
      </head>
      <body>{props.children}</body>
      <script src="https://unpkg.com/htmx.org" defer />
      {/*<script src="https://unpkg.com/petite-vue" defer />*/}
    </html>
  );
}
