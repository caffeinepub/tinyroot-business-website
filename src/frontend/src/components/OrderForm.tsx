import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, CheckCircle2, Loader2, CreditCard, XCircle, AlertCircle } from 'lucide-react';
import { useCreateOrder } from '@/hooks/useQueries';
import { useMarkOrderAsPaid } from '@/hooks/useMarkOrderAsPaid';
import { useRazorpayKeyId } from '@/hooks/useRazorpayKeyId';
import { openRazorpayCheckout } from '@/lib/razorpay';
import type { Order, AddressType, PaymentStatus, OrderStatus } from '../backend';

interface OrderFormData {
  customerName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  product: '100gm' | '200gm' | '';
  quantity: string;
  notes: string;
}

const initialFormData: OrderFormData = {
  customerName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  zip: '',
  product: '',
  quantity: '1',
  notes: '',
};

type PaymentUIState = 'idle' | 'processing' | 'success' | 'cancelled' | 'error' | 'backend-error';

export function OrderForm() {
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderFormData, string>>>({});
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentUIState>('idle');
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string>('');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState<string>('');

  const createOrderMutation = useCreateOrder();
  const markOrderAsPaidMutation = useMarkOrderAsPaid();
  const { data: razorpayKeyId, isLoading: isKeyLoading, isError: isKeyError } = useRazorpayKeyId();

  const handleChange = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OrderFormData, string>> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.zip.trim()) {
      newErrors.zip = 'ZIP code is required';
    }
    if (!formData.product) {
      newErrors.product = 'Please select a product';
    }
    if (!formData.quantity || parseInt(formData.quantity) < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const productPrice = formData.product === '100gm' ? 139 : 180;
    const quantity = parseInt(formData.quantity);
    const totalAmount = productPrice * quantity;

    const order: Order = {
      orderId: BigInt(0),
      customerId: formData.email || formData.phone,
      customerPrincipal: undefined,
      orderDate: BigInt(Date.now() * 1_000_000),
      totalAmount: BigInt(totalAmount),
      items: [
        {
          productId: `multani-mitti-${formData.product}`,
          name: `Multani Mitti ${formData.product}`,
          price: BigInt(productPrice),
          size: formData.product,
          ingredients: ['Multani Mitti', 'Fuller\'s Earth'],
          category: undefined,
          dietaryInfo: [],
          nutritionalInfo: undefined,
          itemType: undefined,
          quantity: BigInt(quantity),
        },
      ],
      status: 'pending' as OrderStatus,
      contactInfo: {
        customerName: formData.customerName,
        email: formData.email || 'noemail@tinyroot.co.in',
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          zip: formData.zip,
          addressType: 'shipping' as AddressType,
        },
        billingAddress: {
          street: formData.street,
          city: formData.city,
          zip: formData.zip,
          addressType: 'billing' as AddressType,
        },
      },
      paymentStatus: 'pending' as PaymentStatus,
      specialInstructions: formData.notes || undefined,
    };

    try {
      const result = await createOrderMutation.mutateAsync(order);
      setCreatedOrder(result);
      setFormData(initialFormData);
      setPaymentState('idle');
    } catch (error) {
      console.error('Order submission failed:', error);
    }
  };

  const handlePayNow = async () => {
    if (!createdOrder || !razorpayKeyId) return;

    setPaymentState('processing');
    setPaymentErrorMessage('');

    try {
      await openRazorpayCheckout({
        keyId: razorpayKeyId,
        amount: Number(createdOrder.totalAmount),
        productName: `Order #${createdOrder.orderId}`,
        productDescription: `${createdOrder.items.map(i => i.name).join(', ')}`,
        orderId: createdOrder.orderId.toString(),
        onSuccess: async (paymentId) => {
          setRazorpayPaymentId(paymentId);
          try {
            await markOrderAsPaidMutation.mutateAsync({
              orderId: createdOrder.orderId,
              razorpayPaymentId: paymentId,
            });
            setPaymentState('success');
          } catch (error) {
            console.error('Failed to mark order as paid:', error);
            setPaymentState('backend-error');
            setPaymentErrorMessage(
              `Payment successful but failed to update order status. Please contact support with Order ID: ${createdOrder.orderId} and Payment ID: ${paymentId}`
            );
          }
        },
        onCancel: () => {
          setPaymentState('cancelled');
          setPaymentErrorMessage('Payment was cancelled. You can try again when ready.');
        },
        onError: (error) => {
          setPaymentState('error');
          setPaymentErrorMessage(error || 'Payment failed. Please try again.');
        },
      });
    } catch (error) {
      setPaymentState('error');
      setPaymentErrorMessage('Unable to process payment. Please try again.');
    }
  };

  const handleNewOrder = () => {
    setCreatedOrder(null);
    setPaymentState('idle');
    setPaymentErrorMessage('');
    setRazorpayPaymentId('');
  };

  return (
    <section id="order" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-primary border-primary">
            Place Your Order
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Order Details
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fill in your details below and we'll get your order ready for delivery
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {createdOrder ? 'Order Created' : 'Customer Information'}
            </CardTitle>
            <CardDescription>
              {createdOrder
                ? 'Your order has been created. Complete payment to confirm.'
                : 'Please provide your contact and delivery details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Post-Order Payment Panel */}
            {createdOrder && (
              <div className="space-y-4">
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Order ID:</span>
                      <Badge variant="outline" className="font-mono">
                        #{createdOrder.orderId.toString()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Amount:</span>
                      <span className="text-2xl font-bold">₹{Number(createdOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Items:</span>
                      <span>{createdOrder.items.map(i => `${i.name} (${i.quantity})`).join(', ')}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Status Messages */}
                {paymentState === 'success' && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Payment successful! Your order has been confirmed. We will contact you shortly.
                    </AlertDescription>
                  </Alert>
                )}

                {paymentState === 'cancelled' && (
                  <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
                    <XCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      {paymentErrorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {paymentState === 'error' && (
                  <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {paymentErrorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {paymentState === 'backend-error' && (
                  <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {paymentErrorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {isKeyError && (
                  <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                      Payment system is currently unavailable. Please contact support to complete your order.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Payment Actions */}
                <div className="flex gap-3">
                  {paymentState !== 'success' && (
                    <Button
                      onClick={handlePayNow}
                      className="flex-1"
                      size="lg"
                      disabled={paymentState === 'processing' || isKeyLoading || !razorpayKeyId}
                    >
                      {paymentState === 'processing' ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay Now
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={handleNewOrder}
                    variant="outline"
                    size="lg"
                    className={paymentState === 'success' ? 'flex-1' : ''}
                  >
                    {paymentState === 'success' ? 'Place New Order' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}

            {/* Order Form */}
            {!createdOrder && (
              <>
                {createOrderMutation.isError && (
                  <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      Failed to submit order. Please try again or contact us directly.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Details</h3>
                    
                    <div>
                      <Label htmlFor="customerName">
                        Full Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleChange('customerName', e.target.value)}
                        placeholder="Enter your full name"
                        className={errors.customerName ? 'border-destructive' : ''}
                      />
                      {errors.customerName && (
                        <p className="text-sm text-destructive mt-1">{errors.customerName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+91 XXXXX XXXXX"
                        className={errors.phone ? 'border-destructive' : ''}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Delivery Address</h3>
                    
                    <div>
                      <Label htmlFor="street">
                        Street Address <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="street"
                        value={formData.street}
                        onChange={(e) => handleChange('street', e.target.value)}
                        placeholder="House/Flat No., Street Name"
                        className={errors.street ? 'border-destructive' : ''}
                      />
                      {errors.street && (
                        <p className="text-sm text-destructive mt-1">{errors.street}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">
                          City <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleChange('city', e.target.value)}
                          placeholder="City"
                          className={errors.city ? 'border-destructive' : ''}
                        />
                        {errors.city && (
                          <p className="text-sm text-destructive mt-1">{errors.city}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="zip">
                          ZIP Code <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="zip"
                          value={formData.zip}
                          onChange={(e) => handleChange('zip', e.target.value)}
                          placeholder="123456"
                          className={errors.zip ? 'border-destructive' : ''}
                        />
                        {errors.zip && (
                          <p className="text-sm text-destructive mt-1">{errors.zip}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Product Details</h3>
                    
                    <div>
                      <Label htmlFor="product">
                        Select Product <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.product}
                        onValueChange={(value) => handleChange('product', value)}
                      >
                        <SelectTrigger className={errors.product ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Choose product size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="100gm">Multani Mitti 100gm - ₹139</SelectItem>
                          <SelectItem value="200gm">Multani Mitti 200gm - ₹180</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.product && (
                        <p className="text-sm text-destructive mt-1">{errors.product}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="quantity">
                        Quantity <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={(e) => handleChange('quantity', e.target.value)}
                        className={errors.quantity ? 'border-destructive' : ''}
                      />
                      {errors.quantity && (
                        <p className="text-sm text-destructive mt-1">{errors.quantity}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="notes">Special Instructions (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Any special delivery instructions or preferences..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Place Order
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
