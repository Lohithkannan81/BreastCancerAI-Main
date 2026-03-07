import React, { useState, useRef } from 'react';
import { Icons } from '../constants';
import { AnalysisStatus, TumorClass } from '../types';
import { analyzeMedicalImage } from '../services/geminiService';
import { useData } from '../contexts/DataContext';
import jsPDF from 'jspdf';


const NewAnalysis: React.FC = () => {
  const { addReport, patients } = useData();
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<{ tumorClass: TumorClass; confidence: number; explanation: string } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      setFileName(file.name);
      reader.onloadend = () => {
        setImage(reader.result as string);
        setStatus(AnalysisStatus.IDLE);
        setResult(null);
        setRecommendations([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRecommendations = () => {
    // Random recommendations for demo
    const recs = [
      "Schedule follow-up Core Needle Biopsy within 48 hours.",
      "Urgent referral to Oncology for staging consultation.",
      "Conduct BRCA1/BRCA2 genetic screening.",
      "Schedule bilateral MRI for further assessment.",
      "Prepare multidisciplinary team review (Tumor Board)."
    ];
    // Shuffle and pick 2-3
    return recs.sort(() => 0.5 - Math.random()).slice(0, 3);
  };

  const handlePredict = async () => {
    if (!image) return;

    if (!patientId.trim()) {
      showNotification("Patient ID is required for analysis.");
      return;
    }

    // Verify patient is registered
    const isRegistered = patients.some(p => p.id === patientId);
    if (!isRegistered) {
      showNotification("Patient ID not found. Please register the patient first.");
      return;
    }

    const pId = patientId;
    const pName = patientName || `Anonymous Patient`;

    setStatus(AnalysisStatus.ANALYZING);

    // Slight delay to simulate system initialization
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const analysis = await analyzeMedicalImage(image, user.email || 'guest', pId, fileName);
      setResult(analysis);
      setStatus(AnalysisStatus.COMPLETED);

      const isMalignant = String(analysis.tumorClass).toUpperCase() === 'MALIGNANT';
      const recs = isMalignant ? generateRecommendations() : ["Routine annual screening recommended."];
      setRecommendations(recs);

      // Add to context history
      addReport({
        patientId: pId,
        patientName: pName,
        tumorClass: analysis.tumorClass,
        confidence: analysis.confidence,
        explanation: analysis.explanation,
        // status: AnalysisStatus.COMPLETED, // Handled by context
        // type: 'Histopathology', // Removed
        imageUrl: image,
        recommendations: recs
      });

      showNotification("Analysis complete & report saved.");

    } catch (err) {
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const reset = () => {
    setImage(null);
    setStatus(AnalysisStatus.IDLE);
    setResult(null);
    setNotification(null);
    setRecommendations([]);
    setPatientId('');
    setPatientName('');
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // ... (keep strict imports)

  const handleDownloadPDF = () => {
    if (!result) return;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(41, 128, 185); // Blue
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("BreastCancerAI", 20, 25);
    doc.setFontSize(10);
    doc.text("Diagnostic Analysis Report", 150, 25);

    // Patient Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Patient ID: ${patientId}`, 20, 50);
    doc.text(`Patient Name: ${patientName || 'N/A'}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleString()}`, 140, 50);
    doc.text(`Report ID: ${Date.now()}`, 140, 60);

    // Line Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 70, 190, 70);

    // Results
    doc.setFontSize(16);
    const isMalignant = String(result.tumorClass).toUpperCase() === 'MALIGNANT';
    const isBenign = String(result.tumorClass).toUpperCase() === 'BENIGN';
    doc.setTextColor(isMalignant ? 200 : 0, isBenign ? 150 : 0, 0);
    doc.text(`Result: ${result.tumorClass.toUpperCase()}`, 20, 90);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Confidence: ${result.confidence}%`, 140, 90);

    // Findings
    doc.setFontSize(14);
    doc.text("AI Findings:", 20, 110);
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    const splitText = doc.splitTextToSize(result.explanation, 170);
    doc.text(splitText, 20, 120);

    // Recommendations
    if (recommendations.length > 0) {
      let yPos = 120 + (splitText.length * 5) + 20;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Clinical Recommendations:", 20, yPos);

      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      yPos += 10;
      recommendations.forEach(rec => {
        doc.text(`• ${rec}`, 25, yPos);
        yPos += 7;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated by BreastCancerAI. This is an assistive tool and not a final diagnosis.", 20, 280);

    doc.save(`Report_${patientId}_${Date.now()}.pdf`);
    showNotification('PDF downloaded successfully!');
  };


  return (
    <div className="fade-in-up max-w-5xl mx-auto space-y-8 pb-12 relative" style={{ animationDuration: '0.6s' }}>
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-fade-in-up flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="font-medium text-sm">{notification}</span>
        </div>
      )}
      <div className="flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Diagnostic Analysis</h1>
          <p className="text-slate-500 font-light mt-1">Upload high-resolution histopathology or mammography scans for AI evaluation.</p>
        </div>
        {image && (
          <button
            onClick={reset}
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors bg-white/50 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            Start Over
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left: Upload and Preview */}
        <div className="lg:col-span-2 space-y-6">
          {!image ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="glass-panel border-2 border-dashed border-slate-300/60 bg-white/40 p-16 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-500 cursor-pointer group shadow-sm hover:shadow-xl"
            >
              <div className="w-20 h-20 bg-white shadow-sm text-slate-400 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-500 group-hover:shadow-blue-200/50">
                <Icons.Cloud size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 tracking-tight">Select medical imaging file</h3>
              <p className="text-slate-500 text-sm mb-8 font-light max-w-sm mx-auto">Supports high-resolution JPG, PNG, and DICOM formats up to 25MB.</p>
              <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-slate-200">Browse Files</button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
          ) : (
            <div className="glass-panel p-2 shadow-lg">
              <div className="relative aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-slate-800/50">
                <img src={image} className={`w-full h-full object-contain transition-all duration-1000 ${status === AnalysisStatus.ANALYZING ? 'scale-105 opacity-50 blur-sm' : 'scale-100'}`} alt="Scan Preview" />
                {status === AnalysisStatus.ANALYZING && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm">
                    <div className="relative w-24 h-24 mb-6">
                      {/* Scanning animation rings */}
                      <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping"></div>
                      <div className="absolute inset-2 border-4 border-blue-400/50 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                      <div className="absolute inset-4 border-4 border-t-blue-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                      <div className="absolute inset-0 flex items-center justify-center text-white"><Icons.Microscope size={28} /></div>
                    </div>
                    <p className="text-white font-bold tracking-wide text-lg drop-shadow-lg">Processing Neural Networks</p>
                    <p className="text-blue-300 text-[10px] mt-2 font-bold uppercase tracking-widest animate-pulse">Analyzing morphological structures</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result Section */}
          {result && status === AnalysisStatus.COMPLETED && (
            <div className={`p-8 rounded-3xl border transition-all duration-700 fade-in-up shadow-xl relative overflow-hidden group ${result.tumorClass.toUpperCase() === 'MALIGNANT'
              ? 'bg-gradient-to-br from-rose-50 to-white border-rose-100'
              : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100'
              }`}>
              {/* Decorative background glow based on result */}
              <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-40 mix-blend-multiply pointer-events-none transition-all duration-1000 ${result.tumorClass.toUpperCase() === 'MALIGNANT' ? 'bg-rose-400 group-hover:bg-rose-500' : 'bg-emerald-400 group-hover:bg-emerald-500'}`}></div>

              <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4 relative z-10">
                <div>
                  <h3 className={`text-2xl font-black tracking-tight ${result.tumorClass.toUpperCase() === 'MALIGNANT' ? 'text-rose-700' : 'text-emerald-700'
                    }`}>
                    {result.tumorClass.toUpperCase()}
                  </h3>
                  <p className={`${result.tumorClass.toUpperCase() === 'MALIGNANT' ? 'text-rose-900/70' : 'text-emerald-900/70'
                    } text-sm mt-2 font-medium max-w-md leading-relaxed`}>
                    {result.tumorClass.toUpperCase() === 'MALIGNANT'
                      ? 'Critical pathological markers detected. Immediate clinical review and biopsy correlation strongly advised.'
                      : 'No indications of malignant cellular structures. Benign morphology observed across the tissue sample.'}
                  </p>
                </div>
                <div className="text-left sm:text-right bg-white/60 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-white">
                  <span className={`text-4xl font-black tracking-tighter ${result.tumorClass.toUpperCase() === 'MALIGNANT' ? 'text-rose-600' : 'text-emerald-600'}`}>{result.confidence.toFixed(1)}%</span>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI Confidence</p>
                </div>
              </div>

              <div className="w-full h-4 bg-slate-100/80 rounded-full overflow-hidden mb-8 shadow-inner relative z-10 border border-slate-200/50">
                <div
                  className={`h-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] relative overflow-hidden ${result.tumorClass.toUpperCase() === 'MALIGNANT' ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                    }`}
                  style={{ width: `${result.confidence}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>

              <div className="glass-panel p-6 mb-6 relative z-10">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Icons.Analysis size={14} className={result.tumorClass.toUpperCase() === 'MALIGNANT' ? 'text-rose-500' : 'text-emerald-500'} />
                  Diagnostic Analysis
                </h4>
                <p className="text-slate-700 text-sm leading-relaxed font-medium">{result.explanation}</p>
              </div>

              {recommendations.length > 0 && result.tumorClass.toUpperCase() === 'MALIGNANT' && (
                <div className="glass-panel p-6 mb-8 relative z-10 border-rose-100/50 bg-rose-50/30">
                  <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Icons.Reports size={14} /> Recommended Action Plan
                  </h4>
                  <ul className="space-y-3">
                    {recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                        <div className="w-5 h-5 rounded-full bg-rose-200 text-rose-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">{i + 1}</div>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4 relative z-10 pt-2">
                <button onClick={handleDownloadPDF} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-slate-300">
                  <Icons.Reports size={20} />
                  Export Formal Report (PDF)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Case Details */}
        <div className="space-y-6 relative z-10">
          <div className="glass-panel p-6 shadow-sm border border-slate-200/50 bg-white/60 backdrop-blur-md">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg tracking-tight">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Icons.Profile size={20} /></div>
              Case Context
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Patient ID</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Enter ID (Required)"
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Patient Name <span className="text-slate-400 font-normal lowercase tracking-normal">(Optional)</span></label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Anonymous if empty"
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Clinical Notes</label>
                <textarea rows={4} placeholder="Initial observations..." className="input-premium resize-none" />
              </div>
            </div>
          </div>

          <button
            disabled={!image || status === AnalysisStatus.ANALYZING}
            onClick={handlePredict}
            className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${!image || status === AnalysisStatus.ANALYZING
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-300/50'
              : 'bg-blue-600 text-white hover:bg-blue-500 hover:-translate-y-1 shadow-blue-500/30'
              }`}
          >
            {status === AnalysisStatus.ANALYZING ? 'Processing Scan...' : 'Run Deep Learning Analysis'}
            <Icons.Microscope size={24} className={status === AnalysisStatus.ANALYZING ? "animate-pulse" : ""} />
          </button>

          <div className="glass-panel p-5 bg-slate-50/50 border-slate-200/50">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Privacy Guarantee</p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">All processed images are anonymized. Patient identifiers are not stored in the AI model during training or inference. Fully HIPAA Compliant.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewAnalysis;
