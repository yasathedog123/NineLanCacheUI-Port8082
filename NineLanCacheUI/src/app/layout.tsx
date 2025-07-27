import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nine LanCache UI",
  description: "A user interface for monitoring LanCache",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` antialiased`}
      >
         <div>
          <header className="text-gray-600 body-font">
            <div className="container mx-auto p-5">
              {/* Top row: logo, nav, logout */}
              <div className="flex items-center">
                <Link
                  href="/"
                  style={{ color: "#4CAF50" }}
                  className="flex title-font font-medium items-center mb-4 md:mb-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-10 h-10 text-white p-2 bg-green-500 rounded-full"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <span className="ml-3 text-xl">Nine LanCache UI</span>
                </Link>
                <nav className="flex flex-wrap items-center text-base justify-center md:border-l md:border-gray-40 md:mr-auto md:ml-4 md:py-1 md:pl-4">
                  <Link href="/" className="mr-5 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link href="/RecentDownloads" className="mr-5 hover:text-gray-900">
                    Recent Downloads
                  </Link>
                   <Link href="/RecentSteamDownloads" className="mr-5 hover:text-gray-900">
                    Recent Steam Downloads
                  </Link>
                  <Link href="/SteamGamesDownloaded" className="mr-5 hover:text-gray-900">
                    Steam Games Downloaded
                  </Link>
                  <Link href="/Stats" className="mr-5 hover:text-gray-900">
                    Stats
                  </Link>
                  <Link href="/Settings" className="mr-5 hover:text-gray-900">
                    Settings
                  </Link>
                </nav>
              </div>
            </div>
          </header>
      {children}
    </div>
      </body>
    </html>
  );
}
