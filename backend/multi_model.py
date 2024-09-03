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
        self.versions_disabled = set()

        cores = set.intersection(*self.history.it2cores.values())
        deads = set.intersection(*self.history.it2deads.values())

        self.config.update(cores)
        self.config.update({-x for x in deads})
        self.features_free = self.features_free.difference(cores).difference(deads)


    def configure(self, config = None, versions = None):
        if versions is not None:
            ok = self.verify_set_versions(versions)

            if not ok:
                return False

            self.version_dp()
            ok = self.feature_dp()

            if not ok:
                return False

            return self.version_dp()


        if config is not None:
            ok = self.verify_config(config)

            if not ok:
                return False

            self.config.update(config)
            self.features_free = self.features_free.difference({abs(x) for x in config})

            self.version_dp()
            ok = self.feature_dp()
            
            if not ok:
                return False
                
            return self.version_dp()

        return True


    def verify_set_versions(self, versions):

        clauses = []

        for version in versions:
            cnf = self.get_cnf(version)

            clauses.extend(cnf.clauses)

        with Solver(bootstrap_with = clauses) as solver:
            if not solver.solve():
                return False

        self.versions.update(versions)
        self.versions_available = self.versions_available.difference(self.versions)

        cnf = CNF(from_clauses = clauses)
        # cnf, cores, deads = preprocessing.simplify_yield_unit_clauses(cnf2)

        self.formula = cnf

        # config = cores.union({-x for x in deads})
        # ok = self.verify_config(config)

        # if not ok:
        #     print("INVALID")
        #     return False

        # self.config.update(config)
        return True


    def verify_config(self, config):

        # test if config is feasible
        if len(config) > len({abs(x) for x in config}):
            return False

        for lit in config:
            if -lit in self.config:
                print("HI")
                return False

        # # test if compatible
        # if len(self.features_free.union({abs(x) for x in self.config}).difference({abs(x) for x in config})) > 0:
        #     print("HERE")
        #     return False

        return True


    def version_dp(self):

        for version in self.versions_available:
            clauses = []
            clauses.extend(self.formula.clauses)

            cnf = self.get_cnf(version)
            clauses.extend(cnf.clauses)

            with Solver(bootstrap_with = clauses) as solver:
                if not solver.solve(self.config):
                    self.versions_disabled.add(version)

        self.versions_available = self.versions_available.difference(self.versions).difference(self.versions_disabled)


    def feature_dp(self):
        
        decisions = set()

        with Solver(bootstrap_with = self.formula.clauses) as solver:
            for feature in self.features_free:

                if feature == 43:
                    print("vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv")

                if not solver.solve(self.config.union([-feature])):
                    decisions.add(feature)
                
                if not solver.solve(self.config.union([feature])):
                    decisions.add(-feature)


                if feature == 43:
                    print(decisions)
                    print("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")


        if len(decisions) != len({abs(x) for x in decisions}):
            return False

        self.config.update(decisions)
        self.features_free = self.features_free.difference({abs(x) for x in decisions})

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


    def __str__(self):
        return f'MC<{self.history.name}>: {self.config} {self.versions}'


    def answer(self):
        return dict(valid = True, config = sorted(self.config, key = abs), features_free = sorted(self.features_free), versions = sorted(self.versions), versions_disabled = sorted(self.versions_disabled))


class History():

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
        return dict(variables = sorted(self.name2var.keys()), versions = self.versions(), mapping = self.name2var)


    def versions(self):
        return sorted(self.it2unified.keys())


    def get_cnf(self, version_key):
        return self.it2unified[version_key]


    def add(self, files):

        files_set = set(self.files)
        files_set.update(files)

        # print(self.files)

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
            cnf2, cores, deads = preprocessing.simplify_yield_unit_clauses(cnf2)

            self.it2unified[file] = cnf2

            # print(cores)
            # print(deads)
            self.it2cores[file] = cores
            self.it2deads[file] = deads


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
