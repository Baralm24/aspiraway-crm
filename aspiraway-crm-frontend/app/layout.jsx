import './globals.css';

export const metadata = {
  title: 'Aspiraway CRM',
  description: 'Role-based CRM for Aspiraway',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

