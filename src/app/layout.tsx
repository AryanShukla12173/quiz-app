// app/layout.tsx
import { AuthProvider } from '@/context/AuthContext';
import '@/app/globals.css'; // Tailwind styles, etc.

export const metadata = {
  title: 'Quiz App',
  description: 'A platform for generating and ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">
        <AuthProvider>
          {children} {/* This renders your dashboard or other pages */}
        </AuthProvider>
      </body>
    </html>
  );
}
