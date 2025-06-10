import CloudinaryImage from "@/components/CloudinaryImage";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { contactService } from "@/services/contact";
import {
  ArrowLeft,
  Clock,
  Facebook,
  FlaskConical,
  Globe,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Contact = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      if (
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.subject.trim() ||
        !formData.message.trim()
      ) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields.",
          variant: "destructive",
        });
        return;
      }

      // Send message using the contact service
      const response = await contactService.sendMessage(formData);

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Message Sent!",
        description:
          "Thank you for contacting us. We'll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <CloudinaryImage
              fileName="logoRound_1_yn0smh.png"
              alt="Chemouflage Logo"
              className="w-16 h-16 object-contain"
              width={64}
              height={64}
            />
            <FlaskConical className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about our AR Chemistry Cards? We're here to help!
            Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-background/80 backdrop-blur-lg border border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Send us a Message
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Fill out the form below and we'll respond within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-foreground">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Message"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Contact Details */}
            <Card className="bg-background/80 backdrop-blur-lg border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Contact Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Get in touch with us through any of these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <p className="text-muted-foreground">
                      support@chemouflage.com
                    </p>
                    <p className="text-sm text-muted-foreground">
                      We respond within 24 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <p className="text-muted-foreground">+880 1234-567890</p>
                    <p className="text-sm text-muted-foreground">
                      Mon-Fri, 9 AM - 6 PM (GMT+6)
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground">Address</h3>
                    <p className="text-muted-foreground">Dhaka, Bangladesh</p>
                    <p className="text-sm text-muted-foreground">
                      Research & Development Center
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="bg-background/80 backdrop-blur-lg border border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monday - Friday</span>
                  <span className="text-foreground font-medium">
                    9:00 AM - 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saturday</span>
                  <span className="text-foreground font-medium">
                    10:00 AM - 4:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sunday</span>
                  <span className="text-foreground font-medium">Closed</span>
                </div>
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    📧 Email support is available 24/7. We'll respond to your
                    message as soon as possible during business hours.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-background/80 backdrop-blur-lg border border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Follow Us</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Stay updated with our latest news and announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-background/40"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-background/40"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-background/80 backdrop-blur-lg border border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-foreground">
                Frequently Asked Questions
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Quick answers to common questions about our AR Chemistry Cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      How do the AR cards work?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Simply scan the QR codes on our chemistry cards with your
                      smartphone to view 3D molecular structures and interactive
                      simulations.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      What devices are supported?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Our AR experience works on iOS and Android devices with
                      camera support. No additional hardware required!
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Do I need an internet connection?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      An internet connection is required for the initial setup
                      and to access the latest content updates.
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      How many cards are included?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Each set includes 15+ premium cards covering essential
                      chemistry concepts and molecular structures.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      What's the delivery time?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Delivery within Dhaka takes 1-2 days, and 3-5 days for
                      other locations in Bangladesh.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Can I track my order?
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Yes! You'll receive tracking information via email once
                      your order ships.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="bg-background/80 backdrop-blur-lg border border-border">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Ready to Experience AR Chemistry?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Transform your chemistry learning with our innovative AR cards.
                Get your set today and discover molecules like never before!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Link to="/checkout">
                    <FlaskConical className="w-5 h-5 mr-2" />
                    Order Now
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-border text-foreground hover:bg-background/40"
                >
                  <Link to="/">Learn More</Link>
                </Button>
              </div>
              <div className="mt-6 flex justify-center">
                <Badge className="bg-emerald-600 text-white">
                  Free shipping on orders over ৳1000
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
