function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-100 via-white to-yellow-100 border-t border-blue-200/50 py-8 relative overflow-hidden">
      {/* Gentle light glows */}
      <div className="absolute top-0 left-1/4 w-32 h-16 bg-gradient-to-r from-white to-blue-50 rounded-full blur-2xl opacity-30"></div>
      <div className="absolute top-0 right-1/4 w-24 h-16 bg-gradient-to-r from-yellow-50 to-white rounded-full blur-xl opacity-40"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="p-2 rounded-xl bg-white/90 shadow-md transform transition-all duration-300 group-hover:scale-105">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.2 3-3.3 3-5.7 0-3.9-3.1-7-7-7z"/>
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-200/30 to-blue-200/30 rounded-xl blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-700">
                Park<span className="text-blue-600">Smart</span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">💡 Smart Parking Solutions</p>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              1Ox4Fox.Inc
            </p>
            <p className="text-xs text-gray-600 font-medium">
              © 2025 Licence Copy - All Rights Reserved
            </p>
            <p className="text-xs text-gray-500">
              Copyright - Intellectual Property Protected
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="flex items-center space-x-2 pt-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;