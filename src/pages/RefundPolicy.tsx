import Header from "@/components/Header";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-teal-900 dark:to-emerald-900">
      {/* Navigation */}
      <Header />
      
      {/* Refund Policy Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-800/30 backdrop-blur-md rounded-lg shadow-lg border border-white/20 dark:border-teal-500/20 p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 border-b pb-4 border-teal-500/30">Refund & Exchange Policy</h1>
            <p className="text-muted-foreground mb-6">Last updated: March 18, 2024</p>
            
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">REFUND POLICY</h2>
                
                <p className="text-foreground mb-4">
                  A Refund Request will be deemed valid only if made within 7 days from the time of receiving physical AR chemistry cards. The request must be made through an email to 
                  chemouflage.edu@gmail.com specifying the customer's name, email address and the phone number used during registration.
                </p>
                
                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Conditions when refund request will be considered:</h3>
                <ul className="list-disc list-inside space-y-2 text-foreground ml-4 mb-4">
                  <li>Products received are damaged or defective (Need enough evidence)</li>
                  <li>AR chemistry cards do not function properly with the Chemouflage app</li>
                </ul>
                
                <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Conditions when refund request will not be considered:</h3>
                <ul className="list-disc list-inside space-y-2 text-foreground ml-4 mb-4">
                  <li>Physical AR chemistry cards have been used, damaged, or marked by the customer</li>
                  <li>Digital content has been accessed and used beyond a reasonable evaluation period</li>
                  <li>The purchased item is already an exchanged product based on a prior refund request</li>
                  <li>Violation of community guidelines or terms of service</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground mb-4">
                  After a refund request has been processed, the user will receive a confirmation email from chemouflage.edu@gmail.com 
                  mentioning the Transaction ID or Reference number. For digital products, access will be revoked. If a user wishes to 
                  regain access, they will need to re-purchase the product.
                </p>
                
                <p className="text-foreground mb-4">
                  Refunds shall be made to the bank, mobile financial services account, or card with which the purchase was made 
                  within 10 business days of the refund request being successfully processed and approved by Chemouflage. A confirmation 
                  email will be sent once the process is completed.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">EXCHANGE POLICY</h2>
                <p className="text-foreground mb-4">
                  An Exchange Request will be deemed valid only if made within 7 days from receiving physical products. The request must be made through an email to chemouflage.edu@gmail.com specifying the 
                  customer's email address and the phone number used during registration.
                </p>
                
                <p className="text-foreground mb-4">
                  Products can be exchanged if they were not exchanged before and the price of the new product is the same as 
                  the existing product or higher. If the price is higher, the customer must pay the additional amount. For physical 
                  products, the customer is responsible for returning the original product in unused condition.
                </p>
              </div>

              <div>
                <p className="text-foreground mt-6 font-medium border-t border-teal-500/30 pt-6">
                  Chemouflage has full authority to change this Refund and Exchange Policy from time to time and on a 
                  case-by-case basis.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
                <p className="text-foreground">
                  If you have any questions about our Refund & Exchange Policy, You can contact us:
                </p>
                <p className="text-foreground font-medium mt-2">
                  By email: <a href="mailto:chemouflage.edu@gmail.com" className="text-teal-500 hover:text-teal-400">chemouflage.edu@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RefundPolicy;