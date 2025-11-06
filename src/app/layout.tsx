import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import './globals.css';
import { Inter, EB_Garamond } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const garamond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-garamond',
});


export const metadata: Metadata = {
  title: 'Trendify',
  description: 'Transforme conteúdo em tendência.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${garamond.variable} scroll-mt-24 scroll-smooth`}>
      <head>
        <Script id="metamask-error-suppression" strategy="beforeInteractive">
          {`
            window.addEventListener('error', (event) => {
              if (event.message.includes('MetaMask') || (event.error && event.error.message && event.error.message.includes('MetaMask'))) {
                event.preventDefault();
                console.warn('MetaMask injection error suppressed.');
              }
            });
          `}
        </Script>
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
