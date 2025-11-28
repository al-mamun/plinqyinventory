'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { MapPin, Package, Search, Shield, Store, TrendingUp, Users, Zap } from 'lucide-react'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-block mb-6"
          >
            <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium backdrop-blur-sm">
              ✨ Now with AI-Powered Search
            </span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Connect Local Stores with
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              {' '}Nearby Customers
            </span>
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-slate-300 mb-10 leading-relaxed"
          >
            <span className="font-semibold text-white">For Store Owners:</span> List your products and reach customers in your area.
            <br />
            <span className="font-semibold text-white">For Shoppers:</span> Find local products instantly with AI-powered search.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" asChild>
              <Link href="/register">
                List Your Store
                <Store className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="http://localhost:3001">
                Start Shopping
                <Search className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>

          {/* Stats Preview */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {[
              { icon: Store, label: 'Stores', value: '500+' },
              { icon: Package, label: 'Products', value: '10K+' },
              { icon: Users, label: 'Active Users', value: '5K+' },
              { icon: Search, label: 'Daily Searches', value: '15K+' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
              >
                <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose Plinqy?</h3>
          <p className="text-xl text-slate-400">Powerful features for store owners and shoppers</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Store,
              title: 'For Store Owners',
              description: 'List your products online and reach customers in your neighborhood. Manage inventory, update prices, and track customer engagement - all in one place.',
              color: 'blue',
              audience: 'owner'
            },
            {
              icon: Users,
              title: 'For Shoppers',
              description: 'Find exactly what you need from local stores near you. Search by product name, category, or store - get instant results with real-time availability.',
              color: 'green',
              audience: 'customer'
            },
            {
              icon: MapPin,
              title: 'Location-Based Search',
              description: 'Shoppers see stores based on their precise location. Store owners appear in searches when customers are nearby - perfect for foot traffic.',
              color: 'purple',
              audience: 'both'
            },
            {
              icon: Zap,
              title: 'AI-Powered Matching',
              description: 'Our smart search understands what customers are looking for and matches them with the right products in your store inventory.',
              color: 'yellow',
              audience: 'both'
            },
            {
              icon: TrendingUp,
              title: 'Real-Time Updates',
              description: 'Store owners update inventory instantly. Shoppers always see current prices and stock levels - no wasted trips to out-of-stock items.',
              color: 'red',
              audience: 'both'
            },
            {
              icon: Shield,
              title: 'Verified & Secure',
              description: 'All stores are verified. Customer data is protected. Secure platform for both store owners and shoppers to connect with confidence.',
              color: 'pink',
              audience: 'both'
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-all group"
            >
              <div className={`w-14 h-14 rounded-lg bg-${feature.color}-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 text-${feature.color}-400`} />
              </div>
              <h4 className="text-2xl font-semibold text-white mb-4">{feature.title}</h4>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-6 py-20 bg-white/5 rounded-3xl my-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h3>
          <p className="text-xl text-slate-400">Simple for store owners and shoppers</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* For Shoppers */}
          <div className="space-y-8">
            <h4 className="text-2xl font-bold text-blue-400 mb-6">For Shoppers</h4>
            {[
              {
                step: 1,
                title: 'Share Your Location',
                description: 'Allow Plinqy to find stores near you. Your privacy is protected - we only use location for search results.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                step: 2,
                title: 'Search for Products',
                description: 'Type what you need - our AI understands and finds matching products in nearby stores instantly.',
                color: 'from-purple-500 to-purple-600'
              },
              {
                step: 3,
                title: 'Visit & Purchase',
                description: 'See prices, availability, and store details. Get directions and visit the store to make your purchase.',
                color: 'from-green-500 to-green-600'
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex items-start gap-6"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg`}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <h5 className="text-xl font-semibold text-white mb-2">{item.title}</h5>
                  <p className="text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* For Store Owners */}
          <div className="space-y-8">
            <h4 className="text-2xl font-bold text-green-400 mb-6">For Store Owners</h4>
            {[
              {
                step: 1,
                title: 'Register Your Store',
                description: 'Create your store profile with location, hours, and contact info. Quick setup in minutes.',
                color: 'from-green-500 to-green-600'
              },
              {
                step: 2,
                title: 'Add Your Products',
                description: 'List your inventory with names, prices, and descriptions. Update anytime - customers see changes instantly.',
                color: 'from-blue-500 to-blue-600'
              },
              {
                step: 3,
                title: 'Reach Local Customers',
                description: 'Appear in search results when nearby customers look for your products. Track views and engagement.',
                color: 'from-purple-500 to-purple-600'
              }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex items-start gap-6"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg`}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <h5 className="text-xl font-semibold text-white mb-2">{item.title}</h5>
                  <p className="text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Store owners: List your products and reach local customers today.<br />
              Shoppers: Find what you need from stores in your neighborhood.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="outline" asChild>
                <Link href="/register" className="bg-white text-blue-600 hover:bg-slate-100">
                  Register Your Store
                  <Store className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="http://localhost:3001" className="bg-white text-blue-600 hover:bg-slate-100">
                  Start Shopping
                  <Search className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
