import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Multani Mitti',
    weight: '100gm',
    price: 139,
    image: '/assets/100gm%20Front.jpg',
    description: 'Premium quality Multani Mitti (Fuller\'s Earth) for deep cleansing and natural glow. Perfect for face masks and skin treatments.',
    benefits: ['Deep Cleansing', 'Oil Control', 'Natural Glow'],
    popular: true
  },
  {
    id: 2,
    name: 'Multani Mitti',
    weight: '200gm',
    price: 180,
    image: '/assets/200gm%20Front.jpg',
    description: 'Value pack of pure Multani Mitti for extended skincare routine. Ideal for regular use and family needs.',
    benefits: ['Value Pack', 'Long Lasting', 'Cost Effective'],
    popular: false
  }
];

export function Products() {
  const handleOrderNow = () => {
    const element = document.getElementById('order');
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
    <section id="products" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Our Products
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Natural Skincare Solutions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the traditional beauty secret with our premium Multani Mitti products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
              {product.popular && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">
                  ⭐ Most Popular
                </div>
              )}
              <CardHeader className="p-0">
                <div className="aspect-square overflow-hidden bg-secondary/50">
                  <img
                    src={product.image}
                    alt={`${product.name} ${product.weight}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <CardTitle className="text-2xl mb-1">{product.name}</CardTitle>
                    <CardDescription className="text-lg font-semibold text-primary">
                      {product.weight}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-foreground">
                    ₹{product.price}
                  </p>
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {product.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.benefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button
                  onClick={handleOrderNow}
                  className="w-full rounded-full"
                  size="lg"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Order Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-accent/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-border">
            <p className="text-sm text-muted-foreground">
              💚 All products are 100% natural and chemical-free
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
