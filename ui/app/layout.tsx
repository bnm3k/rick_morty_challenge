import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Rick & Morty Locations Search",
  description: "Search locations that appeared in the Rick & Morty show",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/concrete.css/3.0.0/concrete.min.css"
        />

        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>{children}</body>
    </html>
  );
}
