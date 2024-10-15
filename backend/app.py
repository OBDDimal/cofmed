import glob
import os
from os import path


def basic_secure_filename(filename):
    return filename.replace(" ", "_").replace("!", "").replace("?", "")




import tempfile
from tempfile import NamedTemporaryFile

from copy import copy
import re


import random


from pyodide.ffi import to_js, create_proxy, JsProxy

import io
import pyodide.ffi

import json
from js import JSON


# Preliminaries -----------------------------------------------------------------------------------

UPLOAD_FOLDER = '/tmp/'


solvers = dict()
histories = dict()


# Default Routes  ---------------------------------------------------------------------------------
"""
@app.route('/', methods = ["GET", "POST"])
@cross_origin()
def index():
    return Response("Flask Analysis Backend Running", status = 200)

"""
# Single Model Routes -----------------------------------------------------------------------------   Noch nicht implementiert im Frontend


"""
#@app.route('/register_formula', methods = ["POST"])
#@cross_origin()
async def register_file(files):  
    #print("HALLO")

    print("RegisterFile")
    fileList = await files

    #fileList = fileList.topy()


    fileList = fileList.to_py()

    print(fileList)

    #if "file" not in request.files:
    if len(files) == 0:
        #flash("no file supplied")
        #return Response("no file supplied", status = 422)

        return "no file supplied"

    #file = request.files["file"]
    file = files[0]

    #if not file or file.filename == "":
    if not file or file.name == "":
        #flash("no file supplied")
        #return Response("no file supplied", status = 422)
        return "no file supplied"

    #filename = secure_filename(file.filename)
    #filename = basic_secure_filename(file.filename)
    filename = basic_secure_filename(file.name)

    #if app.debug:
    #    persname = "/tmp/test"
    #else:
    #    persname = NamedTemporaryFile(dir = UPLOAD_FOLDER).name
    
    #file.save(persname)


    tempdir = "/tmp/test"


    file_path = file["path"]
    with open(file_path, 'rb') as f:
        content = f.read()

    
    pathname = os.path.join(tempdir, filename)

        

    with open(pathname, 'wb') as f:
        f.write(content)


    try:        
        model = Model(persname)

        return Response(model.ident, status = 200)
    except ValueError:
        return Response("Invalid CNF", status = 417)

"""

# Multi Model Routes ------------------------------------------------------------------------------


from os import path
import hashlib
from copy import copy
import re
from itertools import chain

def hash_file(filepath):
    with open(filepath, "rb") as f:
        hash_is = hashlib.md5()
        while chunk := f.read(8192):
            hash_is.update(chunk)
    return hash_is.hexdigest()



def simplify_unit_clauses(cnf):
    
    clauses = copy(cnf.clauses)
    unit_clauses = {clause[0] for clause in clauses if len(clause) == 1}
    decided = set(unit_clauses)

    while unit_clauses:
        unit = unit_clauses.pop()
        clauses = [clause for clause in clauses if unit not in clause] 
        for clause in clauses:
            if -unit in clause:
                clause.remove(-unit)  
                if len(clause) == 1:
                    unit_clauses.add(clause[0])

    simplified_cnf = CNF(from_clauses=clauses)
    simplified_cnf.comments = cnf.comments
    return simplified_cnf, decided

def simplify_yield_unit_clauses(cnf):
    simplified_cnf, decided = simplify_unit_clauses(cnf)

    cores = set.intersection(*[{abs(lit) for lit in clause} for clause in simplified_cnf.clauses])
    all_vars = {abs(lit) for clause in simplified_cnf.clauses for lit in clause}
    deads = all_vars.difference(cores)

    return simplified_cnf, cores, deads

class CNF:
    def __init__(self, from_clauses=None, from_file=None):
        self.clauses = []
        self.comments = []
        if from_clauses:
            self.clauses = from_clauses
        elif from_file:
            self.read_from_file(from_file)

    def read_from_file(self, filepath):
        with open(filepath, 'r') as f:
            for line in f:
                if line.startswith('c'):
                    self.comments.append(line.strip())
                elif line.startswith('p'):
                    continue
                else:
                    self.clauses.append([int(x) for x in line.strip().split() if x != '0'])

