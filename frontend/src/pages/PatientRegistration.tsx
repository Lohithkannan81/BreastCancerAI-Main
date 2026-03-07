import React, { useState } from 'react';
import { Icons } from '../constants';
import { useData } from '../contexts/DataContext';

const PatientRegistration: React.FC = () => {
    const { addPatient } = useData();
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        age: '',
        contact: '',
        history: ''
    });
    const [notification, setNotification] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const showNotification = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.id) {
            showNotification("Please fill in required fields.");
            return;
        }

        addPatient({
            id: formData.id,
            name: formData.name,
            age: parseInt(formData.age) || 0,
            contact: formData.contact,
            history: formData.history
        });

        showNotification("Patient registered successfully!");
        setFormData({ name: '', id: '', age: '', contact: '', history: '' });
    };

    return (
        <div className="fade-in-up max-w-2xl mx-auto space-y-8 pb-12" style={{ animationDuration: '0.6s' }}>
            {notification && (
                <div className="fixed top-6 right-6 bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-fade-in-up flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="font-medium text-sm">{notification}</span>
                </div>
            )}

            <div>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Patient Registration</h1>
                <p className="text-slate-500 font-light mt-1">Register new patients to the clinical records system.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 space-y-8 relative overflow-hidden bg-white/60">
                {/* Decorative glow */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 relative z-10">
                    <div className="col-span-1 group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Patient ID <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <Icons.Profile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                placeholder="e.g. PT-1024"
                                className="input-premium pl-11"
                                required
                            />
                        </div>
                    </div>

                    <div className="col-span-1 group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Full Name <span className="text-rose-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Jane Doe"
                            className="input-premium"
                            required
                        />
                    </div>

                    <div className="col-span-1 group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            placeholder="e.g. 45"
                            className="input-premium"
                        />
                    </div>

                    <div className="col-span-1 group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Contact No.</label>
                        <input
                            type="text"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            placeholder="e.g. +1 555-0000"
                            className="input-premium"
                        />
                    </div>

                    <div className="col-span-1 md:col-span-2 group">
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1 transition-colors group-focus-within:text-blue-500">Medical History / Clinical Notes</label>
                        <textarea
                            name="history"
                            value={formData.history}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Previous conditions, allergies, hereditary factors..."
                            className="input-premium resize-none"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200/50 flex justify-end relative z-10 mt-8">
                    <button type="submit" className="btn-primary flex items-center gap-2 group">
                        <Icons.Profile className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Register Patient
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientRegistration;
