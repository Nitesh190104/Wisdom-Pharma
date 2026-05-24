import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="font-bold text-xl text-white">Wisdom Pharma</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">Your trusted pharmaceutical partner for wholesale and retail medicine distribution across India.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {[['/', 'Home'], ['/medicines', 'Medicines'], ['/about', 'About Us'], ['/contact', 'Contact']].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-sm text-slate-400 hover:text-primary-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2.5">
              {['Retail Purchase', 'Wholesale Orders', 'Prescription Upload', 'Bulk Discounts'].map((item) => (
                <li key={item} className="text-sm text-slate-400">{item}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <HiOutlineLocationMarker className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                Meera Nagar, Kandawa, Kanchanpur, Chitayipur, Varanasi, Uttar Pradesh - 221008
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <HiOutlinePhone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                +91 76520 45125
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <HiOutlineMail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                wisdompharma866@gmail.com
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Wisdom Pharma. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-sm text-slate-500 hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="text-sm text-slate-500 hover:text-slate-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
