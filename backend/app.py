import glob
import os
from os import path
from flask import Flask, flash, request, Response, jsonify
from flask_cors import CORS, cross_origin

app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

from werkzeug.utils import secure_filename

from pysat.formula import CNF
from pysat.solvers import Solver

from pysat.allies.approxmc import Counter

import tempfile
from tempfile import NamedTemporaryFile

from copy import copy
import re

import single_model
from single_model import Model
from multi_model import History

from redislite import Redis
redis_connection = Redis('/tmp/redis.db')

import random

# Preliminaries -----------------------------------------------------------------------------------

UPLOAD_FOLDER = '/tmp/'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.secret_key = os.urandom(32)

solvers = dict()
histories = dict()


# Default Routes  ---------------------------------------------------------------------------------

@app.route('/', methods = ["GET", "POST"])
@cross_origin()
def index():
    return Response("Flask Analysis Backend Running", status = 200)


# Single Model Routes -----------------------------------------------------------------------------

@app.route('/register_formula', methods = ["POST"])
@cross_origin()
def register_file():
    if "file" not in request.files:
        flash("no file supplied")
        return Response("no file supplied", status = 422)

    file = request.files["file"]

    if not file or file.filename == "":
        flash("no file supplied")
        return Response("no file supplied", status = 422)

    filename = secure_filename(file.filename)

    if app.debug:
        persname = "/tmp/test"
    else:
        persname = NamedTemporaryFile(dir = UPLOAD_FOLDER).name
    
    file.save(persname)

    try:        
        model = Model(persname)

        return Response(model.ident, status = 200)
    except ValueError:
        return Response("Invalid CNF", status = 417)


@app.route('/formula/<ident>', methods = ["GET", "POST"])
@cross_origin()
def view_formula(ident):

    with open(path.join(UPLOAD_FOLDER, ident)) as file:
        data = file.read()

    return Response(data, status = 200)


@app.route('/formula/<ident>/verify', defaults = dict(raw = False), methods = ["POST"])
@app.route('/formula/<ident>/verify/raw', defaults = dict(raw = True), methods = ["POST"])
@cross_origin()
def verify_config(ident, raw = True):

    data = assure_json(request)

    model, r = assure_formula(ident)
    if model is None:
        return r

    config = data.get("config", None)
    config, r = assure_config(config, model, raw)
    if config is None:
        return r

    solver = model.solver

    if solver.solve(config):
        if raw:
            data = dict(valid = True, solution = solver.get_model())
        else:
            data = dict(valid = True, solution = model.convert_ids2names(solver.get_model()))
    else:        
        if raw:
            data = dict(valid = False, refutation = solver.get_core())
        else:
            data = dict(valid = False, refutation = model.convert_ids2names(solver.get_core()))

    return jsonify(data), 200


def temp_config(config, x):
    config = copy(config)
    config.append(x)

    return config


@app.route('/formula/<ident>/dp', defaults = dict(raw = False), methods = ["POST"])
@app.route('/formula/<ident>/dp/raw', defaults = dict(raw = True), methods = ["POST"])
@cross_origin()
def dp(ident, raw = True):

    data = assure_json(request)
    config = data.get("config", None)

    model, r = assure_formula(ident)
    if model is None:
        return r
    
    config, r = assure_config(config, model, raw)
    if config is None:
        return r
  
    valid, config, simp, dimp, free = model.dp(config)

    if not valid:
        return jsonify(dict(valid = False)), 200

    data = dict(valid = True, config = config, implicit_selected = simp, implicit_deselected = dimp, free = free)

    return jsonify(data), 200


@app.route('/formula/<ident>/deadcore', defaults = dict(raw = False), methods = ["POST"])
@app.route('/formula/<ident>/deadcore/raw', defaults = dict(raw = True), methods = ["POST"])
@cross_origin()
def deadcore(ident, raw = True):
    
    model, r = assure_formula(ident)
    if model is None:
        return r

    data = {
        "cores": sorted(model.cores),
        "deads": sorted(model.deads)
    }

    return jsonify(data), 200


@app.route('/formula/<ident>/count_approx', defaults = dict(raw = False), methods = ["POST"])
@app.route('/formula/<ident>/count_approx/raw', defaults = dict(raw = True), methods = ["POST"])
def count_approx(ident, raw):

    data = assure_json(request)
    config = data.get("config", None)

    model, r = assure_formula(ident)
    if model is None:
        return r

    if config:
        config, r = assure_config(config, model, raw)
        if config is None:
            return r

    with Counter(model.formula) as counter:
        if config:
            counter.add_clause(config)

        data = dict(ssat = counter.count())

    return jsonify(data, 200)


