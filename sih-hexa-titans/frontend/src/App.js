import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, Wifi, WifiOff, MapPin, Loader, TrendingUp, Cpu, Users, RefreshCw } from 'lucide-react';
// import './App.css'; // REMOVED: CSS file has been deleted, so we remove this line.

// --- CONFIGURATION ---
const API_BASE_URL = 'http://localhost:5000'; 
const LOCAL_STORAGE_KEY = 'sih_offline_uploads';

// --- Utility Functions ---

const getLocalUploads = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalUploads = (uploads) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(uploads));
};

const generateMockCaseId = () => `CASE-${Math.floor(Math.random() * 90000) + 10000}`;

const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// --- Component: Beneficiary (Loan Recipient) App ---

const BeneficiaryApp = ({ onSyncComplete }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [localUploads, setLocalUploads] = useState(getLocalUploads());
  const [isOfflineMode, setIsOfflineMode] = useState(false); 

  const isOnline = useOnlineStatus() && !isOfflineMode;
  const SyncIcon = isOnline ? Wifi : WifiOff;

  const handleCaptureImage = () => {
    setMessage('');
    setCapturedImage(`https://placehold.co/400x300/14b8a6/FFFFFF?text=Asset+Photo+${Date.now()}`);
  };

  const handleSaveLocally = useCallback(() => {
    if (!capturedImage) {
      setMessage({ type: 'error', text: 'Please capture an asset image first.' });
      return;
    }

    setIsProcessing(true);
    const newUpload = {
      id: generateMockCaseId(),
      assetImage: capturedImage,
      beneficiary: 'Beneficiary ID: AB001', 
      timestamp: new Date().toISOString(),
      gps: '12.9716° N, 77.5946° E (Mocked)',
      status: 'Awaiting Sync',
      isSynced: false,
    };

    const updatedUploads = [...localUploads, newUpload];
    saveLocalUploads(updatedUploads);
    setLocalUploads(updatedUploads);
    setCapturedImage(null);

    setTimeout(() => {
      setIsProcessing(false);
      setMessage({ type: 'success', text: `✅ Proof saved locally! Case ID: ${newUpload.id}.` });
    }, 1000);
  }, [capturedImage, localUploads]);

  const handleSyncToBackend = useCallback(async () => {
    if (localUploads.length === 0) {
      setMessage({ type: 'info', text: 'No pending uploads to sync.' });
      return;
    }
    if (!isOnline) {
      setMessage({ type: 'error', text: '🚨 Cannot sync: Device is currently offline.' });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: 'info', text: `Starting sync of ${localUploads.length} case(s) to the cloud...` });

    try {
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cases: localUploads }),
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        saveLocalUploads([]);
        setLocalUploads([]);
        
        const result = await response.json();
        setMessage({ type: 'success', text: `🚀 Sync Complete! ${result.message}` });
        
        onSyncComplete(); 

    } catch (error) {
        console.error("Sync Error:", error);
        setMessage({ type: 'error', text: `Sync failed! Is the backend running at ${API_BASE_URL}?` });
    } finally {
        setIsProcessing(false);
    }
  }, [localUploads, isOnline, onSyncComplete]);


  useEffect(() => {
    if (isOnline && localUploads.length > 0) {
        setMessage({ type: 'warning', text: `🌐 Network restored. ${localUploads.length} pending case(s) ready to sync.` });
    }
  }, [isOnline, localUploads.length]);

  return (
    <div className="flex justify-center items-start h-full p-4">
      {/* Phone Frame */}
      <div className="mobile-frame bg-gray-900 shadow-2xl rounded-[3rem] p-1 w-[380px] h-[650px] relative">
        {/* Inner Screen */}
        <div className="bg-white rounded-[2.5rem] h-full overflow-hidden flex flex-col">
          
          {/* Status Bar / Header (VIBRANT) */}
          <div className="p-3 bg-indigo-700 text-white flex justify-between items-center shadow-lg">
            <h3 className="font-extrabold text-lg"><center>धन साक्षी (Dhan Sakshi)</center></h3>
            <div className="flex items-center space-x-2">
                <span className="text-sm">{new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'})}</span>
                <SyncIcon className="w-5 h-5 text-teal-300"/>
                <span className={`text-xs font-semibold px-2 rounded ${isOfflineMode ? 'bg-red-500' : 'bg-green-500'}`}>{isOfflineMode ? 'OFF' : 'ON'}</span>
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            
            {/* 1. Asset Capture */}
            <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
              <p className="font-extrabold text-gray-800 mb-3 flex items-center"><Camera className='w-4 h-4 mr-2 text-teal-600'/> 1. Capture Loan Asset Proof</p>
              {capturedImage ? (
                <div className="border-4 border-teal-600 p-1 rounded-lg bg-gray-200 mb-3 shadow-inner">
                  <img src={capturedImage} alt="Captured Asset" className="w-full h-auto rounded-md" />
                </div>
              ) : (
                <div className="h-28 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center mb-3">
                  <Camera className="w-8 h-8 text-gray-500" />
                  <p className="ml-2 text-gray-600 text-sm">Tap to Capture...</p>
                </div>
              )}

              <button
                onClick={handleCaptureImage}
                className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition duration-300 shadow-2xl mobile-btn glow-shadow-teal"
              >
                <Camera className="w-5 h-5 mr-2"/> Capture Proof
              </button>
            </div>

            {/* 2. Upload Status & Actions */}
            <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
              <p className="font-extrabold text-gray-800 mb-3 flex items-center"><Upload className='w-4 h-4 mr-2 text-indigo-600'/> 2. Submit & Synchronize</p>
              
              {/* Toggle Switch */}
              <div className="mb-3 flex justify-between items-center p-2 rounded-xl bg-gray-100 border border-gray-200">
                <span className="text-sm font-bold text-gray-700">Simulate Offline Mode:</span>
                <button
                  onClick={() => setIsOfflineMode(prev => !prev)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isOfflineMode ? 'bg-red-600' : 'bg-green-600'}`}
                  aria-checked={isOfflineMode}
                  role="switch"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOfflineMode ? 'translate-x-6' : 'translate-x-1'}`}></span>
                </button>
              </div>

              <button
                onClick={handleSaveLocally}
                disabled={isProcessing || !capturedImage}
                className={`w-full py-3 rounded-xl mb-3 transition duration-300 shadow-2xl mobile-btn glow-shadow-indigo ${
                  isProcessing || !capturedImage
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {isProcessing ? <Loader className="w-5 h-5 mr-2 animate-spin"/> : <MapPin className="w-5 h-5 mr-2"/>}
                Save Proof Locally (Offline)
              </button>

              <button
                onClick={handleSyncToBackend}
                disabled={isProcessing || localUploads.length === 0 || !isOnline}
                className={`w-full py-3 rounded-xl transition duration-300 shadow-2xl mobile-btn ${
                  isProcessing || localUploads.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isOnline
                      ? 'bg-green-600 text-white hover:bg-green-700 glow-shadow-green'
                      : 'bg-yellow-500 text-gray-800 cursor-not-allowed'
                }`}
              >
                {isProcessing ? <Loader className="w-5 h-5 mr-2 animate-spin"/> : <Wifi className="w-5 h-5 mr-2"/>}
                {isOnline ? `Sync All ${localUploads.length} Pending Case(s)` : `OFFLINE - ${localUploads.length} PENDING`}
              </button>
            </div>

            {/* Status Message */}
            <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-300 text-sm shadow-inner">
              <p className="font-extrabold text-blue-900">Status Updates:</p>
              {message.text && (
                <p className={`mt-1 font-medium ${message.type === 'success' ? 'text-green-700' : message.type === 'error' ? 'text-red-700' : 'text-blue-700'}`}>
                  {message.text}
                </p>
              )}
              {localUploads.length > 0 && (
                <p className="font-bold mt-2 text-indigo-900">
                  **Pending Local Uploads: {localUploads.length}**
                </p>
              )}
            </div>

          </div>
          
        </div>
      </div>
    </div>
  );
};

// --- Component: Officer Review Dashboard ---

const OfficerDashboard = ({ fetchTrigger }) => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    try {
        const response = await fetch(`${API_BASE_URL}/api/cases`);
        if (!response.ok) throw new Error('Failed to fetch cases from backend.');
        
        const data = await response.json();
        setCases(data);
    } catch (error) {
        console.error("Fetch Error: Ensure backend is running.", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
    const interval = setInterval(fetchCases, 5000); 
    return () => clearInterval(interval);
  }, [fetchCases, fetchTrigger]); 

  const handleReviewAction = useCallback(async (caseId, action) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ case_id: caseId, action }),
        });
        
        if (!response.ok) throw new Error('Failed to submit review action.');

        fetchCases();
        setSelectedCase(null);

    } catch (error) {
        console.error("Review Action Error:", error);
    }
  }, [fetchCases]);
  
  const statusColors = useMemo(() => ({
    'Suspicious': 'text-red-400 bg-red-900 border-red-700',
    'Verified': 'text-green-400 bg-green-900 border-green-700',
    'Awaiting AI Check': 'text-yellow-400 bg-yellow-900 border-yellow-700',
    'Approved': 'text-teal-400 bg-teal-900 border-teal-700', // Changed for dark theme accent
    'Rejected': 'text-gray-400 bg-gray-700 border-gray-600',
    'Processing': 'text-purple-400 bg-purple-900 border-purple-700',
  }), []);

  const getStatusTag = (status) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusColors[status] || statusColors['Processing']}`}>
      {status}
    </span>
  );

  return (
    <div className="bg-gray-900 p-6 rounded-xl h-full flex flex-col text-white shadow-2xl dashboard-container">
      <h2 className="text-3xl font-extrabold border-b-double border-gray-700 pb-3 mb-4 flex items-center text-red-400 text-shadow-red">
        <Cpu className="w-8 h-8 mr-3 text-red-500"/> AI Verification Console
        <button onClick={fetchCases} disabled={isLoading} className="ml-4 p-2 rounded-full text-gray-400 hover:text-teal-400 transition hover:bg-gray-700">
             {isLoading ? <Loader className="w-6 h-6 animate-spin"/> : <RefreshCw className="w-6 h-6"/>}
        </button>
      </h2>

      <div className="flex flex-grow overflow-hidden">
        {/* Case List (Left Pane) */}
        <div className="w-1/3 pr-4 border-r border-gray-700 overflow-y-auto custom-scrollbar">
          <h3 className="text-xl font-bold mb-4 text-gray-200">Pending Cases ({cases.length})</h3>
          <p className='text-sm text-red-400 mb-4 font-extrabold flex items-center bg-red-900 p-3 rounded-xl border-double border-red-700 shadow-xl dashboard-card'><AlertTriangle className='w-4 h-4 mr-2'/> CRITICAL: {cases.filter(c => c.ai_status === 'Suspicious' && !c.reviewStatus).length} High-Risk Submissions</p>
          
          <div className="space-y-3">
            {cases.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`p-4 rounded-xl border cursor-pointer transition duration-300 case-card shadow-lg text-gray-300 ${
                  selectedCase && selectedCase.id === c.id ? 'border-4 border-teal-500 bg-indigo-900 list-glow' : 'bg-gray-800 hover:bg-gray-700'
                } ${c.ai_status === 'Suspicious' && !c.reviewStatus ? 'border-red-400 bg-red-900 shadow-red-900/50' : ''}`}
              >
                <p className="font-extrabold text-base text-white">{c.id}</p>
                <p className="text-xs text-gray-400 mb-2">Beneficiary: {c.beneficiary}</p>
                <div className="flex justify-between items-center">
                    {getStatusTag(c.ai_status)}
                    {c.reviewStatus && getStatusTag(c.reviewStatus)}
                </div>
              </div>
            ))}
            {cases.length === 0 && !isLoading && <p className="text-gray-500 text-center mt-8">No cases pending review.</p>}
          </div>
        </div>

        {/* Case Detail (Right Pane) */}
        <div className="w-2/3 pl-4 overflow-y-auto custom-scrollbar">
          {selectedCase ? (
            <div className="space-y-6">
              <h3 className="text-3xl font-extrabold text-white border-b border-gray-700 pb-2 text-shadow-white">{selectedCase.id}</h3>
              
              {/* AI REPORT CARD */}
              <div className="p-6 rounded-xl bg-gray-800 shadow-2xl border-t-4 border-red-500 dashboard-card">
                <p className="font-bold text-xl mb-3 flex items-center text-red-400"><Cpu className='w-6 h-6 mr-2'/> AI Verification Report</p>
                
                <div className={`p-5 rounded-xl font-extrabold text-2xl flex items-center transition duration-300 text-center ${
                    selectedCase.ai_status === 'Suspicious'
                      ? 'bg-red-600 text-white shadow-2xl pulse-bg text-shadow-white'
                      : 'bg-green-600 text-white shadow-2xl text-shadow-white'
                  }`}>
                  {selectedCase.ai_status === 'Suspicious' ? <AlertTriangle className="w-8 h-8 mr-4"/> : <CheckCircle className="w-8 h-8 mr-4"/>}
                  AI Status: {selectedCase.ai_status}
                </div>
                
                <p className="text-sm mt-3 text-gray-400 font-medium">Confidence Score: **{selectedCase.confidence}**</p>
                <p className="text-sm italic mt-1 text-gray-500">Analysis: {selectedCase.ai_reason}</p>
              </div>

              {/* ASSET EVIDENCE CARD */}
              <div className="space-y-4 p-6 bg-gray-800 rounded-xl shadow-inner border-t-4 border-teal-500 dashboard-card">
                <p className="font-bold text-xl border-b border-gray-700 pb-2 text-teal-400 text-shadow-teal">Loan Asset Evidence</p>
                <img src={selectedCase.assetImage} alt="Asset Proof" className="w-full h-auto rounded-xl shadow-lg border-2 border-gray-700" />
                <div className="flex items-center text-sm text-gray-400 mt-4">
                  <MapPin className="w-4 h-4 mr-2 text-teal-500"/>
                  **GeoTag:** {selectedCase.gps}
                </div>
                <div className="text-sm text-gray-400">
                  **Upload Date:** {new Date(selectedCase.timestamp).toLocaleString()}
                </div>
                {selectedCase.officer && <p className="text-sm font-bold text-teal-400 mt-3">Reviewed By: {selectedCase.officer}</p>}
              </div>

              {/* Review Actions */}
              {!selectedCase.reviewStatus && (
                <div className="pt-6 border-t border-gray-700 mt-6 flex space-x-6">
                  <button
                    onClick={() => handleReviewAction(selectedCase.id, 'Approved')}
                    className="flex-1 bg-teal-600 text-white py-4 rounded-xl hover:bg-teal-700 font-extrabold transition duration-300 shadow-2xl flex items-center justify-center text-lg transform hover:scale-[1.02] glow-shadow-teal"
                  >
                    <CheckCircle className="w-5 h-5 mr-2"/> Approve Loan Use
                  </button>
                  <button
                    onClick={() => handleReviewAction(selectedCase.id, 'Rejected')}
                    className="flex-1 bg-red-600 text-white py-4 rounded-xl hover:bg-red-700 font-extrabold transition duration-300 shadow-2xl flex items-center justify-center text-lg transform hover:scale-[1.02] glow-shadow-red"
                  >
                    <AlertTriangle className="w-5 h-5 mr-2"/> Flag for Field Visit
                  </button>
                </div>
              )}
              {selectedCase.reviewStatus && (
                 <div className="p-4 bg-indigo-900 rounded-xl text-center font-bold text-lg text-teal-400 border-2 border-indigo-700 shadow-inner">
                    Review {selectedCase.reviewStatus} by Officer.
                 </div>
              )}
            </div>
          ) : (
            <div className="text-center mt-20 p-8 bg-gray-800 rounded-xl border-2 border-dashed border-gray-700 shadow-inner dashboard-card">
              <TrendingUp className="w-12 h-12 mx-auto text-teal-500 mb-3"/>
              <p className="text-gray-400 text-xl font-medium">Select a case to begin remote verification.</p>
              {isLoading && <Loader className="w-8 h-8 mx-auto mt-4 animate-spin text-teal-500"/>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [activeTab, setActiveTab] = useState('beneficiary'); // 'beneficiary' or 'officer'
  const [fetchTrigger, setFetchTrigger] = useState(0); 

  const handleSyncComplete = useCallback(() => {
    setFetchTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8 font-sans">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #111827; } /* Deeper background */
        
        /* Custom Text Shadows for that high-tech glowing look */
        .text-shadow-red { text-shadow: 0 0 5px rgba(239, 68, 68, 0.7); } /* Red 500 */
        .text-shadow-teal { text-shadow: 0 0 5px rgba(20, 184, 166, 0.7); } /* Teal 500 */
        .text-shadow-white { text-shadow: 0 0 5px rgba(255, 255, 255, 0.4); } 
        
        /* Dashboard Card Effect - Makes cards float */
        .dashboard-card {
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3), inset 0 0 5px rgba(255, 255, 255, 0.05);
        }
        /* List Item Glow Effect for Selection */
        .list-glow {
            box-shadow: 0 0 15px rgba(20, 184, 166, 0.5); /* Teal glow */
        }


        /* High-contrast mobile frame styling */
        .mobile-frame {
            position: relative;
            background: linear-gradient(135deg, #0f172a, #1e293b); /* Sleek gradient */
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9);
            border: 10px solid #000;
        }
        .mobile-frame::before {
            content: '';
            position: absolute;
            top: 0.5rem;
            left: 50%;
            transform: translateX(-50%);
            width: 40%;
            height: 8px;
            background-color: #374151;
            border-radius: 4px;
        }
        /* Custom Button Hover/Active State */
        .mobile-btn {
            transform: scale(1);
            transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
        }
        .mobile-btn:hover {
            transform: scale(1.02);
            box-shadow: 0 6px 8px rgba(0,0,0,0.3);
        }
        .mobile-btn:active {
            transform: scale(0.98);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        /* Button Glow Effects */
        .glow-shadow-teal {
            box-shadow: 0 0 10px rgba(20, 184, 166, 0.8), inset 0 0 5px rgba(20, 184, 166, 0.5); 
        }
        .glow-shadow-indigo {
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.6), inset 0 0 5px rgba(99, 102, 241, 0.3);
        }
        .glow-shadow-green {
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.7), inset 0 0 5px rgba(34, 197, 94, 0.4);
        }
        .glow-shadow-red {
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.7), inset 0 0 5px rgba(239, 68, 68, 0.4);
        }

        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #374151; 
            border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background-color: #1e293b; /* Match dashboard background */
        }
        /* Pulse animation for Suspicious status */
        .pulse-bg {
            animation: pulse-red 2s infinite;
        }
        @keyframes pulse-red {
          0%, 100% { background-color: #ef4444; } /* Red 500 */
          50% { background-color: #b91c1c; } /* Darker Red */
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Main Header (Updated to Dhan Sakshi) */}
        <header className="mb-8 p-6 bg-gray-800 rounded-xl shadow-2xl border-t-4 border-indigo-500 text-white dashboard-card">
            <h1 className="text-5xl font-extrabold text-indigo-400 flex items-center text-shadow-white">
                <Users className="w-10 h-10 mr-4 text-teal-400"/>
                <div className="flex flex-col">
                  <span><center>धन साक्षी (Dhan Sakshi)</center></span>
                  <p className="text-gray-400 text-lg font-medium mt-1"><center>Empowering Rural Livelihoods with Tech-Driven Microfinance</center></p>
                </div>
            </h1>
        </header>

        {/* Tab Navigation */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setActiveTab('beneficiary')}
            className={`px-8 py-3 rounded-t-xl font-extrabold text-xl transition duration-300 shadow-2xl transform hover:scale-[1.01] ${
              activeTab === 'beneficiary'
                ? 'bg-gray-800 border-b-4 border-teal-500 text-teal-400 text-shadow-teal'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Beneficiary (Mobile App Demo)
          </button>
          <button
            onClick={() => setActiveTab('officer')}
            className={`px-8 py-3 rounded-t-xl font-extrabold text-xl transition duration-300 shadow-2xl transform hover:scale-[1.01] ${
              activeTab === 'officer'
                ? 'bg-gray-800 border-b-4 border-red-500 text-red-400 text-shadow-red'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Officer (AI/Remote Review Dashboard)
          </button>
        </div>

        {/* Main Content Area */}
        <div className="bg-gray-800 rounded-b-xl rounded-r-xl shadow-2xl p-6 h-[75vh] dashboard-container">
          {activeTab === 'beneficiary' && <BeneficiaryApp onSyncComplete={handleSyncComplete} />}
          {activeTab === 'officer' && <OfficerDashboard fetchTrigger={fetchTrigger} />}
        </div>
      </div>
    </div>
  );
};

export default App;
