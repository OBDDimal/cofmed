from pysat.formula import CNF
from pysat.solvers import Solver
import re

import preprocessing
import statistics

from copy import copy

import hashlib

from os import path


def hash_file(filepath):    
    with open(filepath, "rb") as f:
        hash_is = hashlib.md5()
        while chunk := f.read(8192):
            hash_is.update(chunk)

    return hash_is.hexdigest()

class MultiConfiguration():
    
    def __init__(self, history):
        self.history = history
        self.id2versions = {i: v for i, v in enumerate(history.versions())}

        self.formula = None

        self.config = set()
        self.features_free = set(history.name2var.values())
        self.versions = set()
        self.versions_available = set(self.id2versions.keys())


    def select_version(self, version):        
        if version in self.versions_available:
            self.versions.add(version)
            self.version_dp(version)
        else:
            print(f"Version {version} cannot be selected")
            return False


    def configure_features(self, feature):
        if abs(feature) in self.features_free:
            self.config.add(feature)
            self.version_dp()
            self.feature_dp(feature)
        else:
            print(f"Feature {feature} cannot be selected")
            return False


    def version_dp(self, version = None):

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

        # Deselect dead configurations
        for version in self.versions_available:

            cnf = self.get_cnf(version)

            clauses = []
            clauses.extend(bootstrap_clauses)
            clauses.extend(cnf.clauses)

            with Solver(bootstrap_with = clauses) as solver:
                if not solver.solve(assumptions = self.config):
                    self.versions.add(-version)

        self.versions_available = self.versions_available.difference({abs(x) for x in self.versions})

        # Enforce cores and deads
        cnf_temp = CNF(from_clauses = bootstrap_clauses)
        self.formula, cores, deads = preprocessing.simplify_yield_unit_clauses(cnf_temp)

        self.config.update(cores)
        self.config.update({-x for x in deads})
        self.features_free = self.features_free.difference({abs(x) for x in self.config})


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
                    clause = [x for x in clause if x != - dec]

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

        print("Decided", decided)
        self.features_free = self.features_free.difference({abs(x) for x in decided})

        clauses = [clause for clause in clauses if clause]

        self.formula = preprocessing.simplify_unit_clauses(CNF(from_clauses = clauses))

        return True


    def finalize(self):
        self.versions.update(self.versions_available)
        self.versions_available = set()

        for version in self.versions:
            cnf = self.get_cnf(abs(version))

            with Solver(bootstrap_with = cnf.clauses) as solver:
                satisfiable = solver.solve(assumptions = self.config)

                if (satisfiable and version < 0) or (not satisfiable and version > 0):
                    print("Should not happen")

        return self.versions, self.config


    def auto_complete(self):
        with Solver(bootstrap_with = self.formula.clauses) as solver:
            solver.solve(assumptions = self.config)

            self.config = set(solver.get_model())
            self.features_free = set()
            self.version_dp()


    def get_cnf(self, version):
        return self.history.get_cnf(self.id2versions[version])

    def configure_feature(self, feature):
        print(feature)

    def __str__(self):
        return f'MC<{self.history.name}>: {self.config} {self.versions}'


class History():

    def __init__(self, name, *files, **kwargs):

        self.name = name

        self.hashes = set()
        self.name2var = dict()

        self.files = []
        self.it2original = dict()
        self.it2unified = dict()

        self.add(files)


    def info(self):
        return dict(variables = sorted(self.name2var.keys()), versions = self.versions())


    def versions(self):
        return sorted(self.it2unified.keys())


    def get_cnf(self, version_key):
        return self.it2unified[version_key]


    def add(self, files):

        files_set = set(self.files)
        files_set.update(files)
        self.files = list(files_set)

        new_variable = False

        for file in files:

            hsh = hash_file(file)

            if hsh in self.hashes:
                continue

            cnf = CNF(from_file = file)

            if len(cnf.clauses) < 5:
                continue

            self.hashes.add(hsh)

            self.it2original[path.basename(file)] = cnf
            
            if self.collect(cnf):
                new_variable = True

        for file, cnf in self.it2original.items():

            if file in self.it2unified and not new_variable:
                continue

            cnf2 = preprocessing.simplify_unit_clauses(cnf)
            cnf2 = self.unify(cnf2)
            cnf2 = preprocessing.simplify_unit_clauses(cnf2)

            self.it2unified[file] = cnf2


    def collect(self, cnf):

        new_variable = False

        for line in cnf.comments:
            m = re.match(r"^c\s+(?P<var>\d+)\s+(?P<name>.+)$", line)
            var, name = m.groups()

            if name not in self.name2var:
                new_variable = True
                self.name2var[name] = len(self.name2var) + 1

        return new_variable


    def get_old2new(self, cnf):
        old2new = dict()

        for line in cnf.comments:
            m = re.match(r"^c\s+(?P<var>\d+)\s+(?P<name>.+)$", line)
            var, name = m.groups()

            old2new[int(var)] = self.name2var[name]

        return old2new


    def unify(self, cnf):

        old2new = self.get_old2new(cnf)

        clauses = []
        for clause in cnf.clauses:
            clause = [(1 if x > 0 else -1) * old2new[abs(x)] for x in clause]

            clauses.append(clause)
        
        for var in self.name2var.values():
            if var in old2new.values():
                continue        

            clauses.append([-var])

        clauses = [sorted(clause, key = abs) for clause in clauses]
        clauses = sorted(clauses, key = len)

        comments = [(var, f"c {var} {name}") for name, var in self.name2var.items()]
        comments = sorted(comments, key = lambda x: x[0])
        comments = [x for _, x in comments]

        cnf2 = CNF(from_clauses = clauses)
        cnf2.nv = len(self.name2var)
        cnf2.comments = comments

        return cnf2

    def configure(self):
        return MultiConfiguration(self)
