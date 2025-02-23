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

def compute_is_bad(data_type, value, variable_min, variable_max):
    if value == "":
        return False
    if data_type == "value":
        return int(variable_min) > int(value) or int(variable_max) < int(value)
    elif data_type == "boolean":
        return int(value)
    else:
        return False

def transform_to_flare(data):
    flare = {"name": "brainhealth", "children": []}
    category_dict = {}
    subset_dict = {}
    
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
            subset_dict[subset]["children"].append({
                "key": key,
                "name": item["display_name"] if item["display_name"] != "" else item["parameter"],
                "value": item["value"],
                "min": -1 if item["data_type"] != "value" else item["min"],
                "max": -1 if item["data_type"] != "value" else item["max"],
                "data_source": item["data_source"],
                "is_bad": compute_is_bad(item["data_type"],item["value"],item["min"],item["max"]),
                "size": 1,
            })
    
    for k,category_data in category_dict.items():
        for subset_object in category_dict[k]["children"]:
            for subset_data in subset_dict[subset_object["name"]]["children"]:
                subset_object["children"].append(subset_data)
    
    for category_final_data in category_dict.values():
        flare["children"].append(category_final_data)
    return flare