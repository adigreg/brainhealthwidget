import logging
from flask import Flask, request, jsonify
from flask import render_template
import logging
import os
import csv
import json
import requests
import logging
from './transformjson.py' import transform_json

app = Flask(__name__)

@app.route("/")
def main():
    patientData = getPatientData()
    return render_template('index.html',patientData=patientData)

def getPatientData():
    file_path = os.path.join(os.getcwd(), 'static', "data", "ms_fit_results.json")
    with open(file_path) as json_data:
        d = json.load(json_data)
        transform_json(d)
        return d