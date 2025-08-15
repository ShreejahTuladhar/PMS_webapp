import Footer from './Footer';

function About() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background matching home page */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"></div>
      
      {/* Hero Section with Traffic Animation */}
      <section className="relative py-20 overflow-hidden">
        {/* Warm street lighting ambience */}
        <div className="absolute inset-0 opacity-35">
          <div className="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-r from-yellow-200 to-blue-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
          <div className="absolute top-32 right-1/3 w-24 h-24 bg-gradient-to-r from-blue-100 to-yellow-100 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
          <div className="absolute bottom-20 left-1/6 w-28 h-28 bg-gradient-to-r from-yellow-100 to-blue-100 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '3.5s'}}></div>
        </div>
        
        {/* Moving traffic lights animation */}
        <div className="absolute inset-0">
          {/* Left to right traffic */}
          <div className="absolute top-1/4 left-0 w-16 h-4 bg-gradient-to-r from-transparent via-white to-blue-100 blur-sm animate-car-lights-lr opacity-60"></div>
          <div className="absolute top-1/4 left-0 w-12 h-3 bg-gradient-to-r from-transparent via-yellow-200 to-blue-200 blur-md animate-car-lights-lr-delay opacity-40" style={{animationDelay: '2s'}}></div>
          
          {/* Right to left traffic */}
          <div className="absolute bottom-1/3 right-0 w-16 h-4 bg-gradient-to-l from-transparent via-red-400 to-orange-500 blur-sm animate-car-lights-rl opacity-50"></div>
          <div className="absolute bottom-1/3 right-0 w-14 h-3 bg-gradient-to-l from-transparent via-red-300 to-yellow-400 blur-md animate-car-lights-rl-delay opacity-30" style={{animationDelay: '3s'}}></div>

          {/* Diagonal traffic flow */}
          <div className="absolute top-1/2 left-0 w-20 h-3 bg-gradient-to-r from-transparent via-cyan-200 to-white blur-sm animate-car-lights-diagonal opacity-40"></div>
        </div>

        {/* Balanced lighting ambience */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-10 left-1/3 w-28 h-28 bg-gradient-to-r from-white to-blue-100 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-gradient-to-r from-yellow-100 to-white rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        </div>

        {/* Urban glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/20 via-transparent to-blue-900/30"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
                About <span className="text-green-300">Park</span><span className="text-orange-300">Sathi</span>
              </h1>
              <p className="text-2xl md:text-3xl text-white/90 font-medium mb-8 drop-shadow-sm">
                Your friendly neighborhood parking helper, made by locals!
              </p>
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-blue-50/90 via-white/95 to-yellow-50/90 backdrop-blur-md rounded-2xl p-8 max-w-3xl shadow-xl border border-blue-200/50">
                  <p className="text-lg text-gray-700 font-medium leading-relaxed">
                    We're your friendly neighborhood parking solution! Built by Nepali people for Nepali people, 
                    we keep things <span className="text-green-600 font-semibold">simple, honest, and affordable</span> to help families and neighbors 
                    find safe parking spots without the hassle or high costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Why Choose Smart Parking Section */}
        <section className="mb-12 relative">
          <div className="bg-gradient-to-br from-blue-50/90 via-white/95 to-yellow-50/90 backdrop-blur-md rounded-3xl p-8 relative overflow-hidden border border-blue-200/50 shadow-xl">
            {/* Gentle light glows */}
            <div className="absolute top-4 right-8 w-16 h-16 bg-gradient-to-r from-white to-blue-50 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-6 left-12 w-12 h-12 bg-gradient-to-r from-yellow-50 to-white rounded-full blur-lg opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
            
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                Why Choose ParkSathi?
              </h2>
              <p className="text-gray-700 max-w-4xl mx-auto text-base font-medium leading-relaxed">
                Finding parking shouldn't be stressful! We understand the struggles of Kathmandu traffic and limited parking. 
                As your <span className="text-green-600 font-semibold">friendly neighborhood parking helper</span>, we connect you with local parking spots owned by 
                people in your community. It's <span className="text-orange-600 font-semibold">simple, affordable, and built with love</span> for our beautiful valley.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              What We Do
            </h2>
            <p className="text-white/90 max-w-3xl mx-auto text-base font-medium mb-6">
              We help <span className="text-green-300">neighbors connect with neighbors</span> to share parking spaces 
              in our community, making parking easier and more affordable for everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover:scale-102 border border-blue-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-blue-50 to-yellow-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full p-4 inline-block mb-4 shadow-md relative z-10">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700 relative z-10">Find Nearby Spots</h3>
              <p className="text-gray-600 font-medium relative z-10">
                <span className="text-green-600 font-semibold">Easily find</span> parking spots near where you're going, shared by friendly neighbors in your area.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="bg-yellow-400 rounded-full p-4 inline-block mb-4 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3a4 4 0 118 0v4m-4 0v7m-4-7h8" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10"> Easy Booking</h3>
              <p className="text-gray-700 font-medium relative z-10">
                <span className="text-orange-600 font-bold">Quick and simple</span> - book your spot with just a few taps and know it'll be waiting for you!
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="bg-yellow-400 rounded-full p-4 inline-block mb-4 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10"> Live Updates</h3>
              <p className="text-gray-700 font-medium relative z-10">
                Get <span className="text-orange-600 font-bold">real-time updates</span> so you always know which spots are free right now.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="bg-yellow-400 rounded-full p-4 inline-block mb-4 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">Fair Payment</h3>
              <p className="text-gray-700 font-medium relative z-10">
                <span className="text-orange-600 font-bold">Honest, fair pricing</span> with multiple ways to pay - cash, card, or mobile banking.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="bg-yellow-400 rounded-full p-4 inline-block mb-4 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10"> Local Suggestions</h3>
              <p className="text-gray-700 font-medium relative z-10">
                <span className="text-orange-600 font-bold">Friendly recommendations</span> based on where you're going and what works best for your vehicle.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="bg-yellow-400 rounded-full p-4 inline-block mb-4 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">Safe & Secure</h3>
              <p className="text-gray-700 font-medium relative z-10">
                <span className="text-orange-600 font-bold">Your safety matters</span> - we keep your information secure and your parking experience worry-free.
              </p>
            </div>
          </div>
        </section>

        {/* Simple How It Works */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-blue-50/90 via-white/95 to-yellow-50/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-blue-200/50">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">How ParkSathi Works</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
                <h3 className="text-sm font-semibold mb-2 text-gray-800">Find Spot</h3>
                <p className="text-xs text-gray-600">Search nearby parking</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
                <h3 className="text-sm font-semibold mb-2 text-gray-800">Pick & Book</h3>
                <p className="text-xs text-gray-600">Choose what fits your needs</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
                <h3 className="text-sm font-semibold mb-2 text-gray-800">Pay Easy</h3>
                <p className="text-xs text-gray-600">Multiple payment options</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3">4</div>
                <h3 className="text-sm font-semibold mb-2 text-gray-800">Park Happy</h3>
                <p className="text-xs text-gray-600">Your spot is waiting</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center mb-8">
          <div className="bg-gradient-to-br from-blue-50/90 via-white/95 to-yellow-50/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-blue-200/50">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Try ParkSathi?</h2>
            <p className="text-gray-700 text-base mb-6 max-w-2xl mx-auto">
              Join your neighbors in making parking easier for everyone in Kathmandu Valley.
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Parking with Neighbors
            </button>
          </div>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}

export default About;