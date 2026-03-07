import React, { useState } from 'react';
import { Icons } from '../constants';
import { useData } from '../contexts/DataContext';

const PatientSearch: React.FC = () => {
    const { patients, getPatientReports } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

    // Filter patients based on search, show all if empty
    const filteredPatients = patients.filter(p =>
        searchTerm === '' ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectPatient = (patient: any) => {
        setSelectedPatient(patient);
    };

    const currentReports = selectedPatient ? getPatientReports(selectedPatient.id) : [];

    return (
        <div className="fade-in-up space-y-8" style={{ animationDuration: '0.6s' }}>
            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Patient Search</h1>
                <p className="text-slate-500 font-light mt-1">Find patient records and analyze longitudinal diagnostic history.</p>
            </div>

            {/* Search Bar */}
            <div className="glass-panel p-6 shadow-sm border border-slate-200/50 bg-white/60 backdrop-blur-md relative z-10">
                <div className="flex gap-4">
                    <div className="flex-1 relative group">
                        <Icons.Profile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedPatient(null);
                            }}
                            placeholder="Search by Patient ID (e.g. PT-1024) or Name..."
                            className="w-full pl-12 pr-4 py-4 input-premium md:text-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Results or Selection */}
            {selectedPatient ? (
                <div className="space-y-6 animate-fade-in-up relative z-10">
                    <button onClick={() => setSelectedPatient(null)} className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 max-w-max shadow-sm">
                        <Icons.X size={14} /> Close Record
                    </button>
                    <div className="glass-panel p-8 shadow-md border border-slate-200/50 flex flex-col md:flex-row justify-between gap-8 relative overflow-hidden bg-white/70">
                        {/* Subtle gradient glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedPatient.name}</h2>
                            <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-600 font-medium">
                                <span className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm"><Icons.Profile size={14} className="text-blue-500" /> {selectedPatient.id}</span>
                                <span className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">Age: {selectedPatient.age}</span>
                                <span className="flex items-center gap-1.5 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm">Contact: {selectedPatient.contact || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/60 md:w-1/3 relative z-10 shadow-inner">
                            <span className="block font-bold text-slate-400 text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                                Clinical History
                            </span>
                            <p className="text-sm text-slate-700 leading-relaxed font-medium">{selectedPatient.history || 'No records.'}</p>
                        </div>
                    </div>

                    <div className="glass-panel border border-slate-200/60 bg-white/60 backdrop-blur-md overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-slate-100/60 bg-slate-50/30">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Icons.Analysis size={18} className="text-blue-500" />
                                Timeline of Analyses
                            </h3>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Date Processed</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">AI Diagnosis</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">Confidence Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    {currentReports.length > 0 ? (
                                        currentReports.map((report: any) => (
                                            <tr key={report.id} className="hover:bg-blue-50/20 transition-colors group">
                                                <td className="px-6 py-5 text-sm font-medium text-slate-600">{report.date}</td>
                                                <td className="px-6 py-5">
                                                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest ${report.tumorClass.toUpperCase() === 'MALIGNANT' ? 'text-rose-700 bg-rose-100 shadow-[inset_0_0_0_1px_rgba(225,29,72,0.2)]' : 'text-emerald-700 bg-emerald-100 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.2)]'}`}>
                                                        {report.tumorClass}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 font-black text-slate-700">{report.confidence.toFixed(1)}%</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2 opacity-60">
                                                    <Icons.Reports size={24} />
                                                    <p className="text-sm font-medium">No analysis reports found for this patient.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                            <div key={patient.id} onClick={() => handleSelectPatient(patient)} className="glass-panel p-6 bg-white/70 hover:bg-white border border-slate-200/50 hover:border-blue-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                                <div className="flex justify-between items-start mb-5">
                                    <div className="w-12 h-12 bg-blue-50/50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm shadow-blue-100">
                                        <Icons.Profile size={22} className="group-hover:scale-110 transition-transform" />
                                    </div>
                                    <span className="text-[10px] font-bold bg-slate-100/80 text-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-200/50">{patient.id}</span>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1 tracking-tight group-hover:text-blue-600 transition-colors">{patient.name}</h3>
                                <p className="text-xs text-slate-500 font-medium">Age: {patient.age} • <span className="opacity-80">{patient.contact || 'No Contact Info'}</span></p>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 text-slate-400/80 glass-panel border-dashed border-2">
                            <div className="flex flex-col items-center gap-3">
                                <Icons.Search size={32} className="opacity-30 mb-2" />
                                <p className="font-bold tracking-wide">No patients found matching "<span className="text-slate-500">{searchTerm}</span>"</p>
                                <p className="text-xs font-light tracking-wide text-slate-400 mt-1">Please try searching by a different ID or Name.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientSearch;
