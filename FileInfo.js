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
  ScrollView,
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
import axios from "axios";

const FileInfo = ({ route, navigation }) => {
  //per dimensioni finestra in real time
  const winSize = useWindowDimensions();

  //inizializzo databse firebase
  const db = getFirestore();

  //inizializzo overlay caricamento
  let [spinnerVisible, setSpinnerVisibile] = React.useState(false);

  //stato file
  let [stato, setStato] = React.useState("");

  React.useEffect(async () => {
    let status = await axios.get(
      "https://api.web3.storage/status/" + route.params.cid
    );

    if (status.data.deals.length > 0) setStato("Pinned");
    else setStato("Queuing");
  }, []);

  return (
    <ScrollView
      style={{ backgroundColor: "#191919" }}
      contentContainerStyle={{
        width: "flex",
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

      {/*Titolo app */}
      <Text style={{ color: "white", fontSize: hp("10%"), fontWeight: "500" }}>
        DArchive
      </Text>

      {/*Nome e cognome utente */}
      <Text
        style={{
          color: "white",
          fontSize:
            winSize.width < 900 ? winSize.width / 30 : winSize.width / 40,
          fontWeight: "400",
          marginTop: hp("5%"),
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

      {/*Immagine documento */}
      <Image
        source={require("./assets/file.png")}
        style={{
          width: "90px",
          aspectRatio: 0.7,
          height: "110px",
          borderRadius: hp("5%"),
          marginTop: "5%",
        }}
      />

      {/*Testo status */}
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: "25px",
          marginTop: "3%",
        }}
      >
        Status
      </Text>
      {/* status */}
      <Text
        style={{
          color: stato == "Pinned" ? "green" : "red",
          fontSize: "20px",
          marginTop: "1%",
          fontWeight: "200",
        }}
      >
        {stato}
      </Text>

      {/*Testo nome */}
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: "25px",
          marginTop: "3%",
        }}
      >
        Name
      </Text>
      {/* nome */}
      <Text
        style={{
          color: "white",
          fontSize: "20px",
          marginTop: "1%",
          fontWeight: "200",
        }}
      >
        {route.params.name}
      </Text>

      {/*Testo size */}
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: "25px",
          marginTop: "3%",
        }}
      >
        Size
      </Text>
      {/* size */}
      <Text
        style={{
          color: "white",
          fontSize: "20px",
          marginTop: "1%",
          fontWeight: "200",
        }}
      >
        {(route.params.size / 1000000).toFixed(2) + "MB"}
      </Text>

      {/*Testo loading date */}
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: "25px",
          marginTop: "3%",
        }}
      >
        Loading date
      </Text>
      {/* date */}
      <Text
        style={{
          color: "white",
          fontSize: "20px",
          marginTop: "1%",
          fontWeight: "200",
          marginBottom: "2%",
        }}
      >
        {new Date(route.params.data).toLocaleString()}
      </Text>
    </ScrollView>
  );
};

export default FileInfo;
