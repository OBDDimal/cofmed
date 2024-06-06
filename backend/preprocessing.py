from pysat.solvers import Solver
from pysat.formula import CNF

import math
import itertools


def compute_core_deads(cnf):

    found = set()

    cores = set()
    deads = set()

    with Solver(bootstrap_with = cnf.clauses) as solver:
        for x in range(1, cnf.nv + 1):

            x_found = x in found
            nx_found = -x in found

            if x_found and nx_found:
                continue

            if not x_found:
                if solver.solve(assumptions = [x]):
                    for y in solver.get_model():
                        found.add(y)
                else:
                    solver.add_clause([-x])
                    deads.add(x)

            if not nx_found:
                if solver.solve(assumptions = [-x]):
                    for y in solver.get_model():
                        found.add(y)
                else:
                    solver.add_clause([x])
                    cores.add(x)

    return cores, deads


def simplify_unit_clauses(cnf):
    cnf, _, _ = simplify_yield_unit_clauses(cnf)

    return cnf


def simplify_yield_unit_clauses(cnf):

    truths, falses = compute_core_deads(cnf)

    if truths is None and falses is None:
        return

    truths = truths if truths else set()
    falses = falses if falses else set()

    clauses = []

    for x in truths:
        clauses.append([x])

    for x in falses:
        clauses.append([-x])

    cache = set()
    
    clauses_good = []
    for clause in clauses:
        if (s := str(clause)) not in cache:
            clauses_good.append(clause)
            cache.add(s)

    clauses = clauses_good
    
    for clause in cnf.clauses:

        satisfied = False
        nclause = []

        for x in clause:
            if x > 0 and x in truths:
                # x and (x or ...)
                satisfied = True
                break
            elif x > 0 and x in falses:
                continue
            elif x < 0 and abs(x) in truths:
                continue
            elif x < 0 and abs(x) in falses:
                satisfied = True
                break

            nclause.append(x)

        nclause = sorted(nclause, key = abs)

        for i in range(len(nclause) - 1):
            if nclause[i] == -nclause[i + 1]:
                satisfied = True
                break

        if not satisfied and nclause:
            if (s := str(nclause)) not in cache:
                clauses.append(nclause)
                cache.add(s)

    cnf2 = CNF(from_clauses = clauses)
    cnf2.nv = cnf.nv
    cnf2.comments = cnf.comments
    
    return cnf2, truths, falses


def identify_xor_groups(cnf, min_size = 2):
    var2pairs = dict()

    clauses = [sorted(clause, key = abs) for clause in cnf.clauses]

    clauses2 = [clause for clause in clauses if len(clause) == 2]

    for clause in clauses2:
        x, y = sorted(clause, key = abs)

        if x in var2pairs:
            var2pairs[x].add(y)
        else:
            var2pairs[x] = set([y])          

    xor = 0
    xor_groups = []
    xor_clauses = set()

    for clause in sorted(clauses, key = len):
        cands = sorted([x for x in clause if x > 0])

        if len(cands) < min_size:
            continue

        pairs = set()
        for (x, y) in itertools.combinations(cands, 2):
            if -x in var2pairs:
                if -y in var2pairs[-x]:
                    pairs.add(str([-x, -y]))


        if len(pairs) == math.comb(len(cands), 2):
            xor += 1
            xor_clauses.update(pairs)
            xor_groups.append(set([abs(x) for x in cands]))

    clauses_rem = []

    for clause in clauses:
        if str(clause) in xor_clauses:
            continue

        clauses_rem.append(clause)

    xor_groups_raw = sorted(xor_groups, key = len, reverse = True)
    xor_groups = sorted(xor_groups, key = len, reverse = True)
    var2xor = dict()

    for i, group in enumerate(xor_groups):
        for x in group:
            if x in var2xor:
                xor_groups[var2xor[x]].update(group)

                for y in group:
                    var2xor[y] = var2xor[x]

                xor_groups[i] = None
                break
            else:
                var2xor[x] = i

    xor_groups = [g for g in xor_groups if g]
    xor_variables = set(var2xor)

    return xor_variables, xor_groups, xor_groups_raw, clauses_rem


def identify_or_groups(cnf, xor_groups):

    pass
