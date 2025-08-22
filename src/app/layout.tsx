import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Scotty",
  description: "Beam your words anywhere",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
