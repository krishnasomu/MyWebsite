const functions = require('firebase-functions');
const structjson = require('./structjson.js');
const express = require('express');
const app = express();
const cors = require('cors')({origin: true});
app.use(cors);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
var config = {
  apiKey: "AIzaSyAUGgozJYcjWp-SX4QTRKnqSpiULHxZie8",
  authDomain: "somu-website.firebaseapp.com",
  databaseURL: "https://somu-website.firebaseio.com",
  projectId: "somu-website",
  storageBucket: "somu-website.appspot.com",
  messagingSenderId: "176778291160"
};
admin.initializeApp(config);

/////// HTTPS FUNCTIONS ///////

exports.sendMsgToBot = functions.https.onCall((data, context) => {
  var projectId = data.projectId;
  var sessionId = data.sessionId;
  var queries = data.queries;
  var languageCode = data.languageCode;

  console.log("projectId:" + projectId + "; sessionId:" + sessionId + "; queries:" + queries + "; languageCode:" + languageCode);

  return new Promise((resolve, reject) => {
    try{
      /*
      test()
      .then(result => {
        return result;
      })
      .catch(err =>{
        reject(err);
      })
      ;
      */
      
      var detectTextIntentReturn;
      //var detectTextIntentReturn = detectTextIntent(projectId, sessionId, queries, languageCode);
      detectTextIntent(projectId, sessionId, queries, languageCode)
        .then(result => {
            console.log("result:" + result);
            detectTextIntentReturn = result;
            console.log("returning result @ 1");
            console.log("result:" + result);
            resolve(result);
            return result;
          }
         )
        .catch(err => {
          console.log("error1:" + err);
          reject(err)
        });
        //resolve(detectTextIntentReturn);
        
    }catch(err){
      console.log("error2:" + err);
      reject(err);
    }
  });
});

exports.myapp = functions.https.onRequest(app);

app.get('/dk',(req, res) => {
  res.status(200).send(`<!doctype html>
    <head>
      <title>dk</title>
      <link rel="stylesheet" href="dk/style.css">
    </head>
      <body>
      <div id="wrapper">
      <div id="body">
        <div id="divchat" class="chat-window"></div>
        <div id="divtextbox">
          <textarea id="msg" rows="3" cols="52" autofocus placeholder="type here..."
            onkeypress="Javascript:doit_onkeypress(event)" onkeyup="Javascript:doit_onkeyup(event)"
            onkeydown="Javascript:doit_onkeydown(event)" style="border:solid 1px black;">
          </textarea>
          <br>
          <input id="mediaCapture" type="file" accept="image/*;capture=camera" style="display: none" onchange="storeImageIntoStorage(this.files)">&nbsp;</input>
          <div id="divmedia">
            <label id="labelInput" for="mediaCapture" class="btn btn-primary btn-block btn-outlined" onclick="mediaCaptureClicked(event)">[o]</label>
          </div>
          <div id="divrectangle"><span id="span-away-since" class="away-since"></span> </div>
          <div id="divvc">
              <label id="labelVC" class="btn btn-primary btn-block btn-outlined" onclick="vcClicked(event)">[oo]</label>
          </div>
        </div>
      </div>
    </div>
  </body>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.0.0/jquery.js"></script>
  <script src="https://www.gstatic.com/firebasejs/3.4.0/firebase.js"></script>
  <script src="dk/script.js"></script>
</html>`);
});

app.get('/test',(req, res) => {
  res.status(200).send(`<!doctype html>
    <head>
      <title>test</title>
    </head>
    <body>
      <button onclick="myFunction()">Click me</button>
    </body>
    <script src="https://www.gstatic.com/firebasejs/3.4.0/firebase.js"></script>
    <script src="https://www.gstatic.com/firebasejs/6.0.2/firebase-functions.js"></script>
    <script src="dk/script.js"></script>
    <script>
        // Initialize Firebase (SPTZ)
        var dbConfigSPTZ = {
          apiKey: "AIzaSyAUGgozJYcjWp-SX4QTRKnqSpiULHxZie8",
          authDomain: "somu-website.firebaseapp.com",
          databaseURL: "https://somu-website.firebaseio.com",
          projectId: "somu-website",
          storageBucket: "somu-website.appspot.com",
          messagingSenderId: "176778291160",
          appId: "1:176778291160:web:2c7d5032e6a9cc7d"
        };
      function myFunction(){
        try{
          alert(1)
          var funTest = firebase.functions().httpsCallable('funTest');
          alert(2)
          funTest({"name": "abcd"}).then(function(result) {
            alert(3)
            // Read result of the Cloud Function.
            alert(result.data.resptext);
            // ...
          }).catch(function(error){
            alert(error.details)
          });
          alert(4)
        }catch(err){
          alert(err)
        }
      }
    </script>
  </html>`);
});

