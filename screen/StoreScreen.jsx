import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getMenuByMenuCategoryQL,
  getMenuCategoryByStoreQL,
  getStoreDetailQL,
} from "../config/storeGraphQL";
import StoreScreenSpeechBubble from "../components-store/StoreScreenSpeechBubble";

export default function StoreScreen({ navigation, route }) {
  const { storeId } = route.params;
  const [store, setStore] = useState({});
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);

  const getStoreDetailApi = async () => {
    try {
      const response = await getStoreDetailQL({
        storeId: storeId,
        input: {
          longitude: parseFloat(
            await AsyncStorage.getItem("customerLongitude")
          ),
          latitude: parseFloat(await AsyncStorage.getItem("customerLatitude")),
          // longitude: 127.027619,
          // latitude: 37.497952,
          // longitude: 37.497952,
        },
      });
      console.log("####" + response);
      setStore(response);
    } catch {
      console.log("error in getStoreDetailApi");
      setStore({});
    }
  };

  const getMenuCategoryByStoreApi = async () => {
    try {
      console.log("hi");
      const response = await getMenuCategoryByStoreQL({ storeId: storeId });
      console.log(response);
      setCategories(response);
      response.forEach((category) => {
        getMenuByMenuCategoryApi(category.menuCategoryId);
      });
    } catch {
      console.log("error in getMenuCategoryByStoreApi");
    }
  };

  const getMenuByMenuCategoryApi = async (menuCategoryId) => {
    try {
      const response = await getMenuByMenuCategoryQL({
        menuCategoryId: menuCategoryId,
      });
      setMenus((prevMenus) => ({ ...prevMenus, [menuCategoryId]: response }));
    } catch {
      console.log("error in getMenuByMenuCategoryApi");
    }
  };

  useEffect(() => {
    getStoreDetailApi();
    getMenuCategoryByStoreApi();
    console.log(menus);
  }, []);

  const dimensionWidth = Dimensions.get("window").width / 1.2;

  return (
    <ScrollView style={styles.box}>
      <View>
        {console.log("image check" + store.storeImage)}
        <Image
          style={[styles.image, { width: dimensionWidth }]}
          source={
            store.storeImage
              ? {
                  uri:
                    "https://storage.googleapis.com/waguwagu_bucket/" +
                    store.storeImage,
                }
              : require("./../assets/food icon.png")
          }
        />
        <View style={styles.textContainer}>
          <Text style={styles.textTitle}>{store.storeName}</Text>
          <Pressable
            style={styles.reviewButton}
            onPress={() =>
              navigation.navigate("ReviewSection", {
                storeId: storeId,
                storeName: store.storeName,
              })
            }
          >
            <Text>리뷰보러가기</Text>
          </Pressable>
          <Text style={styles.text}>
            {parseInt(store.distanceFromStoreToCustomer * 4 + 10) +
              "~" +
              parseInt(store.distanceFromStoreToCustomer * 4 + 25) +
              "분"}
          </Text>
          <Text style={styles.text}>
            {"최소 주문 금액 : " + store.storeMinimumOrderAmount + "원"}
          </Text>
          <Text style={styles.text}>
            {"배달팁 : " + store.deliveryFee + "원"}
          </Text>
        </View>

        <View style={{ alignSelf: "center" }}>
          <StoreScreenSpeechBubble
            height={80}
            width={dimensionWidth}
            content={store.storeIntroduction}
          />
        </View>
        {categories && categories.length > 0 ? (
          categories.map((category) => {
            return (
              <View key={category.menuCategoryId}>
                <View style={styles.menuCategoryContainer}>
                  <Text style={[{ fontSize: 25 }, { paddingBottom: 5 }]}>
                    {category.menuCategoryName}
                  </Text>
                  {menus[category.menuCategoryId] ? (
                    menus[category.menuCategoryId].map((menu) => (
                      <TouchableOpacity
                        key={menu.menuId}
                        onPress={() =>
                          navigation.navigate("MenuDetailScreen", {
                            menuId: menu.menuId,
                            storeId: storeId,
                            storeName: store.storeName,
                          })
                        }
                        disabled={!menu.menuPossible}
                      >
                        <View key={menu.menuId} style={[styles.menuContainer]}>
                          <View>
                            {menu.menuPossible ? (
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.textEllipsis,
                                  { marginTop: 5 },
                                  { fontSize: 20 },
                                ]}
                              >
                                {menu.menuName}
                              </Text>
                            ) : (
                              <Text
                                style={[{ fontSize: 20 }, { color: "red" }]}
                              >
                                [품절] {menu.menuName}
                              </Text>
                            )}
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.textEllipsis,
                                { marginTop: 5 },
                                { color: "#757575" },
                              ]}
                            >
                              {menu.menuIntroduction}
                            </Text>
                            <Text style={{ marginTop: 10 }}>
                              가격 {menu.menuPrice}원
                            </Text>
                          </View>
                          <View>
                            <Image
                              style={[styles.menuImage]}
                              source={
                                menu.menuImage
                                  ? {
                                      uri:
                                        "https://storage.googleapis.com/waguwagu_bucket/" +
                                        menu.menuImage,
                                    }
                                  : require("./../assets/menu.png")
                              }
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text>Loading...</Text>
                  )}
                </View>
                <Text style={{ alignSelf: "center" }}>
                  -------------------------------------------------
                </Text>
              </View>
            );
          })
        ) : (
          <View />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#FFFFFF",
  },
  image: {
    height: 150,
    marginTop: 20,
    alignSelf: "center",
    borderRadius: 10,
  },
  textContainer: {
    margin: 15,
    padding: 13,
    color: "#94D35C",
    alignItems: "flex-start",
  },
  textTitle: {
    fontSize: 30,
    marginBottom: 15,
  },
  text: {
    fontSize: 17,
  },
  menuImage: {
    marginLeft: 40,
    width: 70,
    height: 70,
    alignSelf: "flex-end",
    borderRadius: 10,
  },
  menuCategoryContainer: {
    paddingTop: 20,
    paddingRight: 0,
    paddingLeft: 20,
    marginTop: 10,
  },
  menuContainer: {
    padding: 20,
    flexDirection: "row",
  },
  textEllipsis: {
    width: Dimensions.get("window").width / 2,
    overflow: "hidden",
    // ellipsizeMode: "tail",
  },
  reviewButton: {
    padding: 12,
    backgroundColor: "#EECAD5",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    margin: 10,
  },
});
