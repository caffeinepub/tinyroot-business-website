import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Products } from './components/Products';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Products />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
