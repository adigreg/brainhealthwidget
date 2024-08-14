import logging
from flask import Flask, request, jsonify
from flask import render_template
import logging

app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template('index.html',text="Hello!!!")