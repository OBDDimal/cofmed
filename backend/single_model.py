from os import path

from pysat.formula import CNF
from pysat.solvers import Solver

import re

from copy import copy

import preprocessing

MODELS = dict()


def get_model_by_ident(ident):
    return MODELS.get(ident)


def get_variable_mapping(formula):

    ids2names = dict()
    names2ids = dict()
    p = re.compile(r"c\s+(?P<id>\d+)\s+(?P<name>.+)")

    for comment in formula.comments:
        comment = comment.strip()
        if m := p.match(comment):
            ids2names[int(m["id"])] = m["name"]
            names2ids[m["name"]] = int(m["id"])
        else:
            raise ValueError(f"malformed comment: \"{comment}\"")

    return ids2names, names2ids


class Model():

    def __init__(self, persname):
        self.ident = path.basename(persname)

        cnf = CNF(from_file = persname)
        cnf, cores, deads = preprocessing.simplify_yield_unit_clauses(cnf)
        self.formula = cnf

        self.cores = cores
        self.deads = deads

        self.solver = Solver(bootstrap_with = self.formula)

        m, b = get_variable_mapping(self.formula)

        self.ids2names = m
        self.names2ids = b

        MODELS[self.ident] = self


    def convert_ids2names(self, ls):

        if len(ls) == 0:
            return ls

        if type(ls[0]) == list:
            return [self.convert_ids2names(l) for l in ls]
        elif type(ls[0]) == int:
            return [self.ids2names[abs(i)] for i in ls]
        else:
            raise ValueError(f"expected [int] or [[int]] but {ls}")


    def convert_names2ids(self, ls):

        if len(ls) == 0:
            return ls

        if type(ls[0]) == list:
            return [self.convert_names2ids(l) for l in ls]
        elif type(ls[0]) == str:

            xs = []

            for feat in ls:
                if feat.startswith("!"):
                    x = -self.names2ids[feat.lstrip("!")]
                else:
                    x = self.names2ids[feat]

                xs.append(x)

            return xs
        else:
            raise ValueError(f"expected [str] or [[str]] but {ls}")


    def dp(self, config_list):

        config = set(config_list)
        config = config.union(self.cores).union({-x for x in self.deads})

        clauses = copy(self.formula.clauses)

        stack = list(config)
        decided = copy(config)

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
                        return False, None, None, None, None

                    elif len(clause) == 1:
                        var = clause[0]

                        if var not in decided:
                            decided.add(var)
                            stack.append(var)

                        clauses[i] = None
                    else:
                        clauses[i] = clause


        if len(decided) != len({abs(x) for x in decided}):
            return False, None, None, None, None

        decided_new = decided.difference(config_list)
        simp = {x for x in decided_new if x > 0}
        dimp = {abs(x) for x in decided_new if x < 0}

        config.update(decided)
        free = set(range(1, self.formula.nv + 1)).difference({abs(x) for x in config})

        return True, sorted(config, key = abs), sorted(simp), sorted(dimp), sorted(free)
    


# def ids2names(self, ls):

#     mapping = self.mapping

#     if len(ls) == 0:
#         return ls

#     if type(ls[0]) == list:
#         return [ids2names(l) for l in ls]
#     elif type(ls[0]) == int:
#         return [mapping[abs(i)] for i in ls]
#     else:
#         raise ValueError(f"expected [int] or [[int]] but {ls}")


# def names2ids(self, ls):

#     mapping = self.backmap

#     if len(ls) == 0:
#         return ls

#     if type(ls[0]) == list:
#         return [names2ids(l) for l in ls]
#     elif type(ls[0]) == str:

#         xs = []

#         for feat in ls:
#             if feat.startswith("!"):
#                 x = -mapping[feat[1:]]
#             else:
#                 x = mapping[feat]

#             xs.append(x)

#         return xs
#     else:
#         raise ValueError(f"expected [str] or [[str]] but {ls}")