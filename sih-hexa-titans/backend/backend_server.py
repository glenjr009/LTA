from flask import Flask, request, jsonify
from ai_fraud_check_mock import run_ai_check
from flask_cors import CORS 

app = Flask(__name__)
# Enable CORS for local development (allows React frontend on port 3000 to access Flask on port 5000)
CORS(app) 

# Mock database (In-memory list for the hackathon demo)
mock_database = []

# --- 1. UPLOAD/SYNC API (/api/upload) ---
@app.route('/api/upload', methods=['POST'])
def sync_upload():
    """Receives synced cases, simulates AI processing, and updates status."""
    try:
        data = request.json
        cases_to_sync = data.get('cases', [])

        if not cases_to_sync:
            return jsonify({"message": "No new cases to process."}), 200

        new_cases_count = 0
        for case_data in cases_to_sync:
            # 1. Simulate AI Check on the server side
            ai_result = run_ai_check(case_data)
            
            # 2. Update case with AI result and prepare for review
            case_data['ai_status'] = ai_result['ai_status']
            case_data['confidence'] = ai_result['confidence']
            case_data['ai_reason'] = ai_result['ai_reason']
            case_data['reviewStatus'] = None
            case_data['beneficiary'] = case_data.get('beneficiary', 'Default User')
            
            # 3. Add to the global mock database (new cases appear immediately)
            mock_database.append(case_data)
            new_cases_count += 1

        return jsonify({"message": f"Successfully synced and processed {new_cases_count} case(s). Officer dashboard updated."}), 200

    except Exception as e:
        print(f"Error during upload: {e}")
        return jsonify({"message": "Internal Server Error", "error": str(e)}), 500

# --- 2. OFFICER DASHBOARD API (/api/cases) ---
@app.route('/api/cases', methods=['GET'])
def get_cases():
    """Returns all cases for the officer dashboard."""
    return jsonify(mock_database), 200

# --- 3. OFFICER ACTION API (/api/review) ---
@app.route('/api/review', methods=['POST'])
def review_case():
    """Allows officer to approve or reject a case (Final decision)."""
    try:
        review_data = request.json
        case_id = review_data.get('case_id')
        action = review_data.get('action') # 'Approved' or 'Rejected'
        
        for case in mock_database:
            if case['id'] == case_id:
                case['reviewStatus'] = action
                case['officer'] = 'Officer ID: XYZ789 (Mocked)'
                
                # BLOCKCHAIN SIMULATION: Log final decision
                print(f"--- BLOCKCHAIN SIMULATION --- Logging final action '{action}' for {case_id} to the immutable ledger.") 
                
                return jsonify({"message": f"Case {case_id} marked as {action}"}), 200

        return jsonify({"message": "Case not found"}), 404

    except Exception as e:
        print(f"Error during review: {e}")
        return jsonify({"message": "Internal Server Error"}), 500


if __name__ == '__main__':
    # Add initial mock case data when the server starts
    # Case 1 (Verified)
    initial_case_verified = run_ai_check({'id': 'CASE-87345'})
    initial_case_verified.update({
        'beneficiary': 'Pravin R.', 
        'timestamp': '2025-09-25T10:00:00Z',
        'gps': '14.5087° N, 75.9221° E',
        'assetImage': 'https://placehold.co/400x300/c7f0d8/005e4b?text=Tractor+Verified'
    })
    mock_database.append(initial_case_verified)
    
    # Case 2 (Suspicious)
    initial_case_suspicious = run_ai_check({'id': 'CASE-33109'})
    initial_case_suspicious.update({
        'ai_status': 'Suspicious',
        'confidence': '71.2%',
        'ai_reason': 'Image metadata suggests tampering or photo-of-a-photo submission.',
        'beneficiary': 'Sunita M.', 
        'timestamp': '2025-09-26T14:30:00Z',
        'gps': '17.3850° N, 78.4867° E',
        'assetImage': 'https://placehold.co/400x300/ffdddd/cc0000?text=Suspicious+Photo'
    })
    mock_database.append(initial_case_suspicious)
    
    print("Starting Flask Backend Server on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)