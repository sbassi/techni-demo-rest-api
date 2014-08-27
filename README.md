techni-demo-rest-api
====================

API REST webserver in node.js with unit tests in Python

DB Setup
--------

You need to setup a MongoDB database called *techdb* with the default login information. Note that is a salted password and the salt is present on user document. MongoDB commands:

  use techdb
  
  a = {user:"admin", hashed_salted_pass:"9ed2e5ee854f75e802b5008e67756f88a84df7642ed7ed2ed2e5639749564ab1", salt:"5639f8c0-01ea-4c53-85a2-dff4e80717c1"}
  
  db.login.insert(a)

You should have a *customers* collection. As a starter there is one included under db/curstomers.bkp.json

Install NodeJS program
----------------------

Clone github project::

clone https://github.com/sbassi/techni-demo-rest-api.git

Install dependencies:

npm install

Run the program:

node main.js

Running tests
-------------

Install tests dependencies:

pip install -r requirements.txt

Setting local environment:

edit testsettings.py

Run tests:

./tests.py
