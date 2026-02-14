import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Products } from './components/Products';
import { OrderForm } from './components/OrderForm';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { OrderManagementSection } from './components/admin/OrderManagementSection';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const checkHash = () => {
      setShowAdmin(window.location.hash === '#admin');
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  if (showAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
          <OrderManagementSection />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Products />
        <OrderForm />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
