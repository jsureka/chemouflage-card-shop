import CloudinaryImage from "./CloudinaryImage";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <div className="bg-background/80 backdrop-blur-lg border-t border-teal-500/30 py-12">
            <div className="container mx-auto px-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="space-y-4">
                    {" "}
                    <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-foreground">
                        Chemouflage
                    </span>
                    </div>
                    <p className="text-muted-foreground">
                    Revolutionary AR chemistry education platform for next
                    generation scientists.
                    </p>
                    <a 
                        href="https://play.google.com/store/apps/details?id=com.Eduflage.Chemouflage&hl=en" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block hover:opacity-80 transition-opacity"
                    >
                    <img 
                        src="/google-play.svg" 
                        alt="Get it on Google Play" 
                        className="w-full h-auto max-w-[200px]"
                    />
                    </a>
                </div>{" "}
                <div>
                    <h3 className="text-foreground font-semibold mb-4">Products</h3>
                    <ul className="space-y-2 text-muted-foreground">
                    <li>
                        <Link
                        to="/checkout"
                        className="hover:text-teal-400 transition-colors"
                        >
                        AR Chemistry Cards
                        </Link>
                    </li>
                    </ul>
                </div>{" "}
                <div>
                    <h3 className="text-foreground font-semibold mb-4">Support</h3>
                    <ul className="space-y-2 text-muted-foreground">
                    <li>
                        <Link
                        to="/track-order"
                        className="hover:text-teal-400 transition-colors"
                        >
                        Track Order
                        </Link>
                    </li>
                    <li>
                        <Link
                        to="/contact"
                        className="hover:text-teal-400 transition-colors"
                        >
                        Contact Us
                        </Link>
                    </li>
                    </ul>
                </div>{" "}
                <div>
                    <h3 className="text-foreground font-semibold mb-4">Connect</h3>
                    <ul className="space-y-2 text-muted-foreground">
                    <li>
                        <a
                        href="https://www.facebook.com/chemouflage"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-teal-400 transition-colors"
                        >
                        Facebook
                        </a>
                    </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-foreground font-semibold mb-4">Company</h3>
                    <ul className="space-y-2 text-muted-foreground">
                    <li>
                        <a
                        href="https://www.facebook.com/chemouflage"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-teal-400 transition-colors"
                        >
                        About Us
                        </a>
                    </li>
                    <li>
                        <Link
                        to="/terms-and-conditions"
                        className="hover:text-teal-400 transition-colors"
                        >
                        Terms & Conditions
                        </Link>
                    </li>
                    <li>
                        <Link
                        to="/privacy-policy"
                        className="hover:text-teal-400 transition-colors"
                        >
                        Privacy Policy
                        </Link>
                    </li>
                    <li>
                        <Link
                        to="/refund-exchange-policy"
                        className="hover:text-teal-400 transition-colors"
                        >
                        Refund Policy
                        </Link>
                    </li>
                    </ul>
                </div>
                </div>{" "}
                <div className="border-t border-teal-500/30 mt-8 pt-8 text-center text-muted-foreground">
                <div className="flex items-center justify-center">
                    {" "}
                    <CloudinaryImage
                    fileName="Footer-Logo_vd1b65.png"
                    alt="AamarPay - Secure Payment Gateway"
                    className="h-6 opacity-80 hover:opacity-100 transition-opacity"
                    height={24}
                    width={400}
                    />
                </div>
                <p>&copy; 2025 Chemouflage. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}

export default Footer;