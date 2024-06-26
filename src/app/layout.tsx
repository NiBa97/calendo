import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";

import { ChakraProvider } from "@chakra-ui/react";
export const metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <ChakraProvider>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
