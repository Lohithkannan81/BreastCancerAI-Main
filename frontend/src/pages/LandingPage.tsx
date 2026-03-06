import React from 'react';
import { Icons } from '../constants';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen cinematic-gradient flex flex-col font-sans">
      {/* Navigation */}
      <nav className="sticky top-4 z-50 max-w-7xl mx-auto px-6 py-4 mt-4 w-[calc(100%-2rem)] glass-panel flex justify-between items-center fade-in-up transition-all duration-500">
        <div className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.02]">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 tracking-tight">OncoVision AI</span>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={onLogin} className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-2">Login</button>
          <button onClick={onStart} className="btn-primary text-sm px-5 py-2">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div className="fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Clinical Grade AI
          </div>
          <h1 className="text-5xl lg:text-[4rem] font-bold text-slate-900 leading-[1.1] mb-6 tracking-tight">
            Precision histology analysis <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">reimagined.</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg font-light">
            Upload medical imagery and receive instantaneous, robust risk assessment powered by advanced neural architecture designed for modern diagnostic workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onStart} className="btn-primary py-4 px-8 text-base">
              Start Analysis
              <Icons.Analysis size={18} />
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary py-4 px-8 text-base bg-white/50 backdrop-blur-sm">
              View Research
              <Icons.Reports size={18} />
            </button>
          </div>
          <div className="mt-12 flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img key={i} src={`https://picsum.photos/100/100?random=${i}`} className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="User" />
              ))}
            </div>
            <p className="text-sm text-slate-500 font-medium">Trusted by 200+ Clinical Researchers</p>
          </div>
        </div>
        <div className="relative fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-blue-400/20 rounded-full blur-[80px] animate-pulse-slow"></div>
          <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-indigo-400/20 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

          <div className="relative glass-panel p-2 transform transition-transform duration-700 hover:scale-[1.02] hover:-translate-y-2 group">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173ff9e5fe3?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3"
              className="rounded-[1.25rem] shadow-sm relative z-10 object-cover h-[500px] w-full"
              alt="Medical AI Research"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-3xl -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Intelligence at scale.</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-light">The platform combines high-resolution imaging support with deep learning to assist specialists in rapid diagnostics.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Rapid Inference', desc: 'Secure, millisecond-level prediction speeds immediately after upload.', icon: Icons.Dashboard },
              { title: 'Clinical Precision', desc: 'Neural architecture validated against extensive multi-center datasets.', icon: Icons.Microscope },
              { title: 'Encrypted Data', desc: 'End-to-end encryption compliant with stringent medical standards.', icon: Icons.Shield },
              { title: 'Exportable Logs', desc: 'Generate and export flawless, beautifully formatted research reports.', icon: Icons.Reports }
            ].map((feature, idx) => (
              <div key={idx}
                className="glass-panel p-8 group transition-all duration-500 hover:-translate-y-2 hover:shadow-glass-lg fade-in-up"
                style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}>
                <div className="w-12 h-12 bg-white rounded-[1rem] flex items-center justify-center mb-8 shadow-sm text-slate-900 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                  <feature.icon size={22} className="stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Notice */}
      <div className="py-6 px-6 text-center text-xs font-medium text-slate-400 border-t border-slate-200">
        Engineered for Research. OncoVision AI supports, but does not replace, clinical diagnosis by qualified medical professionals.
      </div>
    </div>
  );
};

export default LandingPage;
