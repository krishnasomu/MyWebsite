/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';
alert(1)
try{
  firebase.initializeApp({
    databaseURL: 'https://somu-website.firebaseio.com/',
    authDomain: "somu-website.firebaseapp.com",
    apiKey: 'AIzaSyAUGgozJYcjWp-SX4QTRKnqSpiULHxZie8',
    projectId: 'somu-website'
  });
}catch(err){
  alert("error while initializing firebase");
}

// Page elements
let divChat = document.getElementById('divchat');
let divStatus = document.getElementById('divrectangle');
let spanAwaySince = document.getElementById('span-away-since');
let textMsg = document.getElementById('msg');

var intNoOfMsgsToDisplay = 30;
var validated = "0";
var dk = "";
var otherDK = "";
var dkey1, dkey2, dkey3, kkey1, kkey2, kkey3, gkey, okey;
var ans1 = false;
var isHidden = false;

//Test variables
var dbRoot = "dktest" //for Firestore
var dbpath = "mydb/" + dbRoot; //for Realtimedatabase
var hideOnFocusOut = true;

// Firebase references
//var seenRef = null;
var statusRef = firebase.database().ref(dbpath + "/status");
var myActionRef = firebase.database().ref(dbpath + "/action");
var keyRef = firebase.database().ref(dbpath + "/keys");
var loginRef = firebase.database().ref(dbpath + "/login");
var otherActionRef = null;

keyRef.orderByKey().on("value", function (snapshot) {
  if (snapshot != null) {
    dkey1 = snapshot.child("dkey1").val();
    dkey2 = snapshot.child("dkey2").val();
    dkey3 = snapshot.child("dkey3").val();
    kkey1 = snapshot.child("kkey1").val();
    kkey2 = snapshot.child("kkey2").val();
    kkey3 = snapshot.child("kkey3").val();
    gkey = snapshot.child("gkey").val();
    okey = snapshot.child("okey").val();
  }
});

function saveLogin(){
  var setLoginDetails = function () {
    $.getJSON("http://www.geoplugin.net/json.gp?jsoncallback=?", function (data) {
      var obj = { "ip": data.geoplugin_request, "city": data.geoplugin_city, "ua": navigator.userAgent };
      loginRef.child(new Date().getTime()).set(obj);
    });
  };
}

var updateAction = function (snapshot) {
  if (validated == "1" && !isHidden) {
    if (snapshot != null) {
      if (snapshot.val() === '1') {
        change_status('yellow');
      } else {
        change_status('green');
      }
    }
  }
};

// Signs-in Friendly Chat.
window.addEventListener("focus", function (event) {
  if (validated === "1" && hideOnFocusOut) {
    //divChat.hidden = true;
    //isHidden = true;
  }
}, false);

window.addEventListener("focusout", function (event) {
  statusRef.child(dk).set("0;" + new Date().getTime());
}, false);

window.addEventListener("unload", function (event) {
  statusRef.child(dk).set("0;" + new Date().getTime());
}, false);

function normaliseString(str) {
  var returnStr = "";
  for (var v of str) {
    var asciiValue = v.charCodeAt(0);
    if ((asciiValue >= 65 && asciiValue <= 90) || (asciiValue >= 97 && asciiValue <= 122)) {
      returnStr = returnStr + v;
    }
  }
  return returnStr;
}

function validateFirstAnswer(pAnswer) {
  try {
    if (pAnswer === dkey1 || pAnswer === dkey2 || pAnswer === dkey3) {
      return "d";
    }
    if (pAnswer === kkey1 || pAnswer === kkey2 || pAnswer === kkey3) {
      return "k";
    }
  } catch (err) {
    alert("error in validateFirstAnswer:" + err);
    return "";
  }
  return "";
}

