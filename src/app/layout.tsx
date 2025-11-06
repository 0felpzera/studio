import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import './globals.css';
import { Inter, Poppins } from 'next/font/google';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900']
});


export const metadata: Metadata = {
  title: 'ViralBoost AI',
  description: 'Sua plataforma de IA para viralizar nas redes sociais.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} scroll-mt-24 scroll-smooth`}>
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
      <body className="font-body antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
