'use client'

import { motion } from 'framer-motion'
import { Heart, Shield, Target, Zap } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            About{' '}
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Plinqy
            </span>
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            We're on a mission to connect local communities with the businesses that serve them,
            making local shopping easier, faster, and more rewarding.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              Plinqy was founded with a simple yet powerful vision: to bridge the gap between local businesses
              and the communities they serve. We believe that local shopping should be as convenient as online
              shopping, while maintaining the personal touch that makes local businesses special.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed">
              By leveraging cutting-edge AI and location technology, we're making it easier than ever to discover
              what's available right in your neighborhood.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-8 border border-blue-500/30"
          >
            <h3 className="text-2xl font-bold text-white mb-6">Why Plinqy?</h3>
            <ul className="space-y-4">
              {[
                'Support local economies',
                'Reduce environmental impact',
                'Discover hidden gems',
                'Get instant product availability',
                'Save time and money'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Our Values</h2>
          <p className="text-xl text-slate-400">The principles that guide everything we do</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Heart,
              title: 'Community First',
              description: 'We prioritize the needs of local communities and businesses above all else.'
            },
            {
              icon: Zap,
              title: 'Innovation',
              description: 'We continuously improve our platform with the latest technology and user feedback.'
            },
            {
              icon: Shield,
              title: 'Trust & Privacy',
              description: 'Your data is secure with us. We never compromise on privacy or security.'
            }
          ].map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 hover:border-blue-500/50 transition-all"
            >
              <div className="w-14 h-14 rounded-lg bg-blue-600/20 flex items-center justify-center mb-6">
                <value.icon className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">{value.title}</h3>
              <p className="text-slate-400 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 rounded-3xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-12">Plinqy by the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '500+', label: 'Local Stores' },
              { value: '10K+', label: 'Products' },
              { value: '5K+', label: 'Happy Users' },
              { value: '50K+', label: 'Monthly Searches' }
            ].map((stat, i) => (
              <div key={stat.label}>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