function validateSecondAnswer(pAnswer) {
  try {
    if (pAnswer === gkey) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
  return false;
}

function validateMessages() {
  try {
    validateMsgRef.orderByChild("v").equalTo("0").once("value", function (snapshot) {
      if (snapshot != null) {
        snapshot.forEach(function (child) {
          snapshot.ref.child(child.key).update({ v: "1" });
        });
      }
      validateMsgRef.off();
    });
  } catch (err) {
    alert("error in validateMessages: " + err);
  }
}

function signIn() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

function setStatus(){
  try {
    statusRef.orderByKey().on("value", function (snapshot) {
      if (validated != '1') {
        //divStatus.hidden = true;
      }
      if (snapshot.child(otherDK).val().substr(0, 1) === "0") {
        var options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        var lastLogoutTime = new Date(Number(snapshot.child(otherDK).val().substr(2, 13) + "")).toLocaleDateString("en-US", options);
        spanAwaySince.textContent = lastLogoutTime;
        divStatus.style = "background-color:red";
      } else if (snapshot.child(otherDK).val() === "1") {
        divStatus.style = "background-color:green";
        spanAwaySince.textContent = "";
      }
    });
  } catch (err) {
    alert("statusRef:" + err);
  }
}
// Signs-out of Friendly Chat.
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

// Initiate firebase auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

function doit_onkeypress(e) {
  alert(e)
  try {
    if (e.keyCode == 13) {  //checks whether the pressed key is "Enter"
    if (isHidden) {
      if (normaliseString(e.target.value) === okey) {
        divChat.hidden = false;
        statusRef.child(dk).set("1");
        divStatus.hidden = false;
        isHidden = false;
      } else {
        //alert("welcome back !!!");
      }
      e.target.value = "";
      e.preventDefault();
      return;
    }
      if (validated === "0") {
        if (!ans1) {
          dk = validateFirstAnswer(normaliseString(e.target.value));
          if (dk === "d") {
            otherDK = "k";
          } else {
            otherDK = "d";
          }
          if (dk === "d" || dk === "k") {
            document.title = dk;
            ans1 = true;
            divChat.innerHTML = "";

            let div = document.createElement('div');
            div.className = "container";
            div.innerHTML = "<span class='msg-right'>" + e.target.value + "</span>";
            divChat.appendChild(div);


            div = document.createElement('div');
            div.className = "container darker";
            div.innerHTML = "<span class='msg-left'>" + "is it ?" + "</span>";
            divChat.appendChild(div);
            divChat.scrollTop = divChat.scrollHeight;

          } else {
            sendMsg(e.target.value);
          }
        } else {
          if (validateSecondAnswer(e.target.value)) {
            validated = "1";
            if (dk === 'd') {
              setLoginDetails();
            }
            //seenRef = firebase.database().ref(dbpath + "/msg").orderByChild('s').equalTo('');
            statusRef.child(dk).set("1");
            otherActionRef = firebase.database().ref(dbpath + "/action/" + otherDK).on("value", updateAction);;
            //validateMessages();
            //allMsgRef.limitToLast(intNoOfMsgsToDisplay).once("value", funDisplayAllMessages);
            loadMessages();
          } else {
            ans1 = false;
            sendMsg(e.target.value);
          }
        }
      } else {
        alert("sendmsg is being called")
        sendMsg(e.target.value);
      }
      e.target.value = "";
      e.preventDefault();
    }
  } catch (err) {
    alert("error in doit_onkeypress" + err);
  }
}

function replyToThis(pStrMsg) {
  //alert(textMsg.);
  textMsg.value = "[" + pStrMsg + "]->" + textMsg.value;
  textMsg.focus();
}

function doit_onkeyup(e) {
  if (validated == "1" && !isHidden) {
    myActionRef.child(dk).set("0");
  }
}

function doit_onkeydown(e) {
  if (validated == "1" && !isHidden) {
    myActionRef.child(dk).set("1");
  }
}

function change_status(strColor) {
  divStatus.style = "background-color:" + strColor;
}

// Returns the signed-in user's profile Pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}

// Saves a new message on the Cloud Firestore.
function sendMsg(messageText) {
  // Add a new message entry to the Firebase database.
  alert('inside sendmsg')
  alert(
  firebase.firestore().collection(dbRoot).add({
    dk: dk,
    text: messageText,
    time: firebase.firestore.FieldValue.serverTimestamp(),
    v: validated
  }).catch(function(error) {
    alert('Error writing new message to Firebase Database:' + error)
    console.error('Error writing new message to Firebase Database', error);
  })
  )
  alert('sendmsg is finished')
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
  // Create the query to load the last "intNoOfMsgsToDisplay" messages and listen for new ones.
  try{
    var query = firebase.firestore().collection(dbRoot).orderBy('time', 'desc').limit(intNoOfMsgsToDisplay);
  
    // Start listening to the query.
    query.onSnapshot(function(snapshot) {
      alert(1)
      snapshot.docChanges().forEach(function(change) {
        if (change.type === 'removed') {
          deleteMessage(change.doc.id);
        } else {
          var message = change.doc.data();
          //displayMessage(change.doc.id, message.timestamp, message.name,message.text);
          ShowMessages(message.time, message.dk,message.text.replace(/\n/g, '<br>'),message.v);
        }
      });
    });
  }catch(err){
    alert("error in loadMessages:" + err)
  }
}

// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
function saveImageMessage(file) {
  // 1 - We add a message with a loading icon that will get updated with the shared image.
  firebase.firestore.collection(dbRoot).add({
    name: getUserName(),
    imageUrl: LOADING_IMAGE_URL,
    profilePicUrl: getProfilePicUrl(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(messageRef) {
    // 2 - Upload the image to Cloud Storage.
    var filePath = firebase.auth().currentUser.uid + '/' + messageRef.id + '/' + file.name;
    return firebase.storage().ref(filePath).put(file).then(function(fileSnapshot) {
      // 3 - Generate a public URL for the file.
      return fileSnapshot.ref.getDownloadURL().then((url) => {
        // 4 - Update the chat message placeholder with the image’s URL.
        return messageRef.update({
          imageUrl: url,
          storageUri: fileSnapshot.metadata.fullPath
        });
      });
    });
  }).catch(function(error) {
    console.error('There was an error uploading a file to Cloud Storage:', error);
  });
}

// Saves the messaging device token to the datastore.
function saveMessagingDeviceToken() {
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.firestore.collection('fcmTokens').doc(currentToken)
          .set({uid: firebase.auth().currentUser.uid});
    } else {
      // Need to request permissions to show notifications.
      requestNotificationsPermissions();
    }
  }).catch(function(error){
    console.error('Unable to get messaging token.', error);
  });
}

