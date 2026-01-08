import type { Metadata } from "next";
import "./globals.css";
import { BloodDripsContainer } from "@/components";

export const metadata: Metadata = {
    title: "Zombie Shooter 2D - Survive the Horde",
    description:
        "A terrifying 2D zombie shooter game. Survive waves of undead creatures in this horror-themed shooter!",
    keywords: ["zombie", "shooter", "game", "horror", "2d", "survival"],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="bg-abyss font-special text-bone">
                {/* Blood drip decorations */}
                <BloodDripsContainer count={5} />
                {children}
            </body>
        </html>
    );
}
