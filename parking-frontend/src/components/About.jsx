import Footer from './Footer';

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Balanced Hero Section with Traffic Animation */}
      <section className="relative py-20 overflow-hidden">
        {/* Balanced Light Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-yellow-100 to-blue-300"></div>
        
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

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-700 mb-6 tracking-tight drop-shadow-sm">
                About <span className="text-blue-600">💡 ParkSmart</span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-600 font-medium mb-8 drop-shadow-sm">
                A Digital Parking Management System combining technology and human innovation
              </p>
              <div className="flex justify-center">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-3xl shadow-lg border-2 border-blue-200">
                  <p className="text-lg text-gray-700 font-medium leading-relaxed">
                    💡 Our system uses as few resources as possible to achieve faster and easier parking of vehicles, 
                    providing <span className="text-blue-600 font-semibold">real-time intelligent data</span> about parking availability to assist drivers in urban areas where 
                    finding secure parking space is increasingly difficult.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        {/* Why Choose Smart Parking Section */}
        <section className="mb-16 relative">
          <div className="bg-gradient-to-r from-blue-100 via-white to-yellow-100 rounded-3xl p-12 relative overflow-hidden border border-blue-200/50">
            {/* Gentle light glows */}
            <div className="absolute top-4 right-8 w-16 h-16 bg-gradient-to-r from-white to-blue-50 rounded-full blur-xl opacity-40 animate-pulse"></div>
            <div className="absolute bottom-6 left-12 w-12 h-12 bg-gradient-to-r from-yellow-50 to-white rounded-full blur-lg opacity-50 animate-pulse" style={{animationDelay: '1s'}}></div>
            
            <div className="text-center mb-12 relative z-10">
              <h2 className="text-4xl font-bold text-gray-700 mb-6 flex items-center justify-center gap-3">
                <span className="text-4xl">💡</span> Why Choose Smart Parking?
              </h2>
              <p className="text-gray-600 max-w-4xl mx-auto text-lg font-medium leading-relaxed">
                Searching for parking space creates congestion, accidents, and pollution. Parking along the road 
                brings out insecurity of vehicles and some avoid paying parking fees which is a challenge to parking 
                owners and administrators. Our <span className="text-blue-600 font-semibold">Smart Parking Management System</span> services significantly ease these problems 
                by <span className="text-blue-600 font-semibold">guiding drivers intelligently</span> to available parking spaces, improving efficiency and reducing revenue loss.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-700 mb-6 flex items-center justify-center gap-3">
              <span className="text-4xl">🎯</span> Our Smart Objectives
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg font-medium mb-8">
              To develop a comprehensive <span className="text-blue-600">💡 intelligent digital parking management system</span> that addresses modern urban parking challenges.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-all duration-300 hover:scale-102 border border-blue-200 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-blue-50 to-yellow-50 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full p-4 inline-block mb-4 shadow-md relative z-10">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-700 relative z-10">💡 Smart Location Finding</h3>
              <p className="text-gray-600 font-medium relative z-10">
                <span className="text-blue-600 font-semibold">Discover</span> available parking spaces near your destination with real-time intelligent updates.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="bg-yellow-400 rounded-full p-4 inline-block mb-4 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3a4 4 0 118 0v4m-4 0v7m-4-7h8" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">🔒 Bright Booking System</h3>
              <p className="text-gray-700 font-medium relative z-10">
                <span className="text-orange-600 font-bold">Secure bright reservations</span> in advance to guarantee availability when you arrive.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="bg-yellow-400 rounded-full p-4 inline-block mb-4 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">⚡ Bright Real-time Updates</h3>
              <p className="text-gray-700 font-medium relative z-10">
                Get <span className="text-orange-600 font-bold">instant bright information</span> about parking availability and space status updates.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="bg-yellow-400 rounded-full p-4 inline-block mb-4 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">💳 Bright Payment System</h3>
              <p className="text-gray-700 font-medium relative z-10">
                <span className="text-orange-600 font-bold">Secure bright processing</span> with multiple payment methods including mobile payments.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="bg-yellow-400 rounded-full p-4 inline-block mb-4 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">🎯 Bright Recommendations</h3>
              <p className="text-gray-700 font-medium relative z-10">
                <span className="text-orange-600 font-bold">Smart bright suggestions</span> based on proximity, vehicle type, and parking preferences.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-100 to-amber-100 rounded-2xl shadow-xl p-8 text-center hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-yellow-300 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-radial from-white via-yellow-200 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="bg-yellow-400 rounded-full p-4 inline-block mb-4 shadow-lg relative z-10">
                <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">🔒 Secure & Bright</h3>
              <p className="text-gray-700 font-medium relative z-10">
                <span className="text-orange-600 font-bold">Bright security</span> with two-factor authentication and encrypted data protection.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">System Domains & Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">Parking Space Management</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Real-time parking availability monitoring</li>
                <li>• Automatic status updates upon vehicle entry/exit</li>
                <li>• Support for different parking space types (regular, handicapped, EV charging)</li>
                <li>• Advanced reservation system</li>
                <li>• Navigation guidance to available spaces</li>
                <li>• Optimal location recommendations</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">Customer Management</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Streamlined entry and exit processes</li>
                <li>• Vehicle information recording</li>
                <li>• Digital parking ticket system</li>
                <li>• Payment verification before exit</li>
                <li>• User-friendly interface design</li>
                <li>• Customer support and issue resolution</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">Transaction Management</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Automated parking fee calculation</li>
                <li>• Multiple payment methods (cash, card, mobile)</li>
                <li>• Secure payment processing</li>
                <li>• Digital receipt generation</li>
                <li>• Transaction recording and reporting</li>
                <li>• Revenue management for parking operators</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 rounded-full p-3 mr-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">System Administration</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Comprehensive administrative interface</li>
                <li>• System configuration and parameter settings</li>
                <li>• User account and role management</li>
                <li>• Performance monitoring and alerts</li>
                <li>• Security measures and access control</li>
                <li>• Database management and reporting</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Search & Find</h3>
                <p className="text-gray-600 text-sm">
                  Enter your destination and find available parking locations with real-time updates.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Compare & Select</h3>
                <p className="text-gray-600 text-sm">
                  Compare pricing, features, and availability to choose the optimal parking space.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Reserve & Pay</h3>
                <p className="text-gray-600 text-sm">
                  Book your parking spot and complete secure payment through multiple methods.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Navigate & Park</h3>
                <p className="text-gray-600 text-sm">
                  Follow navigation guidance to your reserved space and park with digital verification.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Technology & Methodology</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Development Approach</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• <strong>Agile Scrum Framework</strong> for iterative development</li>
                  <li>• <strong>UML Diagrams</strong> for system visualization and design</li>
                  <li>• <strong>Comprehensive Testing</strong> throughout development</li>
                  <li>• <strong>Requirements Engineering</strong> through surveys and stakeholder workshops</li>
                  <li>• <strong>User-Centered Design</strong> with UI/UX focus</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Technology Stack</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• <strong>Hybrid Platform</strong> combining web and mobile applications</li>
                  <li>• <strong>Real-time Data Processing</strong> for live availability updates</li>
                  <li>• <strong>Secure Payment Gateway</strong> integration</li>
                  <li>• <strong>Database Management</strong> for comprehensive data storage</li>
                  <li>• <strong>Two-Factor Authentication</strong> for enhanced security</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Research-Based Solution</h2>
            <p className="text-gray-300 text-lg mb-6 max-w-3xl mx-auto">
              Our system is built on extensive research including IEEE papers on intelligent parking systems, 
              IoT-based solutions, GPS navigation challenges, and secure e-ticketing validation. We've applied 
              proven methodologies and cutting-edge technologies to create a robust parking management solution.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">1000+</div>
                <div className="text-gray-300">Survey Participants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">4</div>
                <div className="text-gray-300">System Domains</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">Aug 2025</div>
                <div className="text-gray-300">Project Completion</div>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Ready to Get Started?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Experience the future of parking today. Search for parking spots, compare prices, 
            and book instantly with ParkSmart.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Finding Parking
          </button>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}

export default About;