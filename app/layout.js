import "./globals.css";

export const metadata = {
  title: "DigiFlow Hub v3 - Plateforme All-in-One",
  description: "Centralisez et optimisez toutes vos opérations digitales",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
