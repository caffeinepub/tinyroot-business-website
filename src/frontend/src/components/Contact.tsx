import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Contact() {
  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'info@tinyroot.co.in',
      href: 'mailto:info@tinyroot.co.in',
      color: 'text-blue-600'
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+91 94621 12267',
      href: 'tel:+919462112267',
      color: 'text-green-600'
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: '+91 94621 12267',
      href: 'https://wa.me/919462112267',
      color: 'text-emerald-600'
    }
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our products? We'd love to hear from you. Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full bg-secondary ${item.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{item.label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-foreground mb-4">
                      {item.value}
                    </CardDescription>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full"
                    >
                      <a
                        href={item.href}
                        target={item.label === 'WhatsApp' ? '_blank' : undefined}
                        rel={item.label === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                      >
                        {item.label === 'Email' && 'Send Email'}
                        {item.label === 'Phone' && 'Call Now'}
                        {item.label === 'WhatsApp' && 'Chat on WhatsApp'}
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Business Hours */}
          <Card className="mt-8 border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Business Hours</CardTitle>
              <CardDescription>We're here to help you</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2">
                <p className="text-foreground font-medium">Monday - Saturday</p>
                <p className="text-muted-foreground">9:00 AM - 7:00 PM</p>
                <p className="text-foreground font-medium mt-4">Sunday</p>
                <p className="text-muted-foreground">10:00 AM - 5:00 PM</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
