import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-orange-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-100">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
