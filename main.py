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
    ehrData = getEhrData()
    redcapData = getRedcapData()
    return render_template('index.html',ehrResult=ehrData,redcapResult=redcapData)

@app.route("/getEhrData")
def getEhrData():
    ehr_result = 'ehr_result.json'
    return parseAndReturnJsonResult(ehr_result)

@app.route("/getRedcapData")
def getRedcapData():
    redcap_result = 'redcap_study.json'
    return parseAndReturnJsonResult(redcap_result)

def parseAndReturnJsonResult(file_name):
    file_path = os.path.join(os.getcwd(), 'static', "data", redcap_result)
    with open(file_path) as json_data:
        d = json.load(json_data)
        return d