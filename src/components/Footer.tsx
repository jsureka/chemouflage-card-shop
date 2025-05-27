
export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mb-4">
              Chemouflage
            </h3>
            <p className="text-slate-400">
              Revolutionizing chemistry education through augmented reality technology.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-slate-300">Quick Links</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-teal-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-teal-400 transition-colors">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-slate-300">Contact</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Email: info@chemouflage.com</li>
              <li>Phone: +880 123 456 789</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 Chemouflage. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
