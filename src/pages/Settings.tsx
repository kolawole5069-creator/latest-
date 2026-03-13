import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { School } from '../types';
import { CreditCard, Save, Shield, Info, CheckCircle2 } from 'lucide-react';
import { PaystackButton } from 'react-paystack';

export default function Settings() {
  const { profile } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    if (profile?.schoolId) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    try {
      const schoolSnap = await getDoc(doc(db, 'schools', profile!.schoolId!));
      const studentsSnap = await getDocs(query(collection(db, 'students'), where('schoolId', '==', profile!.schoolId!)));
      
      setSchool({ id: schoolSnap.id, ...schoolSnap.data() } as School);
      setStudentCount(studentsSnap.size);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const amount = studentCount * (school?.pricingPerStudent || 500);
  
  const paystackProps = {
    email: profile?.email || '',
    amount: amount * 100, // Paystack expects amount in kobo
    metadata: {
      schoolId: profile?.schoolId,
      custom_fields: [
        {
          display_name: "School Name",
          variable_name: "school_name",
          value: school?.name || ''
        }
      ]
    },
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    text: "Pay Now",
    onSuccess: () => {
      alert("Payment successful! Your subscription will be updated shortly.");
      fetchData();
    },
    onClose: () => alert("Payment cancelled."),
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-500">Manage your school profile and subscription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-neutral-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-600" />
              School Profile
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-500 uppercase">School Name</label>
                  <input
                    type="text"
                    defaultValue={school?.name}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-500 uppercase">School Code</label>
                  <input
                    type="text"
                    defaultValue={school?.code}
                    className="w-full px-4 py-2 border border-neutral-200 rounded-lg bg-neutral-50"
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase">Motto</label>
                <input
                  type="text"
                  defaultValue={school?.motto}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-500 uppercase">Address</label>
                <textarea
                  defaultValue={school?.address}
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  rows={3}
                />
              </div>
              <button className="flex items-center gap-2 bg-neutral-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-neutral-800 transition-colors">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-neutral-200">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Security & Roles
            </h2>
            <p className="text-sm text-neutral-500 mb-4">Manage teacher accounts and permissions.</p>
            <button className="text-emerald-600 text-sm font-bold hover:underline">Manage Teachers →</button>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-emerald-600 text-white p-6 rounded-2xl shadow-xl shadow-emerald-600/20">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription
            </h2>
            <p className="text-emerald-100 text-xs mb-6 uppercase tracking-widest font-bold">Current Term: {school?.currentTerm}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="text-sm text-emerald-100">Status</span>
                <span className="font-bold uppercase tracking-wider text-xs bg-white text-emerald-600 px-2 py-1 rounded-full">
                  {school?.subscriptionStatus}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="text-sm text-emerald-100">Students</span>
                <span className="font-bold">{studentCount}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="text-sm text-emerald-100">Rate</span>
                <span className="font-bold">₦{school?.pricingPerStudent}/term</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-emerald-100 uppercase font-bold mb-1">Total Due</p>
              <p className="text-3xl font-black">₦{amount.toLocaleString()}</p>
            </div>

            {paystackProps.publicKey ? (
              <PaystackButton
                {...paystackProps}
                className="w-full bg-white text-emerald-600 py-3 rounded-xl font-black hover:bg-emerald-50 transition-colors shadow-lg"
              />
            ) : (
              <div className="w-full bg-white/20 text-white py-3 rounded-xl font-bold text-center text-xs">
                Paystack Public Key not configured
              </div>
            )}
          </section>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-neutral-500 leading-relaxed">
              Subscriptions are billed per student per term. Ensure your student list is up-to-date before making payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