def assure_formula(ident):

    model = single_model.get_model_by_ident(ident)

    if model is None:
        return None, Response(f"Key {ident} unknown", status = 404)

    return model, None


def assure_config(config, model, raw):

    if config is None:
        return [], None

    if type(config) == list:
        if len(config) == 0:
            return [], None

        if raw:
            if (t := type(config[0])) != int:
                return None, Response(f"{config} not of type [int] but [{t}] and /raw", status = 417)
        else:
            if (t := type(config[0])) != str:
                return None, Response(f"{config} not of type [str] but [{t}] and not /raw", status = 417)

            config = model.convert_names2ids(config)

    return config, None


def assure_variables(variables, model, raw, none_to_all = False):

    formula = model.formula

    if variables is None:
        if none_to_all:
            return range(1, formula.nv + 1), None
        else:
            return [], None

    if type(variables) == list:
        if len(variables) == 0:
            return [], None

        if raw:
            if (t := type(variables[0])) != int:
                return None, Response(f"{variables} not of type [int] but [{t}] and /raw", status = 417)
        else:
            if (t := type(variables[0])) != str:
                return None, Response(f"{variables} not of type [str] but [{t}] and not /raw", status = 417)

            variables = model.convert_names2ids(variables)

    return variables, None


def assure_json(request):

    if request.headers.get("CONTENT_TYPE", "") == 'application/json':
        return request.get_json()

    return dict()


@app.route('/formula/<ident>/comm_approx', defaults = dict(raw = False), methods = ["POST"])
@app.route('/formula/<ident>/comm_approx/raw', defaults = dict(raw = True), methods = ["POST"])
def commonality_approx(ident, raw = True):

    data = assure_json(request)

    config = data.get("config", None)
    variables = data.get("variables", None)

    model, r = assure_formula(ident)
    if model is None:
        return r

    if config:
        config, r = assure_config(config, model, raw)
        if config is None:
            return r

    variables, r = assure_variables(variables, model, raw, none_to_all = True)
    if variables is None:
        return r

    data = dict()

    for x in variables:
        with Counter(model.formula) as counter:
            if config:
                counter.add_clause(config)
            
            counter.add_clause([x])
            count = counter.count()

        if raw:
            data[x] = count
        else:
            data[model.ids2names[x]] = count

    return jsonify(data, 200)


# Multi Model Routes ------------------------------------------------------------------------------

@app.route('/register_history/<history_name>', methods = ["POST"])
@cross_origin()
def register_history(history_name):

    tempdir = tempfile.mkdtemp()

    files = []

    for file in request.files.getlist("files[]"):
        filename = path.basename(file.filename)
        filename = secure_filename(filename)
        
        pathname = path.join(tempdir, filename)

        file.save(pathname)
        files.append(pathname)

    history = History(history_name, *sorted(files))

    ident = f'{history_name}-{"".join([str(random.randint(0, 9)) for _ in range(16)])}'

    histories[ident] = history

    return Response(ident, status = 200)


@app.route('/history/<ident>', methods = ["POST"])
@cross_origin()
def view_history(ident):

    history = histories.get(ident)

    if history is None:
        return Response(f"History {ident} unknown", status = 404)

    return jsonify(history.info())


@app.route('/history/<ident>/configure', methods = ["POST"])
@cross_origin()
def configure(ident):

    data = assure_json(request)
    config = data.get("config", None)
    versions = data.get("versions", None)
    
    history = histories.get(ident)    
    
    if history is None:
        return Response(f"History {ident} unknown", status = 404)


    configuration = history.configure()

    ret = configuration.configure(config = config, versions = versions)

    if ret is False:
        return jsonify(dict(valid = False))

    return jsonify(configuration.answer())


@app.route('/example', methods=["GET"])
@cross_origin()
def get_example():

    files = sorted(glob.glob("testdata/fiasco*.dimacs"))

    history_name = "example-fiasco"

    history = History(history_name, *sorted(files))

    ident = f'{history_name}-{"".join([str(random.randint(0, 9)) for _ in range(16)])}'

    histories[ident] = history

    return Response(ident, status=200)