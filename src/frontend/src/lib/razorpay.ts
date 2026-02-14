let razorpayScriptLoaded = false;
let razorpayScriptLoading = false;
let razorpayScriptLoadPromise: Promise<void> | null = null;

export async function loadRazorpayScript(): Promise<void> {
  if (razorpayScriptLoaded) {
    return Promise.resolve();
  }

  if (razorpayScriptLoading && razorpayScriptLoadPromise) {
    return razorpayScriptLoadPromise;
  }

  razorpayScriptLoading = true;
  razorpayScriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      razorpayScriptLoaded = true;
      razorpayScriptLoading = false;
      resolve();
    };
    script.onerror = () => {
      razorpayScriptLoading = false;
      razorpayScriptLoadPromise = null;
      reject(new Error('Failed to load Razorpay script'));
    };
    document.body.appendChild(script);
  });

  return razorpayScriptLoadPromise;
}

interface RazorpayCheckoutOptions {
  keyId: string;
  amount: number;
  productName: string;
  productDescription: string;
  orderId?: string;
  onSuccess: (paymentId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  try {
    await loadRazorpayScript();

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    const razorpayOptions: RazorpayOptions = {
      key: options.keyId,
      amount: options.amount * 100,
      currency: 'INR',
      name: 'Tiny Root',
      description: options.productDescription,
      image: '/assets/generated/tinyroot-logo-transparent.dim_200x200.png',
      notes: options.orderId ? {
        order_id: options.orderId,
      } : undefined,
      handler: function (response: RazorpaySuccessResponse) {
        if (response.razorpay_payment_id) {
          options.onSuccess(response.razorpay_payment_id);
        } else {
          options.onError('Payment completed but no payment ID received');
        }
      },
      modal: {
        ondismiss: function () {
          options.onCancel();
        },
      },
      theme: {
        color: '#f97316',
      },
    };

    const rzp = new window.Razorpay(razorpayOptions);
    
    // Handle payment failures through a wrapper to catch errors
    const originalOpen = rzp.open.bind(rzp);
    rzp.open = function() {
      try {
        originalOpen();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to open payment modal';
        options.onError(errorMessage);
      }
    };

    rzp.open();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment';
    options.onError(errorMessage);
  }
}
