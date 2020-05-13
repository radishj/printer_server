let firebase = require('firebase/app');
let firestore = require('firebase/firestore');
  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyD3aDZZ6B6iy9kBU3KBZJNEL6aJd3WaSxc",
    authDomain: "easyeat-ef6db.firebaseapp.com",
    databaseURL: "https://easyeat-ef6db.firebaseio.com",
    projectId: "easyeat-ef6db",
    storageBucket: "easyeat-ef6db.appspot.com",
    messagingSenderId: "77253706279",
    appId: "1:77253706279:web:eb0636c2a34dfae7e90402"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  module.exports = db;