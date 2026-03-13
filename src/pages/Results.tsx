import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthContext';
import { Student, Class, Subject, Result } from '../types';
import { Save, ChevronRight, Search } from 'lucide-react';
import { DEFAULT_GRADING_SCALE } from '../constants';

export default function Results() {
  const { profile } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [scores, setScores] = useState<{ [studentId: string]: Partial<Result> }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.schoolId) {
      fetchInitialData();
    }
  }, [profile]);

  const fetchInitialData = async () => {
    const classesSnap = await getDocs(query(collection(db, 'classes'), where('schoolId', '==', profile?.schoolId)));
    setClasses(classesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Class)));
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedSubjectId('');
    setStudents([]);
    const subjectsSnap = await getDocs(query(collection(db, 'subjects'), where('classId', '==', classId)));
    setSubjects(subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
  };

  const handleLoadStudents = async () => {
    if (!selectedClassId || !selectedSubjectId) return;
    setLoading(true);
    try {
      const studentsSnap = await getDocs(query(collection(db, 'students'), where('currentClassId', '==', selectedClassId)));
      const resultsSnap = await getDocs(query(
        collection(db, 'results'), 
        where('classId', '==', selectedClassId),
        where('subjectId', '==', selectedSubjectId)
      ));

      const existingResults = resultsSnap.docs.reduce((acc, d) => {
        const data = d.data();
        acc[data.studentId] = data;
        return acc;
      }, {} as any);

      setStudents(studentsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Student)));
      setScores(existingResults);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (s: any) => {
    return (Number(s.test1) || 0) + (Number(s.test2) || 0) + (Number(s.test3) || 0) + (Number(s.exam) || 0);
  };

  const getGrade = (total: number) => {
    const scale = DEFAULT_GRADING_SCALE.find(g => total >= g.min && total <= g.max);
    return scale || { grade: 'F9', remark: 'Fail' };
  };

  const handleScoreChange = (studentId: string, field: string, value: string) => {
    const numValue = Math.min(Number(value), field === 'exam' ? 70 : 10);
    const newScores = {
      ...scores,
      [studentId]: {
        ...scores[studentId],
        [field]: numValue
      }
    };
    
    // Auto-calculate total and grade
    const total = calculateTotal(newScores[studentId]);
    const { grade, remark } = getGrade(total);
    
    newScores[studentId] = {
      ...newScores[studentId],
      total,
      grade,
      remark
    };

    setScores(newScores);
  };

  const handleSaveResults = async () => {
    setLoading(true);
    try {
      const promises = students.map(student => {
        const resultId = `${student.id}_${selectedSubjectId}`;
        return setDoc(doc(db, 'results', resultId), {
          ...scores[student.id],
          studentId: student.id,
          subjectId: selectedSubjectId,
          classId: selectedClassId,
          schoolId: profile?.schoolId,
          session: '2024/2025', // Should be dynamic
          term: 'Term 1', // Should be dynamic
          updatedAt: new Date().toISOString()
        });
      });
      await Promise.all(promises);
      alert('Results saved successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Result Entry</h1>
          <p className="text-neutral-500">Enter and compute academic scores for your classes.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-neutral-200 flex flex-wrap gap-4 items-end">
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-neutral-500 uppercase">Select Class</label>
          <select
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            value={selectedClassId}
            onChange={e => handleClassChange(e.target.value)}
          >
            <option value="">Choose Class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.arm}</option>)}
          </select>
        </div>
        <div className="space-y-1 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-neutral-500 uppercase">Select Subject</label>
          <select
            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            value={selectedSubjectId}
            onChange={e => setSelectedSubjectId(e.target.value)}
            disabled={!selectedClassId}
          >
            <option value="">Choose Subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button
          onClick={handleLoadStudents}
          disabled={!selectedSubjectId || loading}
          className="bg-neutral-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          Load Students
        </button>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-6 py-4 font-semibold text-neutral-600">Student</th>
                  <th className="px-4 py-4 font-semibold text-neutral-600 text-center">Test 1 (10)</th>
                  <th className="px-4 py-4 font-semibold text-neutral-600 text-center">Test 2 (10)</th>
                  <th className="px-4 py-4 font-semibold text-neutral-600 text-center">Test 3 (10)</th>
                  <th className="px-4 py-4 font-semibold text-neutral-600 text-center">Exam (70)</th>
                  <th className="px-4 py-4 font-semibold text-neutral-600 text-center">Total (100)</th>
                  <th className="px-4 py-4 font-semibold text-neutral-600 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{student.fullName}</td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        className="w-16 mx-auto block px-2 py-1 border border-neutral-200 rounded text-center focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        value={scores[student.id]?.test1 || ''}
                        onChange={e => handleScoreChange(student.id, 'test1', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        className="w-16 mx-auto block px-2 py-1 border border-neutral-200 rounded text-center focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        value={scores[student.id]?.test2 || ''}
                        onChange={e => handleScoreChange(student.id, 'test2', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        className="w-16 mx-auto block px-2 py-1 border border-neutral-200 rounded text-center focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        value={scores[student.id]?.test3 || ''}
                        onChange={e => handleScoreChange(student.id, 'test3', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="number"
                        className="w-16 mx-auto block px-2 py-1 border border-neutral-200 rounded text-center focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        value={scores[student.id]?.exam || ''}
                        onChange={e => handleScoreChange(student.id, 'exam', e.target.value)}
                      />
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-neutral-900">
                      {scores[student.id]?.total || 0}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-1 rounded font-bold text-[10px] ${
                        (scores[student.id]?.total || 0) >= 70 ? 'bg-emerald-100 text-emerald-700' :
                        (scores[student.id]?.total || 0) >= 50 ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {scores[student.id]?.grade || 'F9'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-neutral-50 border-t border-neutral-200 flex justify-end">
            <button
              onClick={handleSaveResults}
              disabled={loading}
              className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save All Results'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