class MultiConfiguration:

    def __init__(self, history):
        self.history = history
        self.id2versions = {i: v for i, v in enumerate(history.versions())}

        self.formula = None

        self.config = set()
        self.features_free = set(history.name2var.values())
        self.versions = set()
        self.versions_available = set(self.id2versions.keys())
        self.versions_disabled = set()

        cores = set.intersection(*self.history.it2cores.values())
        deads = set.intersection(*self.history.it2deads.values())

        self.config.update(cores)
        self.config.update({-x for x in deads})
        self.features_free = self.features_free.difference(cores).difference(deads)

    def configure(self, config=None, versions=None):
        if versions is not None:
            config_old = copy(self.config)
            versions = set(versions).difference(self.versions)

            for version in versions:
                ret = self.select_version(version)

                if ret is False:
                    return False

        if config is not None:
            config = set(config).difference(self.config)

            for lit in config:
                ret = self.configure_features(lit)

                if ret is False:
                    return False

        return True

    def select_version(self, version):
        if version not in self.versions_available:
            return False

        self.versions.add(version)
        return self.version_dp(version)

    def configure_features(self, feature):
        if abs(feature) in self.features_free:
            self.config.add(feature)
            ret = self.version_dp()

            if ret is False:
                return False

            return self.feature_dp(feature)
        else:
            return False

    def version_dp(self, version=None):
        bootstrap_clauses = []

        if version is not None:
            version_cnf = self.history.get_cnf(self.id2versions[version])
            bootstrap_clauses.extend(version_cnf.clauses)

        if self.formula is None:
            for version in self.versions:
                cnf = self.get_cnf(version)
                bootstrap_clauses.extend(cnf.clauses)
        else:
            bootstrap_clauses.extend(self.formula.clauses)

        versions_disabled = copy(self.versions_disabled)

        for version in self.versions_available:
            cnf = self.get_cnf(version)
            clauses = bootstrap_clauses + cnf.clauses

            if not self.is_satisfiable(clauses):
                versions_disabled.add(version)

        if len(self.versions) == 0 and len(versions_disabled) == len(self.versions_available):
            return False

        self.versions_disabled = versions_disabled
        self.versions_available = self.versions_available.difference({abs(x) for x in self.versions}).difference(self.versions_disabled)

        cnf_temp = CNF(from_clauses=bootstrap_clauses)
        self.formula, cores, deads = simplify_yield_unit_clauses(cnf_temp)

        decided = cores.union({-x for x in deads}).difference(self.config)
        self.config.update(decided)

        for feature in decided:
            self.feature_dp(feature)

        self.features_free = self.features_free.difference({abs(x) for x in self.config})
        return True

    def feature_dp(self, feature):
        clauses = copy(self.formula.clauses)
        stack = [feature]
        decided = {feature}

        while stack:
            dec = stack.pop()

            for i, clause in enumerate(clauses):
                if clause is None:
                    continue

                if dec in clause:
                    clauses[i] = None
                    continue
                elif -dec in clause:
                    clause = [x for x in clause if x != -dec]

                    if len(clause) == 0:
                        return False
                    elif len(clause) == 1:
                        var = clause[0]
                        if var not in decided:
                            decided.add(var)
                            stack.append(var)
                        clauses[i] = None
                    else:
                        clauses[i] = clause

        if len(decided) != len({abs(x) for x in decided}):
            return False

        self.config.update(decided)
        self.features_free = self.features_free.difference({abs(x) for x in decided})

        clauses = [clause for clause in clauses if clause]

        self.formula, _ = simplify_unit_clauses(CNF(from_clauses=clauses))
 
        return True

    def finalize(self):
        self.versions.update(self.versions_available)
        self.versions_available = set()

        for version in self.versions:
            cnf = self.get_cnf(abs(version))
            satisfiable = self.is_satisfiable(cnf.clauses)

            if (satisfiable and version < 0) or (not satisfiable and version > 0):
                print("Should not happen")

        return self.versions, self.config

    def is_satisfiable(self, clauses):
        
        def backtrack(assignment, clauses):
            
            if all(any(lit in assignment for lit in clause) for clause in clauses):
                return True
            
            for clause in clauses:
                if not any(lit in assignment for lit in clause):
                    for lit in clause:
                        if -lit not in assignment:
                            
                            new_assignment = assignment + [lit]
                            if backtrack(new_assignment, clauses):
                                return True
            return False

        return backtrack([], clauses)

    def auto_complete(self):
        if self.is_satisfiable(self.formula.clauses):
            self.config = set()
            self.version_dp()

    def get_cnf(self, version):
        return self.history.get_cnf(self.id2versions[version])

    def __str__(self):
        return f'MC<{self.history.name}>: {self.config} {self.versions}'

    def answer(self):
        return dict(
            valid=True,
            config=sorted(self.config, key=abs),
            features_free=sorted(self.features_free),
            versions=sorted(self.versions),
            versions_disabled=sorted(self.versions_disabled)
        )




