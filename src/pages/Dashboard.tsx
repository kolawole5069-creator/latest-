import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Users, 
  School, 
  CreditCard, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;
      
      try {
        if (profile.role === 'super_admin') {
          const [schoolsSnap, subsSnap] = await Promise.all([
            getDocs(collection(db, 'schools')),
            getDocs(query(collection(db, 'subscriptions'), where('status', '==', 'success')))
          ]);
          
          setStats({
            totalSchools: schoolsSnap.size,
            totalRevenue: subsSnap.docs.reduce((acc, doc) => acc + (doc.data().amount || 0), 0),
            activeSubs: schoolsSnap.docs.filter(d => d.data().subscriptionStatus === 'Active').length
          });
        } else if (profile.role === 'school_admin' && profile.schoolId) {
          const [studentsSnap, classesSnap] = await Promise.all([
            getDocs(query(collection(db, 'students'), where('schoolId', '==', profile.schoolId))),
            getDocs(query(collection(db, 'classes'), where('schoolId', '==', profile.schoolId)))
          ]);
          
          setStats({
            totalStudents: studentsSnap.size,
            totalClasses: classesSnap.size,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [profile]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Welcome back, {profile?.fullName}</h1>
        <p className="text-neutral-500">Here's what's happening in your {profile?.role === 'super_admin' ? 'platform' : 'school'} today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {profile?.role === 'super_admin' && (
          <>
            <StatCard 
              title="Total Schools" 
              value={stats.totalSchools} 
              icon={School} 
              color="text-blue-600" 
              bg="bg-blue-50" 
            />
            <StatCard 
              title="Total Revenue" 
              value={`₦${stats.totalRevenue.toLocaleString()}`} 
              icon={TrendingUp} 
              color="text-emerald-600" 
              bg="bg-emerald-50" 
            />
            <StatCard 
              title="Active Subscriptions" 
              value={stats.activeSubs} 
              icon={CreditCard} 
              color="text-purple-600" 
              bg="bg-purple-50" 
            />
            <StatCard 
              title="System Alerts" 
              value="0" 
              icon={AlertCircle} 
              color="text-amber-600" 
              bg="bg-amber-50" 
            />
          </>
        )}

        {profile?.role === 'school_admin' && (
          <>
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents} 
              icon={Users} 
              color="text-blue-600" 
              bg="bg-blue-50" 
            />
            <StatCard 
              title="Total Classes" 
              value={stats.totalClasses} 
              icon={School} 
              color="text-emerald-600" 
              bg="bg-emerald-50" 
            />
          </>
        )}
      </div>

      {/* Recent Activity or other sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-neutral-200">
          <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500 italic">No recent activity to show.</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-neutral-200">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {profile?.role === 'super_admin' && (
              <button className="p-4 rounded-xl border border-neutral-100 hover:bg-neutral-50 text-left transition-colors">
                <p className="font-semibold text-sm">Register School</p>
                <p className="text-xs text-neutral-500">Add a new school to the platform</p>
              </button>
            )}
            {profile?.role === 'school_admin' && (
              <button className="p-4 rounded-xl border border-neutral-100 hover:bg-neutral-50 text-left transition-colors">
                <p className="font-semibold text-sm">Add Student</p>
                <p className="text-xs text-neutral-500">Enroll a new student</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl border border-neutral-200 flex items-center gap-4"
    >
      <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-500">{title}</p>
        <p className="text-2xl font-bold text-neutral-900">{value}</p>
      </div>
    </motion.div>
  );
}
