import { Albert_Sans, Nova_Square } from 'next/font/google';
import './globals.css';
import React from "react";

const albertSans = Albert_Sans({ subsets: ['latin'], variable: '--font-albert' });
const novaSquare = Nova_Square({ weight: "400", subsets: ['latin'], variable: '--font-nova' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${albertSans.variable} ${novaSquare.variable}`}>
            <body className="min-h-screen bg-gray-50 text-gray-800">
                <header className="bg-green-600 text-white p-4">
                    <h1 className="text-2xl font-nova">Futbol 7</h1>
                    {/* Navbar: Add links based on role */}
                </header>
                <main className="container mx-auto p-4">{children}</main>
                <footer className="bg-gray-200 p-4 text-center">
                    <p>&copy; 2025 Futbol 7. All rights reserved.</p>
                </footer>
            </body>
        </html>
    );
}