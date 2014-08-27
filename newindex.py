#!/usr/bin/env python

from bottle import post, request, route, template, HTTPError, run, response
import subprocess
import hashlib
import pymongo
import uuid
import json
import os
from bson.code import Code


@post('/api/v1.0/login/')
@post('/api/login/')
def login():
    user = request.json['user']
    password = request.json['password']
    conn = pymongo.MongoClient()
    db = conn['techdb']
    rec = db.login.find_one()
    salt = rec['salt']
    password_hash = hashlib.sha256(password+salt).hexdigest()
    if user==rec["user"] and password_hash==rec["hashed_salted_pass"]:
        token = str(uuid.uuid4())
        db.tokens.save({"token":token})
        conn.close()
        return token
    else:
        raise HTTPError(403)


#{"token":"f261a163-0cd1-4f84-9121-d1f01ac65391"}
#{"user":"admin","password":"s1234"}

@post('/api/v1.0/customers/<sort_by>/<order>/')
@post('/api/v1.0/customers/<group_by>/')
@post('/api/v1.0/customers/<sort_by>/<order>/<from_:int>/<to:int>/')
@post('/api/customers/<sort_by>/<order>/')
@post('/api/customers/<group_by>/')
@post('/api/customers/<sort_by>/<order>/<from_:int>/<to:int>/')
def index(sort_by,order,group_by='',from_=0,to=0):
    token = request.json['token']
    conn = pymongo.MongoClient()
    db = conn['techdb']
    if db.tokens.find_one({"token":token}):
        valid_sort_by_field = set(['Gender','Age', 'Name', 'Points'])
        valid_order_field = set(['A','D'])
        if sort_by not in valid_sort_by_field or order not in valid_order_field:
            raise HTTPError(500)
        else:
            order_d = {'A':1, 'D':-1}
            all_results = []
            if group_by:
                reducer = Code("""
                            function(obj, prev){
                            prev.count++;}
                            """)
                for x in db.customers.group([group_by], None, initial={"count": 0}, reduce=reducer):
                    all_results.append(x)
            else:
                for x in db.customers.find().sort(sort_by,order_d[order]):
                    x.pop('_id')
                    all_results.append(x)
            response.content_type = 'application/json'
            conn.close()
            return json.dumps(all_results)
    else:
        raise HTTPError(403)

@route("/api/v1.0/status/")
@route("/api/status/")
def status():
    status = {}
    status['webserver'] = 'DOWN'
    try:
        conn = pymongo.MongoClient()
        status['DB'] = 'UP'
        conn.close()
    except Exception, e:
        status['DB'] = e.message
    status['uptime'] = subprocess.check_output(["uptime"])[:-1]
    process = subprocess.Popen(['ps', '-eo' ,'pid,args'], 
                               stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, notused = process.communicate()
    for line in stdout.splitlines():
        if "apache2" in line:
            status['webserver'] = "UP"
            break
    return status

@route('/api/v1.0/dir')
@route('/api/dir')
def retrieve_dir():
    path = request.query['path']
    return dict(files=os.listdir(path))


run(host='localhost', port=8080)