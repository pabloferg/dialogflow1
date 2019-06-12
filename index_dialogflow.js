// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

const axios = require('axios');


process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }



function GetRandomIntro() {
  const intros = [
    'Sure, let me check',
    'Checking',
    'Let me see',
    'Mmmh give me one sec',
    'Nice place! Let me check'];
   agent.add(intros[Math.floor(Math.random() * intros.length)]);
}

function GetRandomSpeech(destination, fare, airline) {
  const speeches = [
    'You can fly to ' + destination + ' for just ' + fare + ' pounds with ' + airline,
    'Enjoy ' + destination + ' for just ' + fare + ' pounds with ' + airline,
    fare + ' pounds with ' + airline,
    ];
   agent.add(speeches[Math.floor(Math.random() * speeches.length)]);
}





 function GetFlightInfoHandler(agent) {
   const destination = agent.parameters['geo-city'];

   GetRandomIntro();

   return callApi("https://digital-flights.herokuapp.com/destination/" + destination.toLowerCase()).then(response => {
    let fare = response.data.fare;
    let airline = response.data.airline;

    GetRandomSpeech(destination, fare.split(".")[0] , airline);


  }).catch (error => {
    // do something
  });
 }

function callApi(url) {
  return axios.get(url);
}








  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('GetFlightInfo', GetFlightInfoHandler);
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
