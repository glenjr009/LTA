import random

def run_ai_check(case_data):
    """
    Simulates the AI's tamper and asset verification check.
    For the hackathon demo, this returns a random 'Suspicious' or 'Verified' status.
    """
    case_id = case_data.get('id')
    
    # Randomly assign status for the demo (33% chance of suspicion)
    if random.random() < 0.33:
        status = "Suspicious"
        confidence = round(random.uniform(70.0, 85.0), 1)
        reason = "Image analysis suggests metadata tampering or photo-of-a-photo submission."
    else:
        status = "Verified"
        confidence = round(random.uniform(90.0, 99.9), 1)
        reason = "Asset type confirmed. Geo-tag matches loan location."

    ai_result = {
        "case_id": case_id,
        "ai_status": status,
        "confidence": f"{confidence}%",
        "ai_reason": reason
    }
    
    return ai_result