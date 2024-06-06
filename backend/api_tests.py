import pytest

from pysat.formula import CNF
from pysat.solvers import Solver

from app import app

from os import path

import glob

@pytest.fixture
def client():
    app.config.update({'TESTING': True})

    with app.test_client() as client:
        yield client


def test_hello(client):

    response = client.get('/')
    assert b"Flask Analysis Backend Running" in response.data
    assert response.status_code == 200


def register_formula(client, filename):
    return client.post("/register_formula", data={
        "file": open(filename, "rb"),
    })


def register_history(client):

    files = glob.glob("testdata/*fiasco*.dimacs")
    files = [open(filename, "rb") for filename in files]

    response = client.post("/register_history/fiasco", data={
        "files": files,
    })

    for file in files:
        file.close()

    assert response.status_code == 200

    return response


def test_register(client):
    response = register_formula(client, "testdata/sandwich.dimacs")

    assert response.status_code == 200
    assert response.data


def test_register_broken(client):
    response = register_formula(client, "testdata/sandwich_broken.dimacs")

    assert response.status_code == 417
    assert response.data == b"Invalid CNF"


def test_formula(client):

    response = register_formula(client, "testdata/sandwich.dimacs")

    ident = response.data.decode("utf-8")
    assert ident

    response = client.get(f"/formula/{ident}")

    assert b"c 1 Flatbread" in response.data
    assert b"p cnf 19 27" in response.data


def get_verify_ident(client):
    response = register_formula(client, "testdata/sandwich.dimacs")

    ident = response.data.decode("utf-8")
    assert ident

    # invalid ident
    response = client.post(f"/formula/NICETRY/verify/raw")
    assert response.status_code == 404

    return ident


def test_verify(client):

    cnf = CNF(from_file = "testdata/sandwich.dimacs")
    ident = get_verify_ident(client)

    with Solver(bootstrap_with = cnf) as solver:
        
        # simple + raw
        response = client.post(f"/formula/{ident}/verify/raw")
        assert response.status_code == 200

        data = response.json
        config = data["solution"]

        assert len(config) == cnf.nv
        assert solver.solve(assumptions = config)

        # simple
        response = client.post(f"/formula/{ident}/verify")
        assert response.status_code == 200

        data = response.json
        config = data["solution"]
        assert len(config) == cnf.nv

        # arg
        response = client.post(f"/formula/{ident}/verify", json = dict(config = config))
        assert response.status_code == 200

        # invalid format
        response = client.post(f"/formula/{ident}/verify", json = dict(config = [-10]))
        assert response.status_code == 417

        # invalid + raw
        response = client.post(f"/formula/{ident}/verify/raw", json = dict(config = [-10]))

        data = response.json

        assert response.status_code == 200
        assert data["valid"] is False


def test_dp(client):

    ident = get_verify_ident(client)

    # core + dead
    response = client.post(f"/formula/{ident}/dp/raw")
    assert response.status_code == 200

    data = response.json
    config = data["config"]

    assert len(config) == 2
    assert 8 in config
    assert 10 in config
    
    simp = data["implicit_selected"]
    dimp = data["implicit_deselected"]

    assert config == simp
    assert len(dimp) == 0

    # dp
    response = client.post(f"/formula/{ident}/dp/raw", json = dict(config = [7]))
    assert response.status_code == 200

    data = response.json
    config = data["config"]
    simp = data["implicit_selected"]
    dimp = data["implicit_deselected"]

    assert config == [-1, 7, 8, 10, -12]
    assert simp == [8, 10]
    assert dimp == [1, 12]

    # invalid
    response = client.post(f"/formula/{ident}/dp/raw", json = dict(config = [-8]))
    assert response.status_code == 200

    data = response.json
    valid = data["valid"]

    assert valid is False


def get_verify_ident_history(client):
    response = register_history(client)

    ident = response.data.decode("utf-8")
    assert ident

    # invalid ident
    response = client.post(f"/history/NICETRY")
    assert response.status_code == 404

    return ident


def test_history(client):

    ident = get_verify_ident_history(client)
    print(ident)

    response = client.post(f"/history/{ident}")
    data = response.json

    assert response.status_code == 200
    assert "CONFIG_SPARC" in data["variables"]
    assert len(data["versions"]) == 18