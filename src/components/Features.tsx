
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Atom, Beaker, Microscope, Shield, Play, Users } from "lucide-react";

const features = [
  {
    icon: Atom,
    title: "3D Molecular Models",
    description: "Visualize atoms and molecules in stunning 3D detail with AR technology."
  },
  {
    icon: Beaker,
    title: "Virtual Experiments",
    description: "Conduct safe chemistry experiments in a controlled virtual environment."
  },
  {
    icon: Microscope,
    title: "Interactive Learning",
    description: "Explore chemical reactions and processes through interactive simulations."
  },
  {
    icon: Shield,
    title: "Safe Environment",
    description: "Learn without the risks associated with real chemical handling."
  },
  {
    icon: Play,
    title: "Gamified Learning",
    description: "Make chemistry fun with engaging games and challenges."
  },
  {
    icon: Users,
    title: "Collaborative Platform",
    description: "Learn together with classmates in shared virtual spaces."
  }
];

export const Features = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Why Choose Chemouflage?
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Revolutionary AR technology meets comprehensive chemistry education
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-slate-800">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
