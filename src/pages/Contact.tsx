import CloudinaryImage from "@/components/CloudinaryImage";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <Link
          to="/"
          className="inline-flex items-center text-white hover:text-teal-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

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
            <div>
              <h1 className="text-4xl font-bold text-white">Contact Us</h1>
              <p className="text-teal-300 text-lg">
                Get in Touch with Chemouflage
              </p>
            </div>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Have questions about our AR chemistry products? Need support? We're
            here to help you revolutionize chemistry education.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Info */}
            <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FlaskConical className="w-5 h-5 mr-2" />
                  Chemouflage
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Revolutionary AR Chemistry Education
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Address</p>
                    <p className="text-gray-300">
                      Dhaka, Bangladesh, 1000
                      <br />
                      Bangladesh
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Phone</p>
                    <p className="text-gray-300">+880 1855-614426</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-300">support@chemouflage.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Business Hours</p>
                    <p className="text-gray-300">
                      Sunday - Thursday: 9:00 AM - 6:00 PM
                      <br />
                      Friday - Saturday: 10:00 AM - 4:00 PM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Connect With Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a
                  href="https://www.facebook.com/chemouflage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-blue-600/20 rounded-lg border border-blue-500/30 hover:bg-blue-600/30 transition-colors group"
                >
                  <Facebook className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                  <div>
                    <p className="text-white font-medium">Facebook</p>
                    <p className="text-gray-300 text-sm">@chemouflage</p>
                  </div>
                </a>

                <div className="flex items-center space-x-3 p-3 bg-teal-900/20 rounded-lg border border-teal-500/30">
                  <Globe className="w-5 h-5 text-teal-400" />
                  <div>
                    <p className="text-white font-medium">Website</p>
                    <p className="text-gray-300 text-sm">www.chemouflage.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Facts */}
            <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
              <CardHeader>
                <CardTitle className="text-white">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Founded</span>
                  <Badge className="bg-teal-600 text-white">2024</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Specialty</span>
                  <Badge className="bg-emerald-600 text-white">
                    AR Education
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Focus</span>
                  <Badge className="bg-blue-600 text-white">Chemistry</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Products</span>
                  <Badge className="bg-purple-600 text-white">AR Cards</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-teal-900/20 backdrop-blur-lg border-teal-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Send Us a Message
                </CardTitle>
                <CardDescription className="text-gray-300">
                  We'd love to hear from you. Send us a message and we'll
                  respond as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
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
                        className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
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
                        className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">
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
                      className="bg-white/10 border-teal-500/30 text-white placeholder:text-gray-400 focus:border-teal-400 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white py-3"
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-emerald-900/20 backdrop-blur-lg border-emerald-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                      <FlaskConical className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        AR Chemistry Cards
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Revolutionary learning experience
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/20 backdrop-blur-lg border-blue-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">24/7 Support</h3>
                      <p className="text-gray-300 text-sm">
                        We're here to help you succeed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-gray-400 text-sm">
            For urgent inquiries, please call us directly at{" "}
            <span className="text-teal-400 font-semibold">
              +880 1855-614426
            </span>
          </p>
          <p className="text-gray-500 text-xs mt-2">
            We typically respond to emails within 24 hours during business days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
