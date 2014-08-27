techni-demo-rest-api
====================

API REST webserver in node.js with unit tests in Python

DB Setup
--------

You need to setup a MongoDB database with the default login information. MongoDB commands:
  use techdb
  a = {user:"admin", password:"66816a83299af511fec85257bd6d029c0d0abc673a7a71c7972791b06ee7a4ed"}
  db.login.insert(a)

Install NodeJS program
----------------------

Clone github project::

clone https://github.com/sbassi/techni-demo-rest-api.git

Install dependencies::

npm install

Run the program::

node main.js

Running tests
-------------

Install tests dependencies::

pip install -r requirements.txt

Setting local environment::

edit testsettings.py

Run tests::

./tests.py
