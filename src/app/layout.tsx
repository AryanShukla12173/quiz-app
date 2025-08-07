import '@/app/globals.css'; 

export const metadata = {
  title: 'Quiz App',
  description: 'A platform for generating and using code test and administring it to users ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
