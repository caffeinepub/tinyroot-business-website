import { Sparkles, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Hero() {
  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="relative pt-20 min-h-screen flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/assets/generated/hero-skincare.dim_800x400.jpg"
          alt="Natural Skincare"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="inline-flex items-center gap-2 bg-accent/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">100% Natural & Pure</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Embrace Natural
            <span className="block text-primary">Beauty</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover the power of nature with Tinyroot. Our premium Multani Mitti products bring you
            the ancient secret of radiant, healthy skin through pure, natural ingredients.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={scrollToProducts}
              className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Explore Products
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
              <div className="text-3xl mb-3">🌿</div>
              <h3 className="font-semibold text-foreground mb-2">100% Natural</h3>
              <p className="text-sm text-muted-foreground">Pure ingredients from nature</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-semibold text-foreground mb-2">Skin Friendly</h3>
              <p className="text-sm text-muted-foreground">Gentle on all skin types</p>
            </div>
            <div className="bg-card/80 backdrop-blur-sm p-6 rounded-2xl border border-border/50">
              <div className="text-3xl mb-3">🇮🇳</div>
              <h3 className="font-semibold text-foreground mb-2">Made in India</h3>
              <p className="text-sm text-muted-foreground">Traditional quality assured</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
