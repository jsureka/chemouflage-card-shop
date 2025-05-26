
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';

const Checkout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const product = {
    name: "Chemouflage Pro",
    price: 99.99,
    originalPrice: 149.99,
    image: "🛡️"
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Order Successful!",
        description: "Your payment has been processed successfully.",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-white hover:text-purple-300 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Checkout Form */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Secure Checkout
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your information is protected with 256-bit SSL encryption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Contact Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <Separator className="bg-white/20" />

                {/* Billing Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Billing Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-white">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="123 Main Street"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-white">City</Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="New York"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-white">State</Label>
                      <Input
                        id="state"
                        name="state"
                        type="text"
                        placeholder="NY"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-white">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-white">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        type="text"
                        placeholder="United States"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/20" />

                {/* Payment Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardName" className="text-white">Name on Card</Label>
                    <Input
                      id="cardName"
                      name="cardName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      required
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-white">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      required
                      className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate" className="text-white">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-white">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        type="text"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        required
                        className="bg-white/20 border-white/30 text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? "Processing..." : `Complete Purchase - $${product.price}`}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-fit">
            <CardHeader>
              <CardTitle className="text-white">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
                <div className="text-4xl">{product.image}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  <p className="text-gray-300 text-sm">Premium Security Suite</p>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">${product.price}</div>
                  <div className="text-gray-400 text-sm line-through">${product.originalPrice}</div>
                </div>
              </div>

              <Separator className="bg-white/20" />

              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${product.originalPrice}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Discount (33% OFF)</span>
                  <span>-${(product.originalPrice - product.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>$0.00</span>
                </div>
              </div>

              <Separator className="bg-white/20" />

              <div className="flex justify-between text-xl font-bold text-white">
                <span>Total</span>
                <span>${product.price}</span>
              </div>

              <div className="mt-4">
                <Badge className="bg-green-600 text-white">
                  Limited Time Offer - 33% OFF
                </Badge>
              </div>

              <div className="text-xs text-gray-400 mt-4">
                🔒 Your payment information is secure and encrypted. We never store your credit card details.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