class  History:
    def __init__(self, name, *files, **kwargs):
        self.name = name
        self.hashes = set()
        self.name2var = dict()

        self.files = []
        self.it2original = dict()
        self.it2unified = dict()

        self.it2cores = dict()
        self.it2deads = dict()

        self.add(files)

    def info(self):
        return dict(variables=sorted(self.name2var.keys()), versions=self.versions(), mapping=self.name2var)

    def versions(self):
        return sorted(self.it2unified.keys())

    def get_cnf(self, version_key):
        return self.it2unified[version_key]

    def add(self, files):
        files_set = set(self.files)
        files_set.update(files)

        
        for file in files:
            if not path.exists(file):
                print(f"file not found: {file}")
                continue  
        
        

        new_variable = False

        for file in files:
            hsh = hash_file(file)

            if hsh in self.hashes:
                continue
            
            cnf = CNF(from_file=file)

            if len(cnf.clauses) < 5:
                continue

            self.hashes.add(hsh)

            self.it2original[file] = cnf

            if self.collect(cnf):
                new_variable = True

        

        for file, cnf in self.it2original.items():
            if file in self.it2unified and not new_variable:
                continue
            
            
            

            try:
                
                cnf2, _ = simplify_unit_clauses(cnf) 
                
            except ValueError as e:
                print("Error when simplifying the CNF:", e)

            
            

            try:
                cnf2 = self.unify(cnf2)
                
            except ValueError as e:
                print("Error when simplifying the CNF:", e)


            cnf2, cores, deads = simplify_yield_unit_clauses(cnf2)

            

            self.it2unified[file] = cnf2
            self.it2cores[file] = cores
            self.it2deads[file] = deads

    def collect(self, cnf):
        new_variable = False

        for line in cnf.comments:
            m = re.match(r"^c\s+(?P<var>\d+)\s+(?P<name>.+)$", line)
            if m:
                var, name = m.groups()
                if name not in self.name2var:
                    new_variable = True
                    self.name2var[name] = len(self.name2var) + 1

        return new_variable

    def get_old2new(self, cnf):
        old2new = dict()

        
        for line in cnf.comments:
            
            m = re.match(r"^c\s+(?P<var>\d+)\s+(?P<name>.+)$", line)
            if m:
                var, name = m.groups()
                old2new[int(var)] = self.name2var[name]

        return old2new

    def unify(self, cnf):
        
        old2new = self.get_old2new(cnf)

        clauses = []
        for clause in cnf.clauses:
            new_clause = [(1 if x > 0 else -1) * old2new.get(abs(x), None) for x in clause]
            
            if None in new_clause:
                raise ValueError(f"Mapping for one of the variables in clause {clause} is missing in old2new.")
            clauses.append(new_clause)


        for var in self.name2var.values():
            if var in old2new.values():
                continue
            clauses.append([-var])


        clauses = [sorted(clause, key=abs) for clause in clauses]
        clauses = sorted(clauses, key=len)

        comments = [(var, f"c {var} {name}") for name, var in self.name2var.items()]
        comments = sorted(comments, key=lambda x: x[0])
        comments = [x for _, x in comments]

        cnf2 = CNF(from_clauses=clauses)
        cnf2.nv = len(self.name2var)
        cnf2.comments = comments

        return cnf2

    def configure(self):
        return MultiConfiguration(self)




# Multi Model Routes ------------------------------------------------------------------------------

"""
async def register_history(history_name, fileList):


    files = []

    
    tempdir = "/tmp"
    if not os.path.exists(tempdir):
        os.makedirs(tempdir)


    fileList = await fileList


    fileList = fileList.to_py()
    

    for file in fileList:
        

        file_path = file["path"]
        with open(file_path, 'rb') as f:
            content = f.read()

        filename = path.basename(file["name"])
        filename = basic_secure_filename(filename)

        
        
        pathname = os.path.join(tempdir, filename)

        

        with open(pathname, 'wb') as f:
            f.write(content)


        files.append(pathname)

    history = History(history_name, *sorted(files))

    

    ident = f'{history_name}-{"".join([str(random.randint(0, 9)) for _ in range(16)])}'

    histories[ident] = history
    

    
    return ident
"""



async def register_history(history_name):


    fileList = []
    files = sorted(os.listdir('/tmp'))



    for file in files:
        
        path = '/tmp/' + file
        
        
        fileList.append(path)
        

    history = History(history_name, *sorted(fileList))

    ident = f'{history_name}-{"".join([str(random.randint(0, 9)) for _ in range(16)])}'

    histories[ident] = history
    
    

    
    return ident

    

def view_history(ident):   
    history = histories.get(ident)

    if history is None:
        
        return f"History {ident} unknown"

    return history.info()



def configure(ident, config, versions):

    
    history = histories.get(ident)    
    
    if history is None:
        
        return f"History {ident} unknown"


    configuration = history.configure()

    ret = configuration.configure(config = config, versions = versions)

    if ret is False:
        
        return dict(valid = False)

    
    return configuration.answer()



def get_example():

    fileList = []
    files = sorted(os.listdir('/tmp'))



    for file in files:
        
        path = '/tmp/' + file
        
        
        fileList.append(path)
        

    history_name = "example-fiasco"

    history = History(history_name, *sorted(fileList))

    ident = f'{history_name}-{"".join([str(random.randint(0, 9)) for _ in range(16)])}'

    histories[ident] = history

    print(ident)

    return ident









