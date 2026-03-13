import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { School, ArrowRight, CheckCircle2 } from 'lucide-react';
import { NIGERIAN_STATES } from '../constants';

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [schoolData, setSchoolData] = useState({
    name: '',
    code: '',
    state: '',
    email: '',
    type: 'Combined',
    currentTerm: 'Term 1',
    subscriptionStatus: 'Trial',
    pricingPerStudent: 500
  });
  
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    if (!schoolData.name || !schoolData.code || !schoolData.state) {
      setError('Please fill in all school details first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1. Create School Document
      const schoolRef = await addDoc(collection(db, 'schools'), {
        ...schoolData,
        adminUid: user.uid,
        createdAt: new Date().toISOString(),
        subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days trial
      });

      // 2. Create User Profile as School Admin
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || 'School Admin',
        role: 'school_admin',
        schoolId: schoolRef.id,
        status: 'Active',
        createdAt: new Date().toISOString()
      });

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to register school');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-neutral-100">
        {/* Left Side - Info */}
        <div className="md:w-1/3 bg-emerald-600 p-10 text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-8">
              <School className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-4">Register Your School</h1>
            <p className="text-emerald-100 text-sm leading-relaxed mb-8">
              Join hundreds of schools digitizing their academic records with EduScore.
            </p>
            
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                14-Day Free Trial
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                Unlimited Students
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                Instant Result Processing
              </li>
            </ul>
          </div>
          
          <div className="pt-8 border-t border-white/20">
            <p className="text-xs text-emerald-200 font-medium uppercase tracking-widest">Trusted by educators nationwide</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 p-10 lg:p-16">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900">School Details</h2>
            <div className="flex gap-1">
              <div className={`w-8 h-1 rounded-full ${step >= 1 ? 'bg-emerald-600' : 'bg-neutral-100'}`} />
              <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-emerald-600' : 'bg-neutral-100'}`} />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">School Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Academy"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={schoolData.name}
                    onChange={e => setSchoolData({ ...schoolData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">School Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RAC"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={schoolData.code}
                    onChange={e => setSchoolData({ ...schoolData, code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">Official Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@school.com"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={schoolData.email}
                    onChange={e => setSchoolData({ ...schoolData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-neutral-400 uppercase tracking-widest">State</label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={schoolData.state}
                    onChange={e => setSchoolData({ ...schoolData, state: e.target.value })}
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              
              <button
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-neutral-800 transition-all active:scale-95 shadow-xl shadow-neutral-900/20"
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Final step: Connect your admin account. We use Google for secure authentication. This account will have full administrative access to your school's EduScore workspace.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-neutral-100 text-neutral-900 py-4 px-4 rounded-2xl font-bold hover:bg-neutral-50 transition-all disabled:opacity-50 active:scale-95"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  {loading ? 'Creating Workspace...' : 'Complete with Google'}
                </button>
                
                <button
                  onClick={() => setStep(1)}
                  className="w-full text-center text-sm font-bold text-neutral-400 uppercase tracking-widest hover:text-neutral-600 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-neutral-100 text-center">
            <p className="text-xs text-neutral-400 font-medium">
              Already have a school account? <Link to="/login" className="text-emerald-600 font-bold hover:underline">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
