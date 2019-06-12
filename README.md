# dialogflow1

This example gets an intent from a user asking for a fare for a parcicular destination, then the agent will reply back with a fare.

First we need to create an agent on Dialogflow - just follow these steps.

Once we have the 


![Screenshot](diagram.png)

How to 

https://medium.com/@naz_islam/how-to-authenticate-google-cloud-services-on-heroku-for-node-js-app-dda9f4eda798

Once the app is deployed successfully, we need to set up GOOGLE_APPLICATION_CREDENTIALS environment variable and point it to the path of the service account key. In our case it is ‘config/keyFile.json’.

```
$ heroku config:set GOOGLE_APPLICATION_CREDENTIALS=‘config/keyFile.json’
```


# Python-Flask Application #

First we import the main libraries:

```python
from flask import Flask, jsonify, request
import pandas as pd
import requests
import time
from google.cloud import bigquery
```

The table is stored in BigQuery. Check the [Quickstart Guide](https://cloud.google.com/bigquery/docs/quickstarts/quickstart-client-libraries#client-libraries-install-python) to learn how to access using Python. 

```python
# Initialize a BigQuery Client
client = bigquery.Client()
```

We create a simple Flask application with just:
- (1) a main route ("/") with response "Hello World",
- (2) /destination/ 


```python
# Flask application
application = Flask(__name__)

@application.route("/", methods=['GET', 'POST'])
def index():
    if (request.method == 'POST'):
        some_json = request.get_json()
        return jsonify({'you sent' : some_json}), 201
    else:
        return jsonify({"about" : "Hello World"})   # we are only GETting info from the API so far

# <destination> is the parameter used in Dialogflow to call the url, i.e. digital-flights.herokuapp.com/destination/madrid
@application.route('/destination/<destination>', methods=['GET'])
def get_destination(destination):
    """ 1. Get Airport Code and Airport Name using lookup table in BigQuery
        2. Using Airport Code, call Amadeus API to retrieve fares
    """
    # converts cityName (i.e 'Valencia') to airport Code and Name (i.e 'VLC', 'Valencia Airport')
    airport_code, airport_name = cityName_to_airport(cityName = destination) # If not match, variables = empty

    # this is just a joke
    if destination.lower() not in ['hogwarts', 'mordor']:

        # if destination not in BigQuery Table
        if airport_code == "":
            json_output = jsonify({"error" : "Sorry. We don't fly to %s" % (destination)})
        else:
            # if airport code detected, call Amadeus API
            json = get_request_fares(access_token = post_request_fares(), airport_code=airport_code)
            # try, if except (route from Heathrow does not exist) return full error message in json response
            try:
                # Call Amadeus API
                fare = extract_fare_from_json(json)[0]
                airline = extract_fare_from_json(json)[1]

                json_output = jsonify({"fare" : fare,
                                "airline" : airline,
                                "airportCode" : airport_code,
                                "airportName" : airport_name})
            except:
                json_output = jsonify(json)

    else:
        json_output = jsonify({"fare" : '300',
                        "airline" : 'BroomAir',
                        "airportCode" : airport_code,
                        "airportName" : airport_name})

    return json_output
 ```
 
 Amadeus [Flight Low Fare API](https://developers.amadeus.com/self-service/category/air/api-doc/flight-low-fare-search/api-reference)
 
 You will need `client_id` and `client_secret` from Amadues.
 
 ```python
 #### AMADEUS API ####
def post_request_fares():
    url = "https://test.api.amadeus.com/v1/security/oauth2/token"
    payload = "grant_type=client_credentials&client_id=XXXXX&client_secret=XXXXX&undefined="
    headers = {
        'Content-Type': "application/x-www-form-urlencoded",
        'cache-control': "no-cache",
        'Postman-Token': "52a00ceb-c42c-46bc-a9b7-3afb5f693441"
        }

    response = requests.request("POST", url, data=payload, headers=headers)

    return response.json()['access_token']

def get_request_fares(access_token, airport_code):

    url = "https://test.api.amadeus.com/v1/shopping/flight-offers"

    querystring = {"origin":"LHR",
                   "destination": airport_code,
                   "departureDate":"2019-07-01",
                   "adults":"1",
                   "includeAirlines":"BA",
                   "nonStop":"false",
                   "max":"1"}

    payload = ""
    headers = {
        'Authorization': "Bearer " + access_token,
        'cache-control': "no-cache",
        }

    response = requests.request("GET", url, data=payload, headers=headers, params=querystring)

    return response.json()
 
 
 
```
