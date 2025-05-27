
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-r from-teal-600 to-emerald-600">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Chemistry Learning?
        </h2>
        <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
          Join thousands of students already experiencing the future of chemistry education
        </p>
        <Button 
          size="lg" 
          className="bg-white text-teal-600 hover:bg-slate-100 px-8 py-4 text-lg font-semibold"
          onClick={() => navigate('/checkout')}
        >
          Start Learning Today - Only ৳199
        </Button>
      </div>
    </section>
  );
};