// Requests permissions to show notifications.
function requestNotificationsPermissions() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    saveMessagingDeviceToken();
  }).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
}

// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  imageFormElement.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  if (checkSignedInWithMessage()) {
    saveImageMessage(file);
  }
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
    signInButtonElement.setAttribute('hidden', 'true');

    // We save the Firebase Messaging Device token and enable notifications.
    saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInButtonElement.removeAttribute('hidden');
  }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  return false;
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

// Template for messages.
var MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Delete a Message from the UI.
function deleteMessage(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

function ShowMessages(id, timestamp, name, text, v, isToBeAdded){
  try{
    var key = id;
    lastTimeStamp = key+1;
    var options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    var msgDate = new Date(Number(key + "")).toLocaleDateString("en-US", options);
    var msgDK = name;
    var v = v;
    //var s = snapshot.child("/s").val();
    if (v === validated) {
      let div = document.createElement('div');
      var strMsg = text;
      if (msgDK === dk) { //this user
        div.className = "container";
        div.id = key;
        if(isToBeAdded){
          div.innerHTML = div.innerHTML + "<span class='msg-right'>" + strMsg + "</span><br>";
        }else{
          div.innerHTML = "<span class='msg-right'>" + strMsg + "</span><br>";
        }
        div.innerHTML = div.innerHTML + "<span class='time-left'>" + msgDate + "</span><span class='seen-symbol'>  " + s + "</span>";
      } else { //other user
        div.className = "container darker";
        if(isToBeAdded){
          div.innerHTML = div.innerHTML + "<span class='msg-left'>" + strMsg + "</span><br>";
        }else{
          div.innerHTML = "<span class='msg-left'>" + strMsg + "</span><br>";
        }
        div.innerHTML = div.innerHTML + "<span class='time-right'>" + msgDate + "</span>";
        div.onclick = function () { replyToThis(strMsg) };
      }

      divChat.appendChild(div);
      divChat.scrollTop = divChat.scrollHeight;
    }
    if (!isHidden) {
      //seenRef.once("value", updateSeen);
    }
  }catch(err){
    alert("error in ShowMessages:" + err)
  }
}

// Displays a Message in the UI.
function displayMessage(id, timestamp, name, text, picUrl, ) {
  var div = document.getElementById(id);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', id);
    div.setAttribute('timestamp', timestamp);
    for (var i = 0; i < messageListElement.children.length; i++) {
      var child = messageListElement.children[i];
      var time = child.getAttribute('timestamp');
      if (time && time > timestamp) {
        break;
      }
    }
    messageListElement.insertBefore(div, child);
  }
  
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
  }
  
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUrl) { // If the message is an image.
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      messageListElement.scrollTop = messageListElement.scrollHeight;
    });
    image.src = imageUrl + '&' + new Date().getTime();
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  messageInputElement.focus();
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}

// Checks that Firebase has been imported.
checkSetup();

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);

// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

// Events for image upload.
imageButtonElement.addEventListener('click', function(e) {
  e.preventDefault();
  mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener('change', onMediaFileSelected);

// Remove the warning about timstamps change. 
var firestore = firebase.firestore();

 // TODO: Enable Firebase Performance Monitoring.
//firebase.performance();

// We load currently existing chat messages and listen to new ones.
//loadMessages();
//setStatus();
