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
                <svg
                  width="20"
                  height="16"
                  viewBox="0 0 40 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-4"
                >
                  {/* Mobile Phone (laying flat) */}
                  <rect
                    x="4"
                    y="16"
                    width="32"
                    height="12"
                    rx="3"
                    ry="3"
                    fill="#1E3A8A"
                  />
                  
                  {/* Phone Screen */}
                  <rect
                    x="6"
                    y="18"
                    width="28"
                    height="8"
                    rx="1"
                    ry="1"
                    fill="#3B82F6"
                  />
                  
                  {/* Car Body (on top of phone) */}
                  <rect
                    x="14"
                    y="8"
                    width="12"
                    height="6"
                    rx="2"
                    ry="2"
                    fill="#2563EB"
                  />
                  
                  {/* Car Wheels */}
                  <circle
                    cx="17"
                    cy="16"
                    r="2"
                    fill="#374151"
                  />
                  <circle
                    cx="23"
                    cy="16"
                    r="2"
                    fill="#374151"
                  />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-200/30 to-blue-200/30 rounded-xl blur-sm opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-700">
                Park<span className="text-blue-600">Sathi</span>
              </h3>
              <p className="text-xs text-gray-500 font-medium">Smart Parking Solutions</p>
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