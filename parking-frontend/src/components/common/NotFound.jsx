import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4">
      {/* Background matching home page */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"></div>
      <div className="absolute inset-0 opacity-35">
        <div className="absolute top-10 left-1/4 w-32 h-32 bg-gradient-to-r from-yellow-200 to-blue-200 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
        <div className="absolute top-32 right-1/3 w-24 h-24 bg-gradient-to-r from-blue-100 to-yellow-100 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-20 left-1/6 w-28 h-28 bg-gradient-to-r from-yellow-100 to-blue-100 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s', animationDuration: '3.5s'}}></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-800/20 via-transparent to-blue-900/30"></div>
      
      <div className="relative z-10 text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100/90 via-white/95 to-yellow-100/90 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-blue-200/50">
            <svg className="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.034 0-3.9.785-5.291 2.09M6.343 6.343A8 8 0 1017.657 17.657 8 8 0 006.343 6.343z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <h2 className="text-xl font-semibold text-white/90 mb-2">Page Not Found</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Back Home
          </Link>
          
          <div className="text-sm text-white/70">
            Or try searching for parking spaces
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;