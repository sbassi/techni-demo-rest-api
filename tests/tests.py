#!/usr/bin/env python

import unittest
import urllib2
import json
import ast
import pdb

import pymongo
import testsettings as settings


class ApiTests(unittest.TestCase):

    def setUp(self):
        # TO DO:
        # Load data for the test so testing is performed with fake data
        pass

    def test_login(self):
        values = {'user' : settings.USER, 'password' : settings.PASSWORD}
        req = urllib2.Request("%s/api/login/"%settings.BASEURL, 
                              json.dumps(values), 
                              {'Content-Type': 'application/json'})
        token = urllib2.urlopen(req).read()
        # Check if the response looks like a token
        self.assertEqual(len(token),36)
        conn = pymongo.MongoClient()
        db = conn['techdb']
        stored_token = db.tokens.find_one({"token":token})['token']
        # Check if the token is actually stored in the DB
        self.assertEqual(token,stored_token)

    def test_status(self):
    	req = urllib2.Request("%s/api/status/"%settings.BASEURL)
        status_result = urllib2.urlopen(req).read()
        result_dict = ast.literal_eval(status_result)
        # Check if response has the expected keys
        self.assertItemsEqual(result_dict.keys(), ['webserver', 'uptime', 'DB'])

    def test_dir(self):
        req = urllib2.Request('%s/api/dir?path=%s'%(settings.BASEURL, settings.DIR))
        status_result = urllib2.urlopen(req).read()
        result_dict = ast.literal_eval(status_result)
        # Check format of response
        self.assertItemsEqual(result_dict.keys(), ['files'])
        # Check if amount of directory files are the expected
        self.assertEqual(len(result_dict['files']),settings.LENDIR)


    def test_index(self):
        # Test sort and order
        # This is a placeholder :)
        return


if __name__ == '__main__':
    unittest.main()