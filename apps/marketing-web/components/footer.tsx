'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm mt-20">
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
              <li><Link href="/#features" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</Link></li>
              <li><Link href="http://localhost:3001" className="text-slate-400 hover:text-white transition-colors">Search App</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-4">Company</h5>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link></li>
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
          <p>&copy; 2025 Plinqy. All rights reserved. Built with ❤️ for local communities.</p>
        </div>
      </div>
    </footer>
  )
}
