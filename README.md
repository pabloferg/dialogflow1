# dialogflow1
First Dialogflow Project


How to 

https://medium.com/@naz_islam/how-to-authenticate-google-cloud-services-on-heroku-for-node-js-app-dda9f4eda798

Once the app is deployed successfully, we need to set up GOOGLE_APPLICATION_CREDENTIALS environment variable and point it to the path of the service account key. In our case it is ‘config/keyFile.json’.

$ heroku config:set GOOGLE_APPLICATION_CREDENTIALS=‘config/keyFile.json’
