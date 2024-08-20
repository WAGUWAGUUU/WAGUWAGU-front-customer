import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import OptionList from "../components/OptionList.jsx";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMenuByIdQL } from "../config/storeGraphQL.jsx";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

const MenuDetailScreen = ({ navigation, route }) => {
  const { menuId, storeId, storeName } = route.params;
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [menuDetails, setMenuDetails] = useState(null);
  const [optionLists, setOptionLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchMenuDetails = async () => {
    try {
      const response = await getMenuByIdQL({ menuId: menuId });
      console.log("menuid :", menuId);
      setMenuDetails(response);
      setTotalPrice(response.menuPrice);
    } catch (error) {
      console.error("Error fetching menu details:", error.message);
    }
  };

  const fetchOptionList = async () => {
    const GET_OPTION_LISTS = `
    query optionLists($menuId: Long!) {
      optionLists(menuId: $menuId) {
        listName
        options {
        optionId
          optionTitle
          optionPrice
        }
      }
    }
  `;
    try {
      const response = await axios.post(
        `http://34.69.39.99/api/v1/store/graphql`,
        {
          query: GET_OPTION_LISTS,
          variables: { menuId },
        }
      );

      const data = response.data.data.optionLists;

      setOptionLists(data);
      setSelectedOptions(data);
      console.log("selected", selectedOptions);
    } catch (error) {
      console.error("Error fetching option lists:", error.message);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      fetchMenuDetails();
      fetchOptionList();

      setLoading(false);
    };

    fetchData();
  }, [menuId]);

  const defaultSelectedOptions = () => {
    return selectedOptions || optionLists;
  };

  const handleOptionChange = (list, checkedOption) => {
    const newselectedOptions = defaultSelectedOptions().map((l) =>
      l.listId === list.listId
        ? {
            ...l,
            options: l.options.map((o) =>
              o.optionId === checkedOption.optionId
                ? { ...o, isChecked: !o.isChecked }
                : o
            ),
          }
        : l
    );
    setSelectedOptions(newselectedOptions);
    calculateTotalPrice(newselectedOptions);
    console.log("option selected", list, checkedOption);
  };
  console.log(JSON.stringify(selectedOptions));

  const fetchCartItems = async () => {
    const userId = await AsyncStorage.getItem("customerId");

    try {
      const response = await axios.get(
        `http://35.184.212.63/api/v1/cart/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching cart items:", error);
      return null;
    }
  };
  const handleAddToCart = async () => {
    try {
      const userId = await AsyncStorage.getItem("customerId");

      const cartData = await fetchCartItems();

      if (cartData) {
        const existingStoreId = cartData.storeId;

        if (existingStoreId && existingStoreId !== storeId) {
          Alert.alert("오류", "같은 가게의 상품만 담을 수 있습니다", [
            { text: "OK" },
          ]);
          return;
        }

        // Prepare the new menu item to be added
        const newMenuItem = {
          menuId: menuDetails.menuId,
          menuName: menuDetails.menuName,
          totalPrice: totalPrice,
          selectedOptions: selectedOptions.map((list) => ({
            listId: list.listId,
            listName: list.listName,
            options: list.options.filter((op) => op.isChecked),
          })),
        };

        // Append new menu item to existing items or create a new array
        const menuItems = [...(cartData.menuItems || []), newMenuItem];

        // Prepare the cart object
        const cartItem = {
          storeName: storeName,
          storeId: storeId,
          userId,
          totalPrice: totalPrice,
          menuItems,
        };

        // Attempt to save the cart item
        await axios.post("http://35.184.212.63/api/v1/cart/save", cartItem, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        navigation.navigate("CartScreen", {
          menuId: menuDetails.menuId,
          menuName: menuDetails.menuName,
          storeName: storeName,
          storeId: storeId,
          totalPrice: totalPrice,
        });
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        Alert.alert("Error", "한 가게의 상품만 담을 수 있습니다");
      } else {
        console.error("Error adding to cart:", error.message);
      }
    }
  };
  const renderFoodInfo = () => (
    <View>
      {menuDetails ? (
        <>
          <View>
            <Text style={styles.menuName}>{menuDetails.menuName}</Text>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={
                menuDetails.menuImage
                  ? {
                      uri:
                        "https://storage.googleapis.com/wgwg_bucket/" +
                        menuDetails.menuImage,
                    }
                  : require("./../assets/menu.png")
              }
              resizeMode="cover"
              style={styles.image}
            />
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.menuIntroduction}>
              {menuDetails.menuIntroduction}
            </Text>
            <Text style={styles.menuPrice}>{menuDetails.menuPrice}원</Text>
          </View>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );

  //sss

  const calculateTotalPrice = (selectedOptions = selectedOptions) => {
    const totalPrice = selectedOptions.reduce(
      (sum, list) =>
        sum +
        list.options.reduce(
          (t, op) => t + (op.isChecked ? op.optionPrice : 0),
          0
        ),
      menuDetails.menuPrice
    );
    setTotalPrice(totalPrice);
    console.log({ totalPrice });
    return totalPrice;
  };

  const renderOptionLists = () => (
    <View>
      {selectedOptions && selectedOptions.length > 0 ? (
        selectedOptions.map((list) => (
          <OptionList
            key={list.listId}
            optionList={list}
            selectedOptions={selectedOptions}
            // onOptionChange={(updatedOptions) =>
            //   handleOptionChange(updatedOptions, list.listId)
            // }
            onOptionChange={handleOptionChange}
          />
        ))
      ) : (
        <Text></Text>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require("../assets/icons/back.png")}
          resizeMode="contain"
          style={styles.backIcon}
        />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>상세 메뉴</Text>
      </View>
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() =>
          navigation.navigate("CartScreen", {
            menuId: menuDetails.menuId,
            menuName: menuDetails.menuName,
            storeName: storeName,
          })
        }
      >
        <Image
          source={require("../assets/icons/shopping-basket.png")}
          resizeMode="contain"
          style={styles.cartIcon}
        />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={"#FF3B30"} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <FlatList
        ListHeaderComponent={() => (
          <>
            {renderFoodInfo()}
            {renderOptionLists()}
            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPriceText}></Text>
            </View>
          </>
        )}
      />
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={handleAddToCart}
      >
        <Text style={styles.addToCartButtonText}>
          {" "}
          {totalPrice}원 장바구니에 담기
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 10 * 2,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 50,
    justifyContent: "center",
  },
  backIcon: {
    width: 30,
    height: 30,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cartButton: {
    width: 50,
    justifyContent: "center",
  },
  cartIcon: {
    width: 30,
    height: 30,
  },
  menuName: {
    marginVertical: 10,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
  },
  imageContainer: {
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 15,
    paddingHorizontal: 16,
  },
  menuIntroduction: {
    marginVertical: 10,
    textAlign: "center",
    fontSize: 18,
  },
  menuPrice: {
    fontSize: 16,
  },
  addToCartButton: {
    backgroundColor: "#EECAD5",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    margin: 30,
  },
  addToCartButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
  },

  menuName: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
    marginVertical: 30,
  },
  imageContainer: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 30,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: 200,
  },
  detailsContainer: {
    paddingHorizontal: 30,
    alignItems: "center",
  },
  menuIntroduction: {
    fontSize: 20,
    color: "#3A3737",
    textAlign: "center",
    marginBottom: 30,
  },
  menuPrice: {
    fontSize: 22,
    color: "#FF3B30",
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingText: {
    fontSize: 30,
    color: "#898C95",
    textAlign: "center",
    marginTop: 30,
  },
});

export default MenuDetailScreen;
