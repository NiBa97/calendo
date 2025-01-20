import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "~/contexts/providers";
import TaskEditModal from "~/components/task-edit-modal";

export const metadata = {
  title: "Calendo",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <TRPCReactProvider>
          <Providers>
            {children} <TaskEditModal />
          </Providers>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
