import logging
from flask import Flask, request, jsonify
from flask import render_template
import logging
import os
import csv
import json
import requests
import logging

app = Flask(__name__)

@app.route("/")
def main():
    file_path = os.path.join(os.getcwd(), 'static', "data", "brainhealthdata.json")
    with open(file_path) as json_data:
        d = json.load(json_data)
        flare_json = transform_to_flare(d)
        return render_template('index.html',patientFlareData=flare_json)

def get_impact_and_description(data_type, value, score_limits):
    if data_type == "value":
        numeric_val = 0
        try:
            numeric_val = int(value)
        except ValueError:
            return [0,""]
        max_impact_score = -100
        for score_category in score_limits:
            if score_category["max"] == -1 or score_category["min"] == -1:
                return [0,score_category["description"]] # scoring not appropriate for this field
            if numeric_val >= score_category["min"] and numeric_val <= score_category["max"]:
                return [score_category["impact_score"],score_category["description"]]
    return [0,""]





    

def transform_to_flare(data):
    flare = {"name": "brainhealth", "children": []}
    category_dict = {}
    subset_dict = {}
    gender = data["gender"]
    for key, item in data["brainhealth"].items():
        category = item["category"]
        subset = item["subset"]
        name = item["display_name"]
        
        if category not in category_dict:
            category_dict[category] = {"name": category, "children": []}
        if subset not in [val["name"] for val in category_dict[category]["children"]]:
            category_dict[category]["children"].append({"name": subset, "children": []})
        
        if subset not in subset_dict:
            subset_dict[subset] = {"name": subset, "children": []}
        if name not in [val["name"] for val in subset_dict[subset]["children"]]:
            impact_score, description = get_impact_and_description(item["data_type"],item["value"],item["score_limits"][gender])
            subset_dict[subset]["children"].append({
                "key": key,
                "name": item["display_name"] if item["display_name"] != "" else item["parameter"],
                "value": item["value"],
                "min": -1 if item["data_type"] != "value" else item["score_limits"]["total_range"][0]["min"],
                "max": -1 if item["data_type"] != "value" else item["score_limits"]["total_range"][0]["max"],
                "data_source": item["data_source"],
                "impact_score": impact_score,
                "description": description,
                "size": 1,
                "related_conditions": ["Stroke","Dementia","Palsy"] if key == "gene_ancestry" else [],
            })
    
    for k,category_data in category_dict.items():
        for subset_object in category_dict[k]["children"]:
            for subset_data in subset_dict[subset_object["name"]]["children"]:
                subset_object["children"].append(subset_data)
    
    for category_final_data in category_dict.values():
        flare["children"].append(category_final_data)
    return flare