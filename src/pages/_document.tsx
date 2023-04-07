import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-orange-100 p-4 text-slate-700 dark:bg-zinc-800 dark:text-slate-100 sm:p-6 md:p-8 lg:p-10 xl:p-12">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
