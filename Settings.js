import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
  Image,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
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
  increment,
} from "firebase/firestore/";
import Spinner from "react-native-loading-spinner-overlay";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { WebView } from "react-native-webview";

const Settings = ({ route, navigation }) => {
  //per dimensioni finestra in real time
  const winSize = useWindowDimensions();

  //inizializzo databse firebase
  const db = getFirestore();

  //inizializzo overlay caricamento
  let [spinnerVisible, setSpinnerVisibile] = React.useState(false);

  return (
    <View
      style={{
        width: "flex",
        height: "100%",
        backgroundColor: "#191919",
        alignItems: "center",
      }}
    >
      {/*overlay loading */}
      <Spinner
        visible={spinnerVisible}
        textStyle={{ color: "white" }}
        children={
          <View
            style={{
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/*Spinner */}
            <ActivityIndicator
              color={"white"}
              size={"large"}
            ></ActivityIndicator>
          </View>
        }
      />

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

      {/*Nome e cognome utente */}
      <Text
        style={{
          color: "white",
          fontSize:
            winSize.width < 900 ? winSize.width / 30 : winSize.width / 40,
          fontWeight: "400",
          marginTop: hp("-2%"),
        }}
      >
        {route.params.email}
      </Text>

      <View
        style={{
          width: "100%",
          justifyContent: "center",
          flexDirection: "row",
          height: "5%",
          marginTop: hp("3%"),
          alignItems: "center",
        }}
      >
        {/*Pulsante back */}
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Icon name="keyboard-backspace" color={"white"} size={30} />
          <Text style={{ color: "white", fontWeight: 200 }}>Back</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          borderRadius: "20px",
          backgroundColor: "#2b2b2b",
          width: "70%",
          alignItems: "center",
          marginTop: winSize.height / 20,
        }}
      >
        {/*Info */}
        <Text
          style={{
            color: "white",
            textAlign: "center",
            width: winSize.width / 2,
            marginTop: "5%",
          }}
        >
          Hi everyone, this is{" "}
          {
            <Text style={{ color: "#ff5c5c", fontWeight: "bold" }}>
              DArchive
            </Text>
          }{" "}
          a decentralized storage service developed by Vincenzo Aiello. It is
          based on the use of{" "}
          {
            <Text style={{ color: "#ff5c5c", fontWeight: "bold" }}>
              <a
                href="https://web3.storage/"
                style={{ color: "#ff5c5c" }}
                target="_blank"
              >
                Web3.storage
              </a>
            </Text>
          }{" "}
          that allows to get data persisted by{" "}
          {
            <Text style={{ color: "#ff5c5c", fontWeight: "bold" }}>
              <a
                href="https://filecoin.io/"
                style={{ color: "#ff5c5c" }}
                target="_blank"
              >
                Filecoin
              </a>
            </Text>
          }{" "}
          and available over{" "}
          {
            <Text style={{ color: "#ff5c5c", fontWeight: "bold" }}>
              {" "}
              <a
                href="https://ipfs.io/"
                style={{ color: "#ff5c5c" }}
                target="_blank"
              >
                IPFS
              </a>
            </Text>
          }{" "}
          . Files are encrypted using the AES algorithm and their security is
          based on the selected password.{"\n"}Enjoy it!😁
        </Text>

        {/*Testo Donate */}
        <Text
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "20px",
            marginTop: "5%",
          }}
        >
          Donate
        </Text>

        {/*Pulsante dona */}
        <TouchableOpacity
          style={{
            marginTop: hp("3%"),
            marginBottom: "5%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={async () => {
            let pay = window.open();
            pay.location.href =
              "https://www.paypal.com/donate/?hosted_button_id=WZV4EMC2W4VJA";
          }}
        >
          <Image
            style={{ width: "260px", height: "50px" }}
            source={{ uri: require("./assets/PaypalIcon.svg") }}
          ></Image>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Settings;