/////// FUNCTIONS //////

exports.funTest = functions.https.onCall((data, context) => {
  console.log("im here");
  return {resptext: "hi " + data.name}
});

function test(){
  var a = 1;
  return new Promise((resolve,reject) => {
    if(a==='1'){
      resolve("resolved");
    }else{
      reject(new error("rejected"));
    }
  });
}

function detectTextIntent(projectId, sessionId, query, languageCode) {
  // [START dialogflow_detect_intent_text]
  // Imports the Dialogflow library
  try{
    const dialogflow = require('dialogflow');
    console.log("dialogflow object created");

    const serviceAccount = require('./serviceaccount.json'); 
    let serviceAccountconfig = {
        credentials: {
            private_key: serviceAccount.private_key,
            client_email: serviceAccount.client_email
    
        }
    }
    // Instantiates a session client
    const sessionClient = new dialogflow.SessionsClient(serviceAccountconfig);
    console.log("sessionClient object created with JSON");
  
    if (!query || !query.length) {
      return;
    }
  
    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    console.log("sessionPath object created: " + sessionPath);
  
    let promise;
  
    // Detects the intent of the queries.
    //for (const query of queries) {
      // The text query request.
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: query,
            languageCode: languageCode,
          },
        },
      };
  
      if (!promise) {
        // First query.
        console.log(`Sending query (!promise) "${query}"`);
        return new Promise((resolve, reject) => {
          sessionClient.detectIntent(request)
          .then(responses => {
            console.log('Detected intent');
            logQueryResult(sessionClient, responses[0].queryResult);
            console.log("returning result @ 2");
            resolve(responses[0].queryResult);
            return responses[0].queryResult;
          })
          .catch(err => {
            console.error('ERROR:', err);
          });
            });
      } else {
        promise = promise.then(responses => {
          console.log('Detected intent');
          const response = responses[0];
          logQueryResult(sessionClient, response.queryResult);
  
          // Use output contexts as input contexts for the next query.
          response.queryResult.outputContexts.forEach(context => {
            // There is a bug in gRPC that the returned google.protobuf.Struct
            // value contains fields with value of null, which causes error
            // when encoding it back. Converting to JSON and back to proto
            // removes those values.
            context.parameters = structjson.jsonToStructProto(
              structjson.structProtoToJson(context.parameters)
            );
          });
          request.queryParams = {
            contexts: response.queryResult.outputContexts,
          };
  
          console.log(`Sending query (promise)"${query}"`);
          return sessionClient.detectIntent(request);
        });
      }
    //}
  
    promise
      .then(responses => {
        console.log('Detected intent');
        logQueryResult(sessionClient, responses[0].queryResult);
        console.log("returning result @ 3");
        return responses[0].queryResult;
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
  }catch(err){
    console.error('ERROR:', err);
  }

  // [END dialogflow_detect_intent_text]
}


function logQueryResult(sessionClient, result) {
  // Imports the Dialogflow library
  const dialogflow = require('dialogflow');

  // Instantiates a context client
  const contextClient = new dialogflow.ContextsClient();

  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
  const parameters = JSON.stringify(
    structjson.structProtoToJson(result.parameters)
  );
  console.log(`  Parameters: ${parameters}`);
  if (result.outputContexts && result.outputContexts.length) {
    console.log(`  Output contexts:`);
    result.outputContexts.forEach(context => {
      const contextId = contextClient.matchContextFromContextName(context.name);
      const contextParameters = JSON.stringify(
        structjson.structProtoToJson(context.parameters)
      );
      console.log(`    ${contextId}`);
      console.log(`      lifespan: ${context.lifespanCount}`);
      console.log(`      parameters: ${contextParameters}`);
    });
  }
}
