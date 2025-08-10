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
                About <span className="text-green-600">🏠</span> Park<span className="text-orange-600">Sathi</span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-600 font-medium mb-8 drop-shadow-sm">
                आफ्नै पार्किङ समाधान • Your friendly neighborhood parking helper, made by locals!
              </p>
              <div className="flex justify-center">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-3xl shadow-lg border-2 border-blue-200">
                  <p className="text-lg text-gray-700 font-medium leading-relaxed">
                    🏠 We're your friendly neighborhood parking solution! Built by Nepali people for Nepali people, 
                    we keep things <span className="text-green-600 font-semibold">simple, honest, and affordable</span> to help families and neighbors 
                    find safe parking spots without the hassle or high costs.
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
                <span className="text-4xl">🤝</span> Why Choose ParkSathi? • किन छान्ने?
              </h2>
              <p className="text-gray-600 max-w-4xl mx-auto text-lg font-medium leading-relaxed">
                Finding parking shouldn't be stressful! We understand the struggles of Kathmandu traffic and limited parking. 
                As your <span className="text-green-600 font-semibold">friendly neighborhood parking helper</span>, we connect you with local parking spots owned by 
                people in your community. It's <span className="text-orange-600 font-semibold">simple, affordable, and built with love</span> for our beautiful valley.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-700 mb-6 flex items-center justify-center gap-3">
              <span className="text-4xl">🤝</span> What We Do • के गर्छू
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg font-medium mb-8">
              We help <span className="text-green-600">🏠 neighbors connect with neighbors</span> to share parking spaces 
              in our community, making parking easier and more affordable for everyone.
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
              <h3 className="text-xl font-semibold mb-3 text-gray-700 relative z-10">🏠 Find Nearby Spots • नजिकैको ठाउँ</h3>
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
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">📱 Easy Booking • सजिलो बुकिंग</h3>
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
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">✨ Live Updates • प्रत्यक्ष जानकारी</h3>
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
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">💰 Fair Payment • उचित भुक्तानी</h3>
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
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">📍 Local Suggestions • स्थानीय सुझाव</h3>
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
              <h3 className="text-xl font-bold mb-3 text-gray-800 relative z-10">🔒 Safe & Secure • सुरक्षित</h3>
              <p className="text-gray-700 font-medium relative z-10">
                <span className="text-orange-600 font-bold">Your safety matters</span> - we keep your information secure and your parking experience worry-free.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">🏠 How We Help Our Community • हामी कसरी मद्दत गर्छू</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">🏠 Finding You a Spot • ठाउँ मिलाउने</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Always know which spots are free right now</li>
                <li>• Instant updates when people come and go</li>
                <li>• Different types of spots (regular, accessible, motorcycle)</li>
                <li>• Easy booking so your spot is saved</li>
                <li>• Simple directions to get you there</li>
                <li>• Good suggestions based on where you're going</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">🤝 Helping You Park • पार्किंग मा मद्दत</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Quick and easy getting in and out</li>
                <li>• Simple registration of your vehicle details</li>
                <li>• Digital ticket on your phone</li>
                <li>• Easy payment before you leave</li>
                <li>• Simple, friendly design that anyone can use</li>
                <li>• Real people to help if you have problems</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 rounded-full p-3 mr-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800">💰 Fair Payment • उचित भुक्तानी</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Simple, clear pricing with no hidden costs</li>
                <li>• Pay however you want (cash, card, mobile banking)</li>
                <li>• Safe and secure payment processing</li>
                <li>• Digital receipts sent to your phone</li>
                <li>• All transactions recorded properly</li>
                <li>• Helping local parking owners track their income</li>
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
                <h3 className="text-2xl font-semibold text-gray-800">🚀 Keeping Things Running • सबै व्यवस्थित</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Easy-to-use control panel for parking owners</li>
                <li>• Simple settings that anyone can understand</li>
                <li>• User accounts managed safely and simply</li>
                <li>• We keep an eye on everything for you</li>
                <li>• Your information stays safe and secure</li>
                <li>• Simple reports to see how things are going</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">🚗 How ParkSathi Works • पार्कसाथी कसरी काम गर्छ</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">🔍 Find Your Spot</h3>
                <p className="text-gray-600 text-sm">
                  Tell us where you're going and we'll show you friendly parking spots nearby.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">💰 Pick What Works</h3>
                <p className="text-gray-600 text-sm">
                  See prices and choose the spot that fits your budget and needs best.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">📱 Book It Easy</h3>
                <p className="text-gray-600 text-sm">
                  Reserve your spot with a quick tap and pay however is convenient for you.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">🏠 Park Happy</h3>
                <p className="text-gray-600 text-sm">
                  Follow simple directions to your spot and park knowing it's saved just for you!
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">🚀 How We Built ParkSathi • कसरी बनाय्यौं</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">🤝 Our Approach</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• <strong>Listen to the community</strong> - we asked what people really needed</li>
                  <li>• <strong>Simple planning</strong> - designed something everyone can understand</li>
                  <li>• <strong>Test everything</strong> - made sure it works before you use it</li>
                  <li>• <strong>Talk to real people</strong> - parking owners and drivers helped us build it</li>
                  <li>• <strong>Easy to use</strong> - if your parents can't use it, we redesign it</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">📱 The Tech Stuff</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• <strong>Works on phone and computer</strong> - use whatever you have</li>
                  <li>• <strong>Live updates</strong> - always shows what's happening right now</li>
                  <li>• <strong>Safe payments</strong> - your money and information stay secure</li>
                  <li>• <strong>Remembers everything</strong> - your preferences and parking history</li>
                  <li>• <strong>Extra security</strong> - double-checks it's really you</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">🏠 Made with Care for Nepal</h2>
            <p className="text-gray-300 text-lg mb-6 max-w-3xl mx-auto">
              We studied how parking really works in Kathmandu and talked to hundreds of drivers and parking owners. 
              This isn't just another app - it's built by Nepalis, for Nepalis, understanding our unique challenges 
              and culture. We've taken the best ideas from around the world and made them work for our community.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">500+</div>
                <div className="text-gray-300">Nepali Drivers Asked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">50+</div>
                <div className="text-gray-300">Local Parking Spots</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">Aug 2025</div>
                <div className="text-gray-300">Project Completion</div>
              </div>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">🏠 Ready to Try ParkSathi? • तयार छ?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Join your neighbors in making parking easier for everyone in Kathmandu Valley. 
            Find parking spots, support local businesses, and park with confidence!
          </p>
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors"
          >
            🏠 Start Parking with Neighbors
          </button>
        </section>
      </div>
      
      <Footer />
    </div>
  );
}

export default About;