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
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
const {
  initializeAppCheck,
  ReCaptchaV3Provider,
} = require("firebase/app-check");
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import config from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDfP0XCt3KrnuMtEvqGVlUtDu7ZyznV3nE",
  authDomain: "darchive5.firebaseapp.com",
  projectId: "darchive5",
  storageBucket: "darchive5.appspot.com",
  messagingSenderId: "401935292054",
  appId: "1:401935292054:web:d0efd92ecd1b06e634d4b7",
  measurementId: "G-TL4FJNPGS7",
};

const LogIn = ({ navigation }) => {
  //per dimensioni finestra in real time
  const winSize = useWindowDimensions();

  //inizializzo firebase
  //il provider recaptcha serve per rifiutare richieste che provengono da siti al di fuori di darchive
  const app = initializeApp(config.firebaseConfig);
  const appcheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(config.ReCaptchaV3ProviderToken),
    isTokenAutoRefreshEnabled: true,
  });
  const auth = getAuth(app);

  let [email, setEmail] = React.useState("");
  let [password, setPassword] = React.useState("");

  let accedi = async () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        //salvo per login automatico
        await AsyncStorage.setItem(
          "credentials",
          JSON.stringify({
            email: email,
            password: password,
          })
        );

        navigation.push("Home", { email: email, password: password });
      })
      .catch((error) => {
        alert("User credentials not valid");
      });
  };

  React.useEffect(async () => {
    //se gia aveva eseguito l'accesso allora vado direttamente all'home
    let credentials = await AsyncStorage.getItem("credentials");
    let credentialsJson = await JSON.parse(credentials);

    if (credentialsJson != undefined)
      signInWithEmailAndPassword(
        auth,
        credentialsJson.email,
        credentialsJson.password
      )
        .then(async (userCredential) => {
          navigation.push("Home", {
            email: credentialsJson.email,
            password: credentialsJson.password,
          });
        })
        .catch((error) => {
          alert("User credentials not valid");
        });
  }, []);

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
        {/*Login Text */}
        <Text
          style={{
            color: "white",
            fontSize: hp("5%"),
            fontWeight: "200",
            marginTop: hp("5%"),
          }}
        >
          Login
        </Text>

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

        {/*Pulsante LogIn */}
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
            accedi();
          }}
        >
          <View>
            <Text style={{ color: "white" }}>Send</Text>
          </View>
        </TouchableOpacity>

        {/*SigIn pulsante */}
        <TouchableOpacity
          style={{ marginTop: hp("2%") }}
          onPress={() => {
            navigation.push("SigIn", { auth: auth });
          }}
        >
          <Text style={{ fontSize: hp("2%"), fontWeight: 200, color: "white" }}>
            SigIn now
          </Text>
        </TouchableOpacity>

        {/*Pulsante info */}
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: "3%",
            marginBottom: hp("5%"),
          }}
          onPress={() => {
            navigation.push("Settings", { email: "" });
          }}
        >
          <Icon name="information-outline" color={"white"} size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LogIn;
