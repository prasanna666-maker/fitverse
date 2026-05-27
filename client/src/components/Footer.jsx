import { Link } from "react-router-dom";
import { Dumbbell, Globe, MessageCircle, Heart, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">
                Fit<span className="text-accent-400">verse</span>
              </span>
            </Link>
            <p className="text-sm text-navy-300 leading-relaxed">
              Discover the best gyms, MMA centers, and fitness studios across Chennai.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2.5">
              {[
                { to: "/gyms", label: "All Gyms" },
                { to: "/gyms?type=MMA", label: "MMA Centers" },
                { to: "/gyms?type=Boxing", label: "Boxing Academies" },
                { to: "/map", label: "Map View" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-navy-300 hover:text-accent-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Popular Areas
            </h4>
            <ul className="space-y-2.5">
              {["Anna Nagar", "T. Nagar", "Adyar", "Velachery", "OMR"].map(
                (area) => (
                  <li key={area}>
                    <Link
                      to={`/gyms?area=${encodeURIComponent(area)}`}
                      className="text-sm text-navy-300 hover:text-accent-400 transition-colors"
                    >
                      {area}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Connect
            </h4>
            <div className="flex gap-3">
              {[
                { icon: Globe, href: "#" },
                { icon: MessageCircle, href: "#" },
                { icon: Heart, href: "#" },
                { icon: Mail, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-9 h-9 rounded-lg bg-navy-800/50 flex items-center justify-center text-navy-300 hover:text-accent-400 hover:bg-navy-700/50 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-navy-400">
            © {new Date().getFullYear()} Fitverse. Made with 🧡 in Chennai.
          </p>
        </div>
      </div>
    </footer>
  );
}
