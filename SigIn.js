import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import {
  addDoc,
  doc,
  collection,
  getFirestore,
  getDocs,
  query,
  deleteDoc,
  orderBy,
  startAfter,
  limit,
  startAt,
  endBefore,
  updateDoc,
  setDoc,
  getDoc,
  where,
} from "firebase/firestore/";

const SigIn = ({ route, navigation }) => {
  //per dimensioni finestra in real time
  const winSize = useWindowDimensions();

  //prendo auth firebase inizializzato in login
  const auth = route.params.auth;

  //inizializzo databse firebase
  const db = getFirestore();

  let [nome, setNome] = React.useState("");
  let [cognome, setCognome] = React.useState("");
  let [email, setEmail] = React.useState("");
  let [password, setPassword] = React.useState("");

  let registrati = () => {
    if (nome != "" && cognome != "" && email != "" && password != "") {
      if (password.length >= 6) {
        //creo nyovo utente se tutti campi compilati e email non esistente già e password più lunga di 6 caratteri
        createUserWithEmailAndPassword(auth, email.trim(), password.trim())
          .then(() => {
            //salvo nome e cognome
            setDoc(doc(db, "Utenti", email.replaceAll(".", "DOT").trim()), {
              nome: nome.trim(),
              cognome: cognome.trim(),
            });

            navigation.goBack();

            alert("Registration has been completed successfully");
          })
          .catch((err) => {
            console.log(err);
            alert("This email already exist or is invalid");
          });
      } else {
        alert("Password has to be at least 6 character");
      }
    } else {
      alert("Complete all fields");
    }
  };

  return (
    <View
      style={{
        width: "flex",
        height: "100%",
        backgroundColor: "#191919",
        alignItems: "center",
      }}
    >
      {/*Logo */}
      <Image
        resizeMode="center"
        style={{
          width: winSize.width / 2,
          height: "250px",
          marginTop: "-20px",
        }}
        source={{ uri: require("./assets/logo.png") }}
      ></Image>

      <View
        style={{
          marginTop: hp("1%"),
          borderRadius: "20px",
          width: winSize.width < 900 ? winSize.width - 100 : winSize.width / 3,
          backgroundColor: "#2b2b2b",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/*SigIn Text */}
        <Text
          style={{
            color: "white",
            fontSize: hp("5%"),
            fontWeight: "200",
            marginTop: hp("5%"),
          }}
        >
          SigIn
        </Text>

        {/*Input Nome */}
        <TextInput
          style={{
            marginTop: hp("3%"),
            height: hp("5%"),
            width: winSize.width < 900 ? winSize.width / 2 : winSize.width / 4,
            borderColor: "black",
            backgroundColor: "white",
            borderWidth: "1px",
            borderRadius: hp("5%"),
            textAlign: "center",
          }}
          onChangeText={(text) => {
            setNome(text);
          }}
          textContentType="name"
          placeholder="Name"
        ></TextInput>

        {/*Input Cognome */}
        <TextInput
          style={{
            marginTop: hp("3%"),
            height: hp("5%"),
            width: winSize.width < 900 ? winSize.width / 2 : winSize.width / 4,
            borderColor: "black",
            backgroundColor: "white",
            borderWidth: "1px",
            borderRadius: hp("5%"),
            textAlign: "center",
          }}
          onChangeText={(text) => {
            setCognome(text);
          }}
          placeholder="Surname"
        ></TextInput>

        {/*Input EMail */}
        <TextInput
          style={{
            marginTop: hp("3%"),
            height: hp("5%"),
            width: winSize.width < 900 ? winSize.width / 2 : winSize.width / 4,
            borderColor: "black",
            borderWidth: "1px",
            borderRadius: hp("5%"),
            textAlign: "center",
            backgroundColor: "white",
          }}
          onChangeText={(text) => {
            setEmail(text);
          }}
          textContentType="emailAddress"
          placeholder="Email"
        ></TextInput>

        {/*Input Password */}
        <TextInput
          style={{
            marginTop: hp("3%"),
            height: hp("5%"),
            width: winSize.width < 900 ? winSize.width / 2 : winSize.width / 4,
            borderColor: "black",
            borderWidth: "1px",
            borderRadius: hp("5%"),
            textAlign: "center",
            backgroundColor: "white",
          }}
          onChangeText={(text) => {
            setPassword(text);
          }}
          secureTextEntry="true"
          passwordRules="true"
          placeholder="Password"
        ></TextInput>

        {/*Pulsante Registrati */}
        <TouchableOpacity
          style={{
            marginTop: hp("3%"),
            backgroundColor: "#ff5c5c",
            width: "150px",
            height: "40px",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            registrati();
          }}
        >
          <View>
            <Text style={{ color: "white" }}>Send</Text>
          </View>
        </TouchableOpacity>

        {/*goBack pulsante */}
        <TouchableOpacity
          style={{ marginTop: hp("2%"), marginBottom: hp("5%") }}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ fontSize: hp("2%"), fontWeight: 200, color: "white" }}>
            Go back
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SigIn;
