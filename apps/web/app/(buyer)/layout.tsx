import { Navbar } from '@/components/buyer/navbar';
import { Footer } from '@/components/buyer/footer';

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
