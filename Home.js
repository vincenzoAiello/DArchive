import { StatusBar } from "expo-status-bar";
import * as React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import MasonryList from "@react-native-seoul/masonry-list";
import * as ImagePicker from "expo-image-picker";
import * as IPFS from "ipfs-core";
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
} from "firebase/firestore/";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  MenuProvider,
} from "react-native-popup-menu";
var aesjs = require("aes-js");
//const crypto = require("crypto");
var Minizip = require("minizip-asm.js");
import { manipulateAsync } from "expo-image-manipulator";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";

let mutexFoto = false;
let controllerFetch = new AbortController();

const Home = ({ route, navigation }) => {
  //per dimensioni finestra in real time
  const winSize = useWindowDimensions();

  //inizializzo databse firebase
  const db = getFirestore();

  //inizializzo ipfs
  let [ipfs, setIpfs] = React.useState(async () => {
    return await IPFS.create({ repo: "ok" + Math.random() });
  });

  /*inizializzo AES per cifrare e decifrare immagini
  let aesInit = () => {
    var hash = crypto.createHash("sha1");
    let data = hash.update(route.params.password, "utf-8");
    let gen_hash = data.digest().slice(0, 16).toString("base64");
    var key = [];
    for (var i = 0; i < gen_hash.length; i++) {
      key.push(gen_hash.charCodeAt(i));
    }
    return new aesjs.ModeOfOperation.ctr(key);
  };
  let aes = aesInit();*/

  //state con array di immagini da caricare
  let [images, setImages] = React.useState([]);

  //inizializzo overlay caricamento
  let [spinnerVisible, setSpinnerVisibile] = React.useState(false);

  //per non mostrare pulsante durante reload e primo caricamento
  let [reload, setReload] = React.useState(false);

  //per tenere traccia dell'ultimom caricato e quindi continuare il caricamento
  //quando lo scroll arriva alla fine
  let [ultimocaricato, setUltimoCaricato] = React.useState(null);

  let blobToBase64 = function (blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  let aggiornaFoto = function (newPhotoId) {
    return new Promise(async (resolve, reject) => {
      if (!mutexFoto) {
        mutexFoto = true;

        //prendo i cid da firebase prendo il zip dall url ipfs + cid lo unzippo e creo il blob per mostrarlo
        let data = await getDocs(
          query(
            collection(
              db,
              "Utenti",
              route.params.email.replaceAll(".", "DOT"),
              "Photos"
            ),
            orderBy("data", "desc"),
            startAfter(
              images.length != 0 && newPhotoId == undefined
                ? ultimocaricato.data().data
                : {}
            ),
            limit(10)
          )
        );

        //uso questa i per sbloccare il mutex solo quando il fetch ha finito e sono state caricate
        //tutte le foto
        let i = 0;

        //altrimenti non sblocco il mutex se se è vuota la lista
        if (data.docs.length == 0) resolve();

        for (i; i < data.docs.length; i++) {
          //controllo se questo elemento è salvato in locale
          let val = await AsyncStorage.getItem(data.docs[i].id);

          //se non è salvato in locale allora procedo con il caricamento
          if (val == null) {
            //controllo se non è già presente nello state altrimenti ogni volta ad esempio che carichi un nuova foto
            //ricarica tutto
            if (
              !images.includes(
                images.filter((obj) => obj.id === data.docs[i].id)
              )[0]
            ) {
              let req = await fetch(
                /*"https://ipfs.io/ipfs/" + el.data().cid*/ "https://" +
                  data.docs[i].data().cid +
                  ".ipfs.dweb.link",
                {
                  signal: controllerFetch.signal,
                }
              ).catch(async (err) => {
                //abort della fetch
                if (err.name === "AbortError") {
                  //elimino da firebase
                  await deleteDoc(
                    doc(
                      db,
                      "Utenti",
                      route.params.email.replaceAll(".", "DOT"),
                      "Photos",
                      data.docs[i].id
                    )
                  );

                  controllerFetch = new AbortController();

                  if (data.docs[i].id == newPhotoId) {
                    i = data.docs.length;
                    reject();
                  }

                  //sblocco il mutex se sono state caricate tutte le foto
                  if (data.docs.length - 1 == i) {
                    reject();
                  }
                }
              });

              if (req != undefined) {
                let arrayBuffer = await req.arrayBuffer();

                let minizip = new Minizip(Buffer.from(arrayBuffer));
                let imageBuffer = minizip.extract("image.txt", {
                  password: route.params.password,
                });

                var base64data = await blobToBase64(
                  new Blob([imageBuffer.buffer])
                );

                //Abbasso la qualita dell'immagine in modo da caricarla piu velocemente
                //ovviamente in download non sarà scaricata questa ma quella originale
                //compress:0 è la qualità più bassa
                let imageResize = await manipulateAsync(base64data, [], {
                  compress: 0.1,
                });
                let item = {
                  urlResize: imageResize.base64,
                  cid: data.docs[i].data().cid,
                  data: data.docs[i].data().data,
                  id: data.docs[i].id,
                  //Assegno un altezza a caso per il rendering
                  ranHeightImage:
                    Math.random() < 0.5
                      ? undefined
                      : winSize.width < 900
                      ? hp("20%")
                      : hp("25%"),
                };

                //salvo in locale per un caricamento più veloce

                await AsyncStorage.setItem(
                  data.docs[i].id,
                  JSON.stringify({
                    urlResize: imageResize.base64,
                    cid: data.docs[i].data().cid,
                    data: data.docs[i].data().data,
                    id: data.docs[i].id,
                    //Assegno un altezza a caso per il rendering
                    ranHeightImage:
                      Math.random() < 0.5
                        ? undefined
                        : winSize.width < 900
                        ? hp("20%")
                        : hp("25%"),
                  })
                ).catch((err) => {
                  //quando il file è troppo grande non lo salva in locale
                  console.log(err);
                });

                //se viene aggiunta una nuova immagine la metto all'inizio dellarray e poi esco dal for
                //in modo che carico solo le nuove immagini e non ripeteo il caricamento delle altre gia presenti
                if (data.docs[i].id == newPhotoId) {
                  setImages((oldArray) => [item, ...oldArray]);
                  i = data.docs.length;
                } else {
                  setImages((oldArray) => [...oldArray, item]);
                }

                //sblocco il mutex se sono state caricate tutte le foto
                if (data.docs.length - 1 == i) {
                  setUltimoCaricato(data.docs[i]);
                  resolve();
                }
              }
            } else {
              //se è gia presente l'immagine

              //sblocco il mutex se sono state caricate tutte le foto
              if (data.docs.length - 1 == i) {
                setUltimoCaricato(data.docs[i]);
                resolve();
              }
            }

            /* //reinizializzo aes ogni volta che devo cifrare altrimenti non cifra bene
            aes = aesInit();
            //converto array buffer a unint8
            let uint8array = new Uint8Array(arrayBuffer);
            //decifro uint8 e ottengo un uint8
            let dec = aes.decrypt(uint8array);
            //trasformo l'uint8 in un blob e poi in base64 per mostrarlo nell'immagine
            var reader = new FileReader();
            reader.readAsDataURL(new Blob([dec.buffer]));
            reader.onloadend = function () {
              var base64data = reader.result;
              setImages((oldArray) => [
                ...oldArray,
                {
                  url: base64data,
                  id: el.key,
                  //Assegno un altezza a caso per il rendering
                  ranHeightImage:
                    Math.random() < 0.5
                      ? undefined
                      : winSize.width < 900
                      ? hp("20%")
                      : hp("25%"),
                },
              ]);
            };*/
          } else {
            if (
              !images.includes(
                images.filter((obj) => obj.id === data.docs[i].id)[0]
              )
            ) {
              //carico immagine salvata localmente solo se non è gia presente nello state
              setImages((oldArray) => [...oldArray, JSON.parse(val)]);
            }

            //sblocco il mutex se sono state caricate tutte le foto
            if (data.docs.length - 1 == i) {
              setUltimoCaricato(data.docs[i]);
              resolve();
            }
          }
        }
      }
      resolve();
    });
  };

  //Eseguito Appena si apre la pagina e quando premo pulsante reload
  React.useEffect(async () => {
    if (images.length == 0) {
      await AsyncStorage.clear();
      setSpinnerVisibile(true);
      setReload(true);
      aggiornaFoto().then(() => {
        mutexFoto = false;
        setSpinnerVisibile(false);
        setReload(false);
      });
    }
  }, [images]);

  //picker immagini
  let openImagePickerAsync = async () => {
    //permessi
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    //prendo l'immagine
    let selectedResult = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
    });

    for (let i = 0; i < selectedResult.selected.length; i++) {
      //metto overlay caricamneto
      setSpinnerVisibile(true);

      //prendo l'uri dell'immagine e il buffer per zipparlo e metterlo su ipfs
      let res = await fetch(selectedResult.selected[i].uri);
      let arraybuffer = await res.arrayBuffer();

      let minizip = new Minizip();
      minizip.append("image.txt", arraybuffer, {
        password: route.params.password,
      });

      try {
        /* let cid = await ipfs.then(async (i) => {
              //aggiungo ad  ipfs lo zip
              return await i.add(minizip.zip());
            });*/

        let resp = await fetch("https://api.nft.storage/upload", {
          method: "POST",
          headers: new Headers({
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDQwNTMzNjg5QzFFNTQ1RDU1MThBZGU2ZTg0NEUzQTAwOTg4YjY3MzgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0MjAyODc3NTE3NCwibmFtZSI6IkRQaG90byJ9.cflLRiaStFJaovqRPrPWoU6BL3ClQAUjNM56xNbtF7w",
          }),
          body: minizip.zip(),
        });
        let json = await resp.json();

        //aggiungo cid  a firebase
        let el = await addDoc(
          collection(
            db,
            "Utenti",
            route.params.email.replaceAll(".", "DOT"),
            "Photos"
          ),
          {
            cid: /*cid.path,*/ json.value.cid,
            data: Date.now(),
          }
        );

        await aggiornaFoto(el.id)
          .then(() => {
            mutexFoto = false;
            alert("Photo " + (i + 1) + " loaded successfully");
            setSpinnerVisibile(false);
            setReload(false);
          })
          .catch((err) => {
            mutexFoto = false;

            alert("Loading photo cancelled");

            //tolgo overlay caricamneto
            setSpinnerVisibile(false);

            //annullo tutti i caricamenti in coda
            i = selectedResult.selected.length;
          });

        /*})
          .catch((err) => {
            alert("Loading failed");

            //tolgo overlay caricamneto
            setSpinnerVisibile(false);
          });*/
      } catch (err) {
        alert("Loading failed");
        //tolgo overlay caricamneto
        setSpinnerVisibile(false);
      }

      /*
        //reinizializzo aes ogni volta che devo cifrare altrimenti non cifra bene
        aes = aesInit();
        //carico su ipfs
        let cid = await ipfs.then(async (i) => {
          //trasformo l'arraybuffer in uint8array e poi lo cripto e lo carico su ipfs
          return await i.add(aes.encrypt(new Uint8Array(arrayBuffer)));
        });

        //aggiungo cid  a firebase
        push(ref(db, route.params.email.replaceAll(".", "DOT") + "/photos/"), {
          cid: cid.path,
        });*/
    }
  };

  //menu al click della foto
  let menuSelection = async (value, idfoto, cid) => {
    //Elimina foto
    if (value == 2) {
      //elimino da firebase
      await deleteDoc(
        doc(
          db,
          "Utenti",
          route.params.email.replaceAll(".", "DOT"),
          "Photos",
          idfoto
        )
      );

      //elimino dallo state
      let newImages = Object.assign([], images); //si fa così per creare una copia dell'array nello stato
      newImages.splice(
        newImages.indexOf(newImages.filter((obj) => obj.id === idfoto)[0]),
        1
      );
      setImages(newImages);

      //Elimino dallo storage locale
      await AsyncStorage.removeItem(idfoto);
    }

    //Download foto
    if (value == 1) {
      fetch(
        /*"https://ipfs.io/ipfs/" + cid*/ "https://" + cid + ".ipfs.dweb.link"
      )
        .then((data) => data.arrayBuffer())
        .then((arrayBuffer) => {
          let minizip = new Minizip(Buffer.from(arrayBuffer));
          let imageBuffer = minizip.extract("image.txt", {
            password: route.params.password,
          });
          let reader = new FileReader();

          reader.readAsDataURL(new Blob([imageBuffer]));
          reader.onloadend = async function () {
            var base64data = reader.result;

            fetch(base64data)
              .then((res) => res.blob())
              .then((blob) => {
                //converto il blob in un immagine
                let blobImage = new Blob([blob], { type: "image/bmp" });
                //creo url per il blob
                let blobUrl = URL.createObjectURL(blobImage);
                //apro immagine in una nuova finestra
                window.open(blobUrl, "_blank");
              });
          };
        });
      /*fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          //converto il blob in un immagine
          let blobImage = new Blob([blob], { type: "image/bmp" });
          //creo url per il blob
          let blobUrl = URL.createObjectURL(blobImage);
          //apro immagine in una nuova finestra
          window.open(blobUrl, "_blank");
        });*/
    }
  };

  ///////////////RENDER IMMAGINI/////////////////////////////////////
  const Item = ({ data, cid, urlResize, id, randomHeight }) => {
    return (
      //Menu  compare alla pressione dell'immagine
      <View
        style={{
          padding: window.width < 900 ? hp("2%") : hp("3%"),
        }}
      >
        <MenuProvider>
          <Menu onSelect={(value) => menuSelection(value, id, cid)}>
            <MenuTrigger>
              <View style={{ alignSelf: "stretch" }}>
                {/*Immagine */}
                <Image
                  source={{
                    uri: urlResize,
                  }}
                  cacheKey={cid}
                  style={{
                    width: "100%",
                    height: randomHeight,
                    aspectRatio: 0.7,
                    borderRadius: hp("5%"),
                    alignSelf: "stretch",
                  }}
                />
                <Text
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontWeight: 200,
                  }}
                >
                  {new Date(data).toLocaleString()}
                </Text>
              </View>
            </MenuTrigger>
            <MenuOptions>
              <MenuOption value={1} text="Download" />
              <MenuOption value={2}>
                <Text style={{ color: "red" }}>Delete</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </MenuProvider>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <Item
      data={item.data}
      cid={item.cid}
      urlResize={item.urlResize}
      id={item.id}
      randomHeight={item.ranHeightImage}
    />
  );

  //////////////////////////////////////////////////////////////////

  return (
    <View
      style={{
        width: "flex",
        height: "100%",
        backgroundColor: "white",
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
            {/*Tasto annulla caricamento lo mostro solo se è un caricamento di aggiunta foto*/}
            {!reload ? (
              <TouchableOpacity
                style={{
                  backgroundColor: "black",
                  width: "150px",
                  height: "50px",
                  marginTop: hp("5%"),
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => {
                  controllerFetch.abort();
                }}
              >
                <View>
                  <Text style={{ color: "white" }}>Cancelled</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        }
      />
      {/*Titolo app */}
      <Text style={{ color: "Black", fontSize: hp("10%"), fontWeight: "500" }}>
        DPhoto
      </Text>

      {/*Nome e cognome utente */}
      <Text
        style={{
          color: "Black",
          fontSize:
            winSize.width < 900 ? winSize.width / 30 : winSize.width / 40,
          fontWeight: "200",
          marginTop: hp("5%"),
        }}
      >
        {route.params.email}
      </Text>

      <View
        style={{
          flexDirection: "row",
          height: "5%",
          marginTop: hp("3%"),
          alignItems: "center",
        }}
      >
        {/*Pulsante aggiunta foto */}
        <TouchableOpacity
          style={{
            backgroundColor: "black",
            width: "150px",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            openImagePickerAsync();
          }}
        >
          <View>
            <Text style={{ color: "white" }}>Add new photo</Text>
          </View>
        </TouchableOpacity>

        {/*Pulsante reload */}
        <TouchableOpacity
          style={{
            marginLeft: wp("3%"),
            backgroundColor: "black",
            width: "150px",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            //attiverà useEffect
            setImages([]);
          }}
        >
          <View>
            <Text style={{ color: "white" }}>Reload</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ width: "100%", alignItems: "center" }}>
        {/*Container photo */}
        <MasonryList
          numColumns={winSize.width < 900 ? 2 : 5}
          contentContainerStyle={{ alignSelf: "stretch" }}
          data={images}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
        />

        {/*Pulsante  Other*/}
        <TouchableOpacity
          style={{
            marginTop: hp("2%"),
            marginBottom: hp("2%"),
            backgroundColor: "black",
            width: "150px",
            height: "50px",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            setSpinnerVisibile(true);
            setReload(true);
            aggiornaFoto().then(() => {
              mutexFoto = false;
              setSpinnerVisibile(false);
              setReload(false);
            });
          }}
        >
          <View>
            <Text style={{ color: "white" }}>Other</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Home;
