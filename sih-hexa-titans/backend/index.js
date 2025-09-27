const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Enable CORS for local development (React frontend on port 3000)
app.use(cors());
app.use(bodyParser.json());

// Mock database (In-memory list for the hackathon demo)
const mock_database = [];

// --- Mock AI Function (Replaces Python script) ---
const runAiCheck = (caseData) => {
    // Randomly assign status for the demo (33% chance of suspicion)
    const isSuspicious = Math.random() < 0.33;
    let status, confidence, reason;

    if (isSuspicious) {
        status = "Suspicious";
        confidence = `${(Math.random() * (85.0 - 70.0) + 70.0).toFixed(1)}%`;
        reason = "Image analysis suggests metadata tampering or photo-of-a-photo submission.";
    } else {
        status = "Verified";
        confidence = `${(Math.random() * (99.9 - 90.0) + 90.0).toFixed(1)}%`;
        reason = "Asset type confirmed. Geo-tag matches loan location.";
    }

    return {
        case_id: caseData.id,
        ai_status: status,
        confidence: confidence,
        ai_reason: reason
    };
};

// Add initial mock case data when the server starts
const initializeMockData = () => {
    // Case 1 (Verified)
    const verifiedCase = runAiCheck({ id: 'CASE-87345' });
    mock_database.push({
        ...verifiedCase,
        beneficiary: 'Pravin R.', 
        timestamp: new Date().toISOString(),
        gps: '14.5087° N, 75.9221° E',
        assetImage: 'https://placehold.co/400x300/c7f0d8/005e4b?text=Tractor+Verified'
    });
    
    // Case 2 (Suspicious)
    const suspiciousCase = runAiCheck({ id: 'CASE-33109' });
    suspiciousCase.ai_status = 'Suspicious'; // Force it to be suspicious for the demo
    suspiciousCase.confidence = '71.2%';
    suspiciousCase.ai_reason = 'Image metadata suggests tampering or photo-of-a-photo submission.';

    mock_database.push({
        ...suspiciousCase,
        beneficiary: 'Sunita M.', 
        timestamp: new Date().toISOString(),
        gps: '17.3850° N, 78.4867° E',
        assetImage: 'https://placehold.co/400x300/ffdddd/cc0000?text=Suspicious+Photo'
    });
};

// --- 1. UPLOAD/SYNC API (/api/upload) ---
app.post('/api/upload', (req, res) => {
    try {
        const casesToSync = req.body.cases || [];
        if (casesToSync.length === 0) {
            return res.status(200).json({ message: "No new cases to process." });
        }

        let newCasesCount = 0;
        for (const caseData of casesToSync) {
            // 1. Simulate AI Check 
            const aiResult = runAiCheck(caseData);
            
            // 2. Update case with AI result and prepare for review
            mock_database.push({
                ...caseData,
                ...aiResult,
                reviewStatus: null,
                beneficiary: caseData.beneficiary || 'Default User'
            });
            newCasesCount++;
        }

        return res.status(200).json({ message: `Successfully synced and processed ${newCasesCount} case(s). Officer dashboard updated.` });

    } catch (e) {
        console.error("Error during upload:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// --- 2. OFFICER DASHBOARD API (/api/cases) ---
app.get('/api/cases', (req, res) => {
    return res.json(mock_database);
});

// --- 3. OFFICER ACTION API (/api/review) ---
app.post('/api/review', (req, res) => {
    try {
        const { case_id, action } = req.body;
        
        const caseToReview = mock_database.find(c => c.id === case_id);

        if (caseToReview) {
            caseToReview.reviewStatus = action;
            caseToReview.officer = 'Officer ID: XYZ789 (Mocked)';
            
            console.log(`--- BLOCKCHAIN SIMULATION --- Logging final action '${action}' for ${case_id} to the immutable ledger.`); 
            
            return res.status(200).json({ message: `Case ${case_id} marked as ${action}` });
        }

        return res.status(404).json({ message: "Case not found" });
    } catch (e) {
        console.error("Error during review:", e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    initializeMockData();
    console.log(`Node.js Backend Server running on http://localhost:${PORT}`);
});
