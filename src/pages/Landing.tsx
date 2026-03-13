import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  School, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Users, 
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
              <School className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-neutral-900">EduScore</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-neutral-500">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-neutral-900 hover:text-emerald-600 transition-colors">
              Login
            </Link>
            <Link to="/signup" className="bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-all shadow-xl shadow-neutral-900/20 active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3" />
                The Future of Nigerian Schools
              </div>
              <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter text-neutral-900 mb-8">
                RESULTS <br />
                <span className="text-emerald-600">REIMAGINED.</span>
              </h1>
              <p className="text-xl text-neutral-500 mb-10 max-w-lg leading-relaxed">
                The most advanced school management & result processing solution for modern Nigerian schools. Automated, secure, and incredibly fast.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-600/30 active:scale-95">
                  Register Your School
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="flex items-center justify-center gap-2 bg-white border-2 border-neutral-100 text-neutral-900 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-neutral-50 transition-all active:scale-95">
                  Admin Login
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-neutral-200 overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-neutral-500 font-medium">
                  Trusted by <span className="text-neutral-900 font-bold">50+ Schools</span> across Nigeria
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/dashboard/1200/800" 
                  alt="Dashboard Preview" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-4">Core Capabilities</h2>
            <h3 className="text-4xl lg:text-5xl font-black tracking-tight text-neutral-900">Built for Excellence</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Zap}
              title="Instant Computation"
              description="Automated grading and position calculation. No more manual errors in result sheets."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Secure Records"
              description="Cloud-based storage with military-grade encryption. Your data is safe and always accessible."
            />
            <FeatureCard 
              icon={Users}
              title="Student Portal"
              description="Students and parents can check results securely from any device, anywhere."
            />
            <FeatureCard 
              icon={FileSpreadsheet}
              title="Custom Reports"
              description="Beautifully designed report cards that reflect your school's unique identity."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Analytics"
              description="Track academic performance trends across classes and subjects with visual insights."
            />
            <FeatureCard 
              icon={Zap}
              title="Fast Deployment"
              description="Get your school up and running in less than 30 minutes. Simple and intuitive."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 mb-4">Pricing</h2>
            <h3 className="text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 mb-6">Simple, Transparent Pricing</h3>
            <p className="text-lg text-neutral-500">No hidden fees. No setup costs. Just pay for what you use.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-neutral-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Popular</div>
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-black">₦500</span>
                <span className="text-neutral-400 font-bold ml-2">/ student / term</span>
              </div>
              
              <ul className="space-y-4 mb-10">
                <PricingItem text="Unlimited Subjects & Classes" />
                <PricingItem text="Automated Result Computation" />
                <PricingItem text="Digital Report Cards" />
                <PricingItem text="Parent/Student Portal Access" />
                <PricingItem text="Cloud Data Backup" />
                <PricingItem text="24/7 Technical Support" />
              </ul>

              <Link to="/signup" className="block w-full bg-emerald-600 text-center py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 active:scale-95">
                Start Free Trial
              </Link>
              <p className="text-center text-neutral-500 text-xs mt-4 font-medium uppercase tracking-widest">No credit card required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-50 py-20 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                <School className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tighter">EduScore</span>
            </div>
            
            <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-neutral-400">
              <a href="#" className="hover:text-neutral-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-neutral-900 transition-colors">Contact Us</a>
            </div>

            <p className="text-xs text-neutral-400 font-medium">
              © 2024 EduScore Solution. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-neutral-100 hover:shadow-xl transition-all group">
      <div className="w-14 h-14 bg-neutral-50 text-neutral-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-xl font-bold mb-3">{title}</h4>
      <p className="text-neutral-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function PricingItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      <span className="text-neutral-300 text-sm font-medium">{text}</span>
    </li>
  );
}
