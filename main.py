import logging
from flask import Flask, request, jsonify
from flask import render_template
import logging
import os
import csv
import requests
import logging

app = Flask(__name__)

@app.route("/")
def hello_world():
    file_name = 'datasources.csv'
    file_path = os.path.join(os.getcwd(), 'static', "data", file_name)
    categories_map = {}
    with open(file_path, 'r',encoding="Windows-1252") as csvfile:
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            if row['Set1'] not in categories_map:
                categories_map[row['Set1']] = {}
            if row['Set2'] not in categories_map[row['Set1']]:
                categories_map[row['Set1']][row['Set2']] = {}
            if row['Set3'] not in categories_map[row['Set1']][row['Set2']]:
                categories_map[row['Set1']][row['Set2']][row['Set3']] = {"severity":getSeverity(row['Set3'],row['Value']),"raw_value": row['Value'], "source": row['Source']}
    return render_template('index.html',jsonData=categories_map)

# Could return an opacity from 0 to 1 in increments of 0.2 based 
# on  
def getSeverity(field,rawValue):
    rawValue = float(rawValue)
    if field == "Systolic":
        return getSystolicSeverity(rawValue)
    elif field == "Diastolic":
        return getDiastolicSeverity(rawValue)
    elif field == "A1c":
        return getBloodSugarSeverity(rawValue)
    elif field == "Cholesterol":
        return getCholesterolSeverity(rawValue)
    elif field == "BMI":
        return getBmiSeverity(rawValue)
    elif field == "EtOH":
        return getAlcoholSeverity(rawValue)
    elif field == "physical activity/athletics":
        return getActivitySeverity(rawValue)
    elif field == "diet score":
        return getDietScoreSeverity(rawValue)
    elif field == "Smoking":
        return getSmokingSeverity(rawValue)
    elif field == "Sleep":
        return getSleepSeverity(rawValue)
    elif rawValue > 80:
        return 0.6
    elif rawValue > 40:
        return 0.4
    else:
        return 0.2
    
def getDiastolicSeverity(value):
    if value > 120:
        return 0.8
    elif value > 90:
        return 0.6
    elif value > 80:
        return 0.4
    else:
        return 0.2

def getSystolicSeverity(value):
    if value > 180:
        return 0.8
    elif value > 140:
        return 0.6
    elif value > 130:
        return 0.5
    elif value > 120:
        return 0.4
    else:
        return 0.2

def getBloodSugarSeverity(value):
    if value > 6.4:
        return 0.8
    elif value > 5.7:
        return 0.6
    else:
        return 0.2

def getCholesterolSeverity(value):
    if value > 190:
        return 0.6
    else:
        return 0.2

def getBmiSeverity(value):
    if value > 30:
        return 0.6
    elif value > 25 or value < 18.5:
        return 0.4
    else:
        return 0.2

def getDietScoreSeverity(value):
    if value == 0:
        return 0.6
    elif value == 1:
        return 0.4
    elif value == 2:
        return 0.2

def getAlcoholSeverity(value):
    if value >= 4:
        return 0.6
    elif value == 2 or value == 3:
        return 0.4
    elif value <= 1:
        return 0.2

def getSmokingSeverity(value):
    if value == 1:
        return 0.6
    elif value > 1:
        return 0.2

def getActivitySeverity(value):
    if value < 150:
        return 0.6
    else:
        return 0.2

def getSleepSeverity(value):
    if value < 7:
        return 0.6
    elif value >= 8:
        return 0.2