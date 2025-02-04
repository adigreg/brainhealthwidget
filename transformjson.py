import json


def compute_score(field_name, value, variable_max):
    """Compute score based on field-specific logic using a dictionary-based switch."""
    is_float = False
    try:
        value = float(value)
        is_float = True
    except (ValueError, TypeError):
        is_float = False

    # Dictionary-based switch statement
    score_calculations = {
        "total_falls": compute_score_from_presence,  # If there is a fall at all
        "severe_falls": compute_score_from_presence,  # If there is a fall at all
        "total_nearfalls": compute_score_from_presence,  # If there is a fall at all
        "abc_percent_score": lambda is_float,v,vm: 1 if v == "Present" else 0,  # If present or not
        "vision_total_score": compute_score_from_max,  # out of max
        "predss": compute_score_from_max,  # out of max
        "mfis_score": compute_score_from_max,  # out of max
        "blcs_total_score": compute_score_from_max,  # Keep raw value
        "psqi_final": compute_score_from_max,  # Keep raw value
        "total_score": compute_score_from_max,  # Normalize walking score
        "neuro_pt": lambda is_float,v,vm: 0 if v == "No" else 1,  # if pt
        "phq9_total_score_485194": compute_score_from_max,  # out of max
        "Disease Duration": lambda is_float,v,vm: round((float(v.split()[0]) / vm) * 100, 2) if isinstance(v, str) and v.split()[0].isdigit() else None,
        "Age": lambda is_float,v,vm: 0,  # no score
        "sdoh": lambda is_float,v,vm: 1 if v == "Needs Identified" else 0,  # Binary scoring
        "substance_use": lambda is_float,v,vm: 0 if v == "Negative" else 1,  # Binary scoring
        "bone_density": compute_score_from_max,  # out of max
        "tbd14": lambda is_float,v,vm: 0,  # No value for Physical Activity
        "tbd8": lambda is_float,v,vm: 0,  # No value for Medication effects
        "tbd11": lambda is_float,v,vm: 0,  # No value for Other risk factors
        "edss": compute_score_from_max,  # out of max
        "walk_score": lambda is_float,v,vm: 0,  # Keep walkability as is
    }

    # Default behavior: Normalize to 100 if variable_max is positive
    return float(score_calculations.get(field_name)(is_float, value, variable_max))

def compute_score_from_max(is_float,v,vm):
    return round((v / vm) * 100, 2) if is_float else 0

def compute_score_from_presence(is_float,v,vm):
    return 1 if is_float and v >=1 else 0

def transform_json(data):
    """Transform the input JSON into the desired format."""
    survey_responses = data.get("fit_data", {}).get("survey_responses", {})
    transformed_data = {}

    for key, details in survey_responses.items():
        new_entry = {
            "display_name": details.get("display_name"),
            "action": details.get("action"),
            "value": details.get("value"),
            "score": compute_score(key,details.get("value"), details.get("variable_max"))
        }
        transformed_data[key] = new_entry

    return {"fit_data": {"survey_responses": transformed_data}}

# Transform the JSON
with open("./static/data/ms_fit_results.json", "r") as file:
    data = json.load(file)
    transformed_json = transform_json(data)
    # Print the output JSON
    print(json.dumps(transformed_json, indent=4))