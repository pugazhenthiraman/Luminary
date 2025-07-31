import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      <section className="bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 py-16 md:py-32 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 box-border">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 md:mb-10 text-center bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent">
            Unlock Your Potential with <span className="text-blue-600">Certified Coaches</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 md:mb-12 max-w-3xl mx-auto text-center leading-relaxed">
            Discover and connect with top coaching professionals for personalized growth. Whether you're a parent or a coach, Luminnary is your trusted platform for skill development and success.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10 md:mb-12">
            <Link 
              to="/loginParent" 
              className="group inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 md:px-12 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-semibold no-underline transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl hover:-translate-y-1 transform text-center border border-blue-500/20 hover:border-blue-400/30"
            >
              I'm a Parent
            </Link>
            <Link 
              to="/loginCoach" 
              className="group inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-10 md:px-12 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-semibold no-underline transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-2xl hover:-translate-y-1 transform text-center border border-emerald-500/20 hover:border-emerald-400/30"
            >
              Join as Coach
            </Link>
          </div>
        </div>
      </section>
      
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-24 max-w-full mx-auto box-border flex flex-col items-center relative">
        <div className="w-full max-w-6xl mx-auto px-4 box-border">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 md:mb-16 text-center bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
            Why Choose Luminnary?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mt-12 md:mt-16">
            <div className="group bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center border border-gray-100 hover:border-blue-200">
              <div className="text-5xl md:text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🎓</div>
              <h3 className="text-2xl md:text-3xl mb-4 text-gray-800 font-bold">Certified Coaches</h3>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                All our coaches are verified professionals with proven expertise in their fields. We ensure quality and trust for every parent and learner.
              </p>
            </div>
            <div className="group bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center border border-gray-100 hover:border-blue-200">
              <div className="text-5xl md:text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">💡</div>
              <h3 className="text-2xl md:text-3xl mb-4 text-gray-800 font-bold">Personalized Guidance</h3>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                Get tailored coaching sessions that address your unique goals, whether academic, sports, arts, or personal development.
              </p>
            </div>
            <div className="group bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center border border-gray-100 hover:border-blue-200">
              <div className="text-5xl md:text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🔒</div>
              <h3 className="text-2xl md:text-3xl mb-4 text-gray-800 font-bold">Safe & Secure Platform</h3>
              <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                Your privacy and security are our top priorities. All interactions and data are protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-16 md:py-24 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 box-border">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8 text-gray-800">
            Are You a Coach?
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-8 md:mb-10 max-w-4xl mx-auto leading-relaxed">
            Join Luminnary to reach more families, manage your coaching schedule, and grow your impact. We welcome certified, passionate coaches from all backgrounds.
          </p>
          <Link 
            to="/loginCoach" 
            className="group inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-10 md:px-12 py-4 md:py-5 rounded-2xl text-lg md:text-xl font-semibold no-underline transition-all duration-300 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-2xl hover:-translate-y-1 transform border border-emerald-500/20 hover:border-emerald-400/30"
          >
            Apply to Join as Coach
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
