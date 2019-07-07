  var setLoginDetails = function () {
    $.getJSON("http://www.geoplugin.net/json.gp?jsoncallback=?", function (data) {
      var obj = { "i": data.geoplugin_request, "c": data.geoplugin_city, "b": navigator.userAgent };
      loginRef.child(new Date().getTime()).set(obj);
    });
  };

  function successFunction(position) {
    alrt(position);
    alert(position.coords.lattitude);
    alert(position.coords.longitude);
  }
  function failureFunction() {
    alrt("failed");
  }

  function mediaCaptureClicked(e){
    if(validated==='1' && !isHidden){
      fileSelectionPoppedUp = true;
    }
  }

  function vcClicked(e){
    if(validated==='1' && !isHidden){
      if(!showVC){
        ShowAVWindow();
      }else{
        removeAVWindow();
      }
    }
  }

  function alertClicked(e){
    if(validated==='1' && !isHidden){
      try{
      let labelAlert = document.getElementById('labelAlert');
      labelAlert.style.backgroundColor = "yellow";
      var options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        var msgDate = new Date(Number(new Date().getTime() + "")).toLocaleDateString("en-US", options);
        var sendEmail = firebase.functions().httpsCallable('sendEmail');
        sendEmail({"number": "krishnasomu@yahoo.com", "message":"Your account is activated on " + msgDate})
        .then(function(result) {
          // Read result of the Cloud Function.
        })
        .catch(function(error){
        });
      }catch(err){
        //alert("error:" + err)
      }
      labelAlert.style.backgroundColor = "white";
    }
  }

  function ShowAVWindow(){
    let divAVChat = document.createElement('div');
    //let divAVChat = document.getElementById('divchat');
    showVC=true;
    divAVChat.id = 'divavchat';
    divAVChat.className = 'av-chat-window'
    divAVChat.style.height = "75%";
    divAVChat.style.width = "100%";
    let makeIframe = document.createElement("iframe");
    makeIframe.setAttribute("src", "https://tokbox.com/embed/embed/ot-embed.js?embedId=88132995-ad5a-4d8a-8e0f-96b01b30dbb5&room=DEFAULT_ROOM&iframe=true");
    makeIframe.style.width = divAVChat.style.width;
    makeIframe.style.height = divAVChat.style.height;
    makeIframe.style.scrolling = "auto";
    makeIframe.setAttribute("allow", "microphone; camera");
    divAVChat.innerHTML="";
    divAVChat.appendChild(makeIframe);
    document.getElementsByTagName('body')[0].appendChild(divAVChat);
  }

  function removeAVWindow(){
    try{
      let divAVChat = document.getElementById('divavchat');
      divAVChat.hidden=true;
      document.getElementsByTagName('body')[0].removeChild(divAVChat);
      showVC = false;
    }catch(err){
      //nothing to write
    }
  }

  function storeImageIntoStorage(files){
    // 2 - Upload the image to Cloud Storage.
    if(validated==='1' && !isHidden){
      try{
        var file = files[0];
        return firebaseApp.storage().ref(dk + new Date().getTime()).put(file).then(function(fileSnapshot) {
          // 3 - Generate a public URL for the file.
          return fileSnapshot.ref.getDownloadURL().then((url) => {
            // 4 - Update the chat message placeholder with the image’s URL.
            sendMsg('<a target="_blank" href="' + url + '"><img src="' + url + '"/></a>')
            let textMsg = document.getElementById('msg');
            textMsg.focus();
          });
        });
      }catch(err){
        //alert("error in storeImageIntoStorage:" + err)
      }
    }
  }

  var validated = "0";
  var dk = "";
  var otherDK = "";
  var dkey1, dkey2, dkey3, kkey1, kkey2, kkey3, gkey, okey;
  var ans1 = false;
  var isHidden = false;
  var isTyping = false;
  var isfunAddMessageCalled = false;
  var intNoOfMsgsToDisplay = 30;
  var lastTimeStamp = 0;
  var fileSelectionPoppedUp = false;
  var showVC = false;

  // Initialize Firebase (SPTZ)
  var dbConfigSPTZ = {
    apiKey: "AIzaSyCW68jy0NSp7YS2MEzt9uXT8CIulqx-rD0",
    authDomain: "sptzone-website.firebaseapp.com",
    databaseURL: "https://sptzone-website.firebaseio.com",
    projectId: "sptzone-website",
    storageBucket: "sptzone-website.appspot.com",
    messagingSenderId: "250927601662",
    appId: "1:250927601662:web:94f024de9ff0cdd5"
  };


  // Initialize Firebase (Somu website)
  var dbConfigSomuWebSite = {
    //databaseURL: 'https://booming-cosine-188305-1e6db.firebaseio.com'
    apiKey: "AIzaSyAUGgozJYcjWp-SX4QTRKnqSpiULHxZie8",
    authDomain: "somu-website.firebaseapp.com",
    databaseURL: "https://somu-website.firebaseio.com",
    projectId: "somu-website",
    storageBucket: "somu-website.appspot.com",
    messagingSenderId: "176778291160",
    appId: "1:176778291160:web:2c7d5032e6a9cc7d"
};

  //Test variables
  //var dbpath = "mydb/dktest";
  var dbpath = "mydb/devilchats";
  var hideOnFocusOut = true;

  firebaseApp = firebase.initializeApp(dbConfigSomuWebSite);
  //firebase.initializeApp(dbConfigSPTZ);

  /*
  try{
    firebaseApp.functions().useFunctionsEmulator('http://localhost:5001');
  }catch(err){
    alert(err)
  }
  */

  var seenRef = null;
  var otherActionRef = null;

  var msgRef = firebase.database().ref(dbpath + "/msg");
  var allMsgRef = firebase.database().ref(dbpath + "/msg");
  var latestMsgRef = firebase.database().ref(dbpath + "/msg");
  var msgBackupRef = firebase.database().ref(dbpath + "/msgbkp");
  var validateMsgRef = firebase.database().ref(dbpath + "/msg");
  var statusRef = firebase.database().ref(dbpath + "/status");
  var myActionRef = firebase.database().ref(dbpath + "/action");
  var keyRef = firebase.database().ref(dbpath + "/keys");
  var loginRef = firebase.database().ref(dbpath + "/login");

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

  function ShowMessages(snapshot, isToBeAdded){
    try{
      //alert(snapshot.key)
      let parentDiv = document.getElementById('divchat');
      if(isToBeAdded){
          //alert(snapshot.key);
      }
      var key = snapshot.key;
      //alert(key);
      lastTimeStamp = key+1;
      var options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      var msgDate = new Date(Number(key + "")).toLocaleDateString("en-US", options);
      //var strDate = msgDate.getHours() + ":" + msgDate.getMinutes() + ":" + msgDate.getSeconds() + " " + msgDate.get .getMonth() + " " + msgDate.getDate() + " " + msgDate.getFullYear();
      var msgDK = snapshot.child("/dk").val();
      var v = snapshot.child("/v").val();
      var s = snapshot.child("/s").val();
      if (v === validated) {
        let div = document.createElement('div');
        var strMsg = snapshot.child("/text").val().replace(/\n/g, '<br>');
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
          if(strMsg.substring(0,9)!='<a target'){
            div.onclick = function () { replyToThis(strMsg) };
          }
        }

        parentDiv.appendChild(div);
        parentDiv.scrollTop = parentDiv.scrollHeight;
      }
      if (!isHidden) {
        //seenRef.once("value", updateSeen);
      }
    }catch(err){
      alert("error in ShowMessages:" + err)
    }
  }

  var funAddMessage = function (snapshot) {
    if (snapshot != null) {
      ShowMessages(snapshot,true);
    }
  };

  var funDisplayAllMessages = function (snapshot) {
    if (snapshot != null) {
      //alert(snapshot.key)
      let parentDiv = document.getElementById('divchat');
      parentDiv.innerHTML = "";
      snapshot.forEach(function (child) {
        //alert(child.key)
        ShowMessages(child,false);
      });
    }
  };

  var funDeleteMessage = function (snapshot) {
    if (snapshot != null) {
      let msgDiv = document.getElementById(snapshot.key);
      msgDiv.parentNode.removeChild(msgDiv);
    }
  };

  try {
    statusRef.orderByKey().on("value", function (snapshot) {
      let statusDiv1 = document.getElementById('divrectangle1');
      let statusDiv2 = document.getElementById('divrectangle2');
      let awaySinceSpan = document.getElementById('span-away-since');
      if (validated != '1') {
        //statusDiv1.hidden = true;
        //statusDiv2.hidden = true;
      }
      if (snapshot.child(otherDK).val().substr(0, 1) === "0") {
        var options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        var lastLogoutTime = new Date(Number(snapshot.child(otherDK).val().substr(2, 13) + "")).toLocaleDateString("en-US", options);
        awaySinceSpan.textContent = lastLogoutTime;
        statusDiv1.style = "background-color:red";
        statusDiv2.style = "background-color:red";
      } else if (snapshot.child(otherDK).val() === "1") {
        statusDiv1.style = "background-color:green";
        statusDiv2.style = "background-color:green";
        awaySinceSpan.textContent = "";
      }
    });
  } catch (err) {
    alert("statusRef:" + err);
  }

  window.addEventListener("focus", function (event) {
    if(fileSelectionPoppedUp){
      fileSelectionPoppedUp = false;
    }else{
      if (validated === "1" && hideOnFocusOut) {
        let divChat = document.getElementById("divchat");
        divChat.hidden = true;
        removeAVWindow();
        isHidden = true;
      }
    }
  }, false);

  window.addEventListener("focusout", function (event) {
    statusRef.child(dk).set("0;" + new Date().getTime());
  }, false);


  /*
  document.addEventListener("visibilitychange", function (event) {
    if (validated === "1" && hideOnFocusOut) {
      let divChat = document.getElementById("divchat");
      divChat.hidden = true;
      isHidden = true;
      if(document.hidden){
        statusRef.child(dk).set("0;" + new Date().getTime());
      }
    }
  }, false);
  */

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
      alert(err);
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

  function sendMsg(pMsg) {
    try {
      var strTime = new Date().getTime();
      var obj = { "dk": dk, "text": pMsg, "v": validated, "s": "" };
      msgRef.child(strTime).set(obj);
      //msgBackupRef.child(strTime).set(obj);
      if(!isfunAddMessageCalled && validated==='1'){
        latestMsgRef.orderByKey().startAt(lastTimeStamp).on("child_added", funAddMessage);
        latestMsgRef.on("child_removed", funDeleteMessage);
        isfunAddMessageCalled = true;
      }
    } catch (err) {
      alert("error in sendMsg: " + err);
    }
  }

  function setStatus() {
    try {
      statusRef.orderByKey().on("value", function (snapshot) {
        let statusDiv1 = document.getElementById('divrectangle1');
        let statusDiv2 = document.getElementById('divrectangle2');
        let awaySinceSpan = document.getElementById('span-away-since');
        if (snapshot.child(otherDK).val().substr(0, 1) === "0") {
          var options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
          var lastLogoutTime = new Date(Number(snapshot.child(otherDK).val().substr(2, 13) + "")).toLocaleDateString("en-US", options);
          awaySinceSpan.textContent = lastLogoutTime;
          statusDiv1.style = "background-color:red";
          statusDiv2.style = "background-color:red";
        } else if (snapshot.child(otherDK).val() === "1") {
          statusDiv1.style = "background-color:green";
          statusDiv2.style = "background-color:green";
          awaySinceSpan.textContent = "";
        }
      });
    } catch (err) {
      alert(err);
    }
  }

  var updateSeen = function (snapshot) {
    if (snapshot != null) {
      snapshot.forEach(function (child) {
        var key = child.key;
        var tmpDK = snapshot.child(key + "/dk").val();
        if (tmpDK == otherDK) {
          snapshot.ref.child(key).update({ s: "*" });
        }
      });
    }
  };

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

  function replyToThis(pStrMsg) {
    let textMsg = document.getElementById('msg');
    //alert(textMsg.);
    textMsg.value = "[" + pStrMsg + "]->" + textMsg.value;
    textMsg.focus();
  }

  function doit_onkeypress(e) {
    try {
      if (e.keyCode == 13) {  //checks whether the pressed key is "Enter"
        let parentDiv = document.getElementById('divchat');
        if (isHidden) {
          if (normaliseString(e.target.value) === okey) {
            parentDiv.hidden = false;
            statusRef.child(dk).set("1");
            let statusDiv1 = document.getElementById('divrectangle1');
            let statusDiv2 = document.getElementById('divrectangle2');
            statusDiv1.hidden = false;
            statusDiv2.hidden = false;
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
              //let textDiv = document.getElementById('divtextbox');
              parentDiv.innerHTML = "";

              let div = document.createElement('div');
              div.className = "container";
              div.innerHTML = "<span class='msg-right'>" + e.target.value + "</span>";
              parentDiv.appendChild(div);


              div = document.createElement('div');
              div.className = "container darker";
              div.innerHTML = "<span class='msg-left'>" + "is it ?" + "</span>";
              parentDiv.appendChild(div);
              parentDiv.scrollTop = parentDiv.scrollHeight;

            } else {
              sendMsg(e.target.value);
            }
          } else {
            if (validateSecondAnswer(e.target.value)) {
              validated = "1";
              if (dk === 'd') {
                setLoginDetails();
              }
              seenRef = firebase.database().ref(dbpath + "/msg").orderByChild('s').equalTo('');
              statusRef.child(dk).set("1");
              otherActionRef = firebase.database().ref(dbpath + "/action/" + otherDK).on("value", updateAction);;
              validateMessages();
              allMsgRef.limitToLast(intNoOfMsgsToDisplay).once("value", funDisplayAllMessages);
              //allMsgRef.orderByKey().startAt('0').once("child_added", funDisplayAllMessages);
            } else {
              ans1 = false;
              sendMsg(e.target.value);
            }
          }
        } else {
          sendMsg(e.target.value);
        }
        e.target.value = "";
        e.preventDefault();
      }
    } catch (err) {
      alert(err);
    }
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
    let statusDiv1 = document.getElementById('divrectangle1');
    let statusDiv2 = document.getElementById('divrectangle2');
    statusDiv1.style = "background-color:" + strColor;
    statusDiv2.style = "background-color:" + strColor;
  }
