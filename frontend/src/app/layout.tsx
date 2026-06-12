import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MedLeave Portal - Medical Leave & Attendance Condonation System',
  description: 'Student medical leave approval and class condonation management system for universities.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-medical-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
