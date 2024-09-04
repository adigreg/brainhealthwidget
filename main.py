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
                categories_map[row['Set1']][row['Set2']][row['Set3']] = {"score": row['Score'], "source": row['Source']}
    return render_template('index.html',jsonData=categories_map)