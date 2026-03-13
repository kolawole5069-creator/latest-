import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Student, School, Result, Subject, Class } from '../types';
import { Printer, Download, ChevronLeft } from 'lucide-react';
import { AFFECTIVE_DOMAIN_TRAITS, PSYCHOMOTOR_DOMAIN_TRAITS, DOMAIN_SCALES } from '../constants';

export default function ReportCard() {
  const { studentId } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    if (!studentId) return;
    try {
      const studentSnap = await getDoc(doc(db, 'students', studentId));
      if (!studentSnap.exists()) return;
      
      const studentData = { id: studentSnap.id, ...studentSnap.data() } as Student;
      setStudent(studentData);

      const [schoolSnap, classSnap, resultsSnap, subjectsSnap] = await Promise.all([
        getDoc(doc(db, 'schools', studentData.schoolId)),
        getDoc(doc(db, 'classes', studentData.currentClassId)),
        getDocs(query(collection(db, 'results'), where('studentId', '==', studentId))),
        getDocs(query(collection(db, 'subjects'), where('classId', '==', studentData.currentClassId)))
      ]);

      setSchool(schoolSnap.data() as School);
      setClassInfo(classSnap.data() as Class);
      setResults(resultsSnap.docs.map(d => d.data() as Result));
      setSubjects(subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subject)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div>Loading report card...</div>;
  if (!student || !school) return <div>Data not found.</div>;

  const totalMarks = results.reduce((acc, r) => acc + (r.total || 0), 0);
  const average = results.length > 0 ? (totalMarks / results.length).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-neutral-100 p-4 lg:p-8 print:p-0 print:bg-white">
      {/* Controls */}
      <div className="max-w-5xl mx-auto mb-8 flex items-center justify-between print:hidden">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900">
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-neutral-800 transition-colors">
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Report Card Content */}
      <div className="max-w-5xl mx-auto bg-white shadow-2xl p-8 lg:p-12 print:shadow-none print:p-0 border-t-8 border-emerald-600">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 border-b-2 border-neutral-100 pb-8">
          <div className="w-24 h-24 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden">
            {school.logoUrl ? <img src={school.logoUrl} alt="Logo" className="w-full h-full object-contain" /> : <div className="text-neutral-300 font-bold">LOGO</div>}
          </div>
          <div className="flex-1 text-center px-8">
            <h1 className="text-3xl font-black text-neutral-900 uppercase tracking-tight">{school.name}</h1>
            <p className="text-emerald-600 font-bold italic mt-1">{school.motto}</p>
            <p className="text-sm text-neutral-500 mt-2 max-w-md mx-auto">{school.address}</p>
            <div className="mt-4 inline-block bg-neutral-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              Continuous Assessment Report - {school.currentTerm}
            </div>
          </div>
          <div className="w-24 h-24 bg-neutral-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-neutral-200">
            {student.photoUrl ? <img src={student.photoUrl} alt="Student" className="w-full h-full object-cover" /> : <div className="text-neutral-300 font-bold text-[10px]">PHOTO</div>}
          </div>
        </div>

        {/* Student Info Grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 bg-neutral-50 p-6 rounded-xl border border-neutral-100">
          <InfoRow label="Name" value={student.fullName} />
          <InfoRow label="Class" value={`${classInfo?.name} ${classInfo?.arm}`} />
          <InfoRow label="Department" value={student.department} />
          <InfoRow label="Student ID" value={student.studentId} />
          <InfoRow label="Gender" value={student.gender} />
          <InfoRow label="DOB" value={student.dob} />
        </div>

        {/* Academic Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-neutral-300 text-sm">
            <thead>
              <tr className="bg-neutral-900 text-white">
                <th className="border border-neutral-300 p-3 text-left">SUBJECTS</th>
                <th className="border border-neutral-300 p-3 text-center">T1 (10%)</th>
                <th className="border border-neutral-300 p-3 text-center">T2 (10%)</th>
                <th className="border border-neutral-300 p-3 text-center">T3 (10%)</th>
                <th className="border border-neutral-300 p-3 text-center">EXAM (70%)</th>
                <th className="border border-neutral-300 p-3 text-center">TOTAL (100)</th>
                <th className="border border-neutral-300 p-3 text-center">GRADE</th>
                <th className="border border-neutral-300 p-3 text-center">REMARK</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(subject => {
                const result = results.find(r => r.subjectId === subject.id);
                return (
                  <tr key={subject.id} className="even:bg-neutral-50">
                    <td className="border border-neutral-300 p-3 font-bold">{subject.name}</td>
                    <td className="border border-neutral-300 p-3 text-center">{result?.test1 || '-'}</td>
                    <td className="border border-neutral-300 p-3 text-center">{result?.test2 || '-'}</td>
                    <td className="border border-neutral-300 p-3 text-center">{result?.test3 || '-'}</td>
                    <td className="border border-neutral-300 p-3 text-center">{result?.exam || '-'}</td>
                    <td className="border border-neutral-300 p-3 text-center font-black">{result?.total || '-'}</td>
                    <td className="border border-neutral-300 p-3 text-center font-bold">{result?.grade || '-'}</td>
                    <td className="border border-neutral-300 p-3 text-center text-xs">{result?.remark || '-'}</td>
                  </tr>
                );
              })}
              <tr className="bg-neutral-100 font-black">
                <td className="border border-neutral-300 p-3">TOTAL / AVERAGE</td>
                <td colSpan={4} className="border border-neutral-300 p-3 text-right">SUM: {totalMarks}</td>
                <td className="border border-neutral-300 p-3 text-center">{average}%</td>
                <td colSpan={2} className="border border-neutral-300 p-3 text-center">
                  {results.length > 0 ? (Number(average) >= 50 ? 'PASS' : 'FAIL') : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Domains Section */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-3 text-emerald-600">Affective Domain</h3>
            <table className="w-full border-collapse border border-neutral-300 text-[10px]">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 p-1 text-left">Trait</th>
                  {DOMAIN_SCALES.map(s => <th key={s} className="border border-neutral-300 p-1 text-center">{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {AFFECTIVE_DOMAIN_TRAITS.map(trait => (
                  <tr key={trait}>
                    <td className="border border-neutral-300 p-1">{trait}</td>
                    {DOMAIN_SCALES.map(s => (
                      <td key={s} className="border border-neutral-300 p-1 text-center">
                        <div className="w-2 h-2 rounded-full border border-neutral-400 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest mb-3 text-emerald-600">Psychomotor Domain</h3>
            <table className="w-full border-collapse border border-neutral-300 text-[10px]">
              <thead>
                <tr className="bg-neutral-100">
                  <th className="border border-neutral-300 p-1 text-left">Skill</th>
                  {DOMAIN_SCALES.map(s => <th key={s} className="border border-neutral-300 p-1 text-center">{s}</th>)}
                </tr>
              </thead>
              <tbody>
                {PSYCHOMOTOR_DOMAIN_TRAITS.map(skill => (
                  <tr key={skill}>
                    <td className="border border-neutral-300 p-1">{skill}</td>
                    {DOMAIN_SCALES.map(s => (
                      <td key={s} className="border border-neutral-300 p-1 text-center">
                        <div className="w-2 h-2 rounded-full border border-neutral-400 mx-auto" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Comments */}
        <div className="space-y-6 pt-8 border-t-2 border-neutral-100">
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Class Teacher's Comment</p>
              <div className="h-12 border-b border-neutral-300 flex items-end pb-1 italic text-sm">
                A very good performance. Keep it up.
              </div>
            </div>
            <div className="w-48">
              <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Signature</p>
              <div className="h-12 border-b border-neutral-300" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Principal's Comment</p>
              <div className="h-12 border-b border-neutral-300 flex items-end pb-1 italic text-sm">
                Promoted to next class.
              </div>
            </div>
            <div className="w-48">
              <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Stamp & Date</p>
              <div className="h-12 border-b border-neutral-300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-black text-neutral-400 uppercase w-24 shrink-0">{label}:</span>
      <span className="text-sm font-bold text-neutral-900 border-b border-neutral-200 flex-1 pb-0.5">{value}</span>
    </div>
  );
}
