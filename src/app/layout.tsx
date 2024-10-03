import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "~/contexts/providers";
import { getServerAuthSession } from "~/server/auth";

export const metadata = {
  title: "Calendo",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const serverSession = await getServerAuthSession();

  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <TRPCReactProvider>
          <Providers serverSession={serverSession}>{children}</Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
