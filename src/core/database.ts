import * as firebase from "firebase/app";
import "firebase/firestore";

const firebaseConfig = { // firebase config
    apiKey: "AIzaSyDkJAZhs_4Q9urSppZPkUTwFOhIPFhJADM",
    authDomain: "setest-83812.firebaseapp.com",
    databaseURL: "https://setest-83812.firebaseio.com",
    projectId: "setest-83812",
    storageBucket: "setest-83812.appspot.com",
    messagingSenderId: "889030605703",
    appId: "1:889030605703:web:1dd44027365adccf477122"
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
// db.enablePersistence().then((err) => {
//   console.log(err)
// });