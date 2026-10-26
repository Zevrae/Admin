import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import { StoreProvider } from '../store/StoreProvider';
import '../index.css';

export const metadata: Metadata = {
  title: 'Zevrae Admin',
  description: 'Zevrae Control Panel — secure admin access',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StoreProvider>
            {children}
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
