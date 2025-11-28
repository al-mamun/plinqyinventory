import Link from 'next/link'
import { Search, MapPin, Store, TrendingUp, Shield, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Plinqy
              </h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">
                How It Works
              </a>
              <a href="#about" className="text-slate-300 hover:text-white transition-colors">
                About
              </a>
              <Link
                href="http://localhost:3003"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Start Searching
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Find Local Stores &
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              {' '}Products Near You
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            Plinqy connects you with local businesses and products in your area.
            Search, discover, and shop locally with ease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="http://localhost:3003"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-semibold text-lg shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
            >
              Start Searching Now
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all font-semibold text-lg border border-slate-700"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-4">Why Choose Plinqy?</h3>
          <p className="text-xl text-slate-400">Powerful features for local discovery</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-all">
            <div className="w-14 h-14 rounded-lg bg-blue-600/20 flex items-center justify-center mb-6">
              <MapPin className="w-7 h-7 text-blue-400" />
            </div>
            <h4 className="text-2xl font-semibold text-white mb-4">Location-Based Search</h4>
            <p className="text-slate-400 leading-relaxed">
              Find stores and products based on your precise location. Get results that are
              actually near you, not across town.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-all">
            <div className="w-14 h-14 rounded-lg bg-green-600/20 flex items-center justify-center mb-6">
              <Store className="w-7 h-7 text-green-400" />
            </div>
            <h4 className="text-2xl font-semibold text-white mb-4">Local Businesses</h4>
            <p className="text-slate-400 leading-relaxed">
              Support your local economy. Discover small businesses and shops in your
              neighborhood you never knew existed.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-all">
            <div className="w-14 h-14 rounded-lg bg-purple-600/20 flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-purple-400" />
            </div>
            <h4 className="text-2xl font-semibold text-white mb-4">Lightning Fast</h4>
            <p className="text-slate-400 leading-relaxed">
              Get instant results with our optimized search engine. No more waiting around
              for slow searches.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-4">How It Works</h3>
          <p className="text-xl text-slate-400">Simple and straightforward</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-white mb-2">Share Your Location</h4>
              <p className="text-slate-400 leading-relaxed">
                Allow Plinqy to access your location to find stores and products near you.
                Your privacy is our priority.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-white mb-2">Search for Anything</h4>
              <p className="text-slate-400 leading-relaxed">
                Type in what you're looking for - products, services, or store names.
                Our smart search understands what you need.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-white mb-2">Get Instant Results</h4>
              <p className="text-slate-400 leading-relaxed">
                See all matching stores and products in your area, complete with prices,
                ratings, and contact information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center">
          <h3 className="text-4xl font-bold text-white mb-4">
            Ready to Discover Local?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Start searching for stores and products in your area today.
          </p>
          <Link
            href="http://localhost:3003"
            className="inline-block px-8 py-4 bg-white hover:bg-slate-100 text-blue-600 rounded-lg transition-all font-semibold text-lg shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white">Plinqy</h4>
              </div>
              <p className="text-slate-400">
                Local search made easy. Connecting communities with local businesses.
              </p>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Product</h5>
              <ul className="space-y-2">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Company</h5>
              <ul className="space-y-2">
                <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-white mb-4">Legal</h5>
              <ul className="space-y-2">
                <li><a href="#privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Plinqy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
