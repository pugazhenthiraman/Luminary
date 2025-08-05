import React from "react";
import { Link } from "react-router-dom";
import { FaGraduationCap, FaUsers, FaShieldAlt, FaClock, FaStar, FaArrowRight, FaPlay, FaCheckCircle, FaRocket, FaHeart, FaAward, FaGlobe } from "react-icons/fa";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-48 h-48 md:w-96 md:h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-1/4 right-0 w-40 h-40 md:w-80 md:h-80 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/4 w-36 h-36 md:w-72 md:h-72 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-20 md:pb-32">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-2 md:px-4 md:py-2 rounded-full bg-blue-100 text-blue-800 text-xs md:text-sm font-medium mb-6 md:mb-8">
              <FaRocket className="mr-2 text-sm md:text-base" />
              <span className="hidden sm:inline">Trusted by 10,000+ families worldwide</span>
              <span className="sm:hidden">10,000+ families trust us</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 md:mb-8 leading-tight px-2">
              Unlock Your Child's
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Full Potential
              </span>
          </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
              Connect with certified coaches and experts who specialize in personalized learning. 
              From academics to sports, arts to life skills - we've got your child covered.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center mb-12 md:mb-16 px-4">
            <Link 
              to="/loginParent" 
                className="group inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl text-base md:text-lg font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-2xl hover:-translate-y-1 transform w-full sm:w-auto"
            >
                Find a Coach
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/loginCoach" 
                className="group inline-flex items-center justify-center bg-white text-gray-900 px-6 py-3 md:px-8 md:py-4 rounded-2xl text-base md:text-lg font-semibold border-2 border-gray-200 transition-all duration-300 hover:bg-gray-50 hover:shadow-xl hover:-translate-y-1 transform w-full sm:w-auto"
            >
                Become a Coach
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto px-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 md:mb-2">500+</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Certified Coaches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 md:mb-2">10K+</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Happy Families</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-600 mb-1 md:mb-2">50+</div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600">Expertise Areas</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-2">
              Why Parents Choose Luminary
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              We're not just another platform - we're your partner in your child's success journey
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <FaGraduationCap className="text-xl md:text-2xl text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Expert Coaches</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                All coaches are verified professionals with proven track records, certifications, and specialized expertise. We maintain high standards to ensure quality education.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 p-6 md:p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <FaUsers className="text-xl md:text-2xl text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Personalized Learning</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Every session is customized to your child's learning style, pace, and goals. Our coaches adapt their teaching methods for maximum engagement and results.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-6 md:p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <FaShieldAlt className="text-xl md:text-2xl text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Safe & Secure</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Your child's safety is our top priority. All coaches undergo thorough background checks, and sessions are monitored with enterprise-grade security.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-orange-50 to-red-50 p-6 md:p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <FaClock className="text-xl md:text-2xl text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Flexible Scheduling</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Book sessions that fit your family's busy schedule. Available 7 days a week with 24/7 booking and easy rescheduling options.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-indigo-50 to-blue-50 p-6 md:p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <FaStar className="text-xl md:text-2xl text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Proven Results</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Track your child's progress with detailed reports and analytics. See measurable improvements in grades, confidence, and skill development.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 p-6 md:p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
                <FaGlobe className="text-xl md:text-2xl text-white" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Global Network</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Access coaches from around the world, bringing diverse perspectives and expertise. Learn from the best regardless of geographical location.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-2">
              How It Works
          </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Getting started is simple. Follow these three easy steps to find the perfect coach for your child.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-2xl md:text-3xl font-bold text-white">
                1
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Create Your Profile</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed px-4">
                Sign up and tell us about your child's interests, goals, and learning preferences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-2xl md:text-3xl font-bold text-white">
                2
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Browse & Connect</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed px-4">
                Explore our verified coaches, read reviews, and schedule a free consultation call.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-2xl md:text-3xl font-bold text-white">
                3
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Start Learning</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed px-4">
                Begin personalized sessions and watch your child grow with expert guidance.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-2">
              What Parents Say
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Don't just take our word for it - hear from families who've transformed their children's learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-lg md:text-xl" />
                ))}
              </div>
              <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6 leading-relaxed">
                "Luminary has been a game-changer for my daughter. Her math coach helped her go from struggling to excelling in just 3 months!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3 md:mr-4 text-sm md:text-base">
                  S
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm md:text-base">Sarah Johnson</div>
                  <div className="text-gray-600 text-xs md:text-sm">Parent of Emma, 12</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 md:p-8 rounded-3xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-lg md:text-xl" />
                ))}
              </div>
              <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6 leading-relaxed">
                "The flexibility and quality of coaches here is unmatched. My son's confidence has soared since starting with his coding mentor."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3 md:mr-4 text-sm md:text-base">
                  M
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm md:text-base">Michael Chen</div>
                  <div className="text-gray-600 text-xs md:text-sm">Parent of Alex, 15</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 md:p-8 rounded-3xl">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-lg md:text-xl" />
                ))}
              </div>
              <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6 leading-relaxed">
                "Finding the right piano teacher was so easy. The platform made it simple to compare coaches and find the perfect match."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold mr-3 md:mr-4 text-sm md:text-base">
                  L
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm md:text-base">Lisa Rodriguez</div>
                  <div className="text-gray-600 text-xs md:text-sm">Parent of Sofia, 9</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section for Parents */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 md:w-80 md:h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 px-2">
            Ready to Transform Your Child's Learning?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 md:mb-10 max-w-3xl mx-auto px-4">
            Join thousands of families who've discovered the power of personalized coaching. 
            Start your child's success story today.
          </p>
          <Link 
            to="/loginParent" 
            className="inline-flex items-center justify-center bg-white text-blue-600 px-6 py-3 md:px-8 md:py-4 rounded-2xl text-base md:text-lg font-semibold transition-all duration-300 hover:bg-gray-100 hover:shadow-2xl hover:-translate-y-1 transform w-full sm:w-auto"
          >
            Find Your Perfect Coach
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* CTA Section for Coaches */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-2">
            Are You a Coach?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 md:mb-10 max-w-3xl mx-auto px-4">
            Join our platform and reach more families while doing what you love. 
            We provide the tools, you provide the expertise.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            <div className="flex items-center justify-center">
              <FaCheckCircle className="text-emerald-600 text-xl md:text-2xl mr-2 md:mr-3" />
              <span className="text-gray-700 text-sm md:text-base">Flexible Schedule</span>
            </div>
            <div className="flex items-center justify-center">
              <FaCheckCircle className="text-emerald-600 text-xl md:text-2xl mr-2 md:mr-3" />
              <span className="text-gray-700 text-sm md:text-base">Competitive Pay</span>
            </div>
            <div className="flex items-center justify-center">
              <FaCheckCircle className="text-emerald-600 text-xl md:text-2xl mr-2 md:mr-3" />
              <span className="text-gray-700 text-sm md:text-base">Support Team</span>
            </div>
          </div>
          
          <Link 
            to="/loginCoach" 
            className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl text-base md:text-lg font-semibold transition-all duration-300 hover:from-emerald-700 hover:to-teal-700 hover:shadow-2xl hover:-translate-y-1 transform w-full sm:w-auto"
          >
            Apply to Join as Coach
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4 md:mb-6">
                <img 
                  src="/src/assets/icon.png" 
                  alt="Luminary" 
                  className="h-8 w-auto md:h-10"
                />
                <span className="text-xl md:text-2xl font-bold">Luminary</span>
              </div>
              <p className="text-gray-400 mb-4 md:mb-6 max-w-md text-sm md:text-base">
                Empowering children to reach their full potential through personalized coaching and expert guidance.
              </p>
              <div className="flex space-x-3 md:space-x-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <FaHeart className="text-white text-sm md:text-base" />
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <FaAward className="text-white text-sm md:text-base" />
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <FaStar className="text-white text-sm md:text-base" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">For Parents</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/loginParent" className="hover:text-white transition-colors text-sm md:text-base">Find a Coach</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors text-sm md:text-base">How It Works</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors text-sm md:text-base">Safety & Trust</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors text-sm md:text-base">Success Stories</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">For Coaches</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/loginCoach" className="hover:text-white transition-colors text-sm md:text-base">Join as Coach</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors text-sm md:text-base">Coach Benefits</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors text-sm md:text-base">Application Process</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors text-sm md:text-base">Coach Resources</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8 text-center text-gray-400">
            <p className="text-xs md:text-sm">&copy; 2024 Luminary. All rights reserved. Empowering the next generation of learners.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
