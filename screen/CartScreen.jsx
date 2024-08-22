import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { Image } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartScreen = ({ route, navigation }) => {
  // const { storeName } = route.params;
  const [storeName, setStoreName] = useState("");
  const [cart, setCart] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCartItems = async () => {
    const userId = await AsyncStorage.getItem("customerId");
    try {
      const response = await axios.get(
        `http://34.27.212.162/api/v1/cart/${userId}`
      );
      const fetchedCart = response.data;
      setCart(fetchedCart);
      setStoreName(response.data.storeName);
      console.log("cartcartcartcartcartresponse data", response.data.storeName);
      //       a
      // Ensure menuItems is defined and is an array
      if (fetchedCart.menuItems && Array.isArray(fetchedCart.menuItems)) {
        calculateCartTotal(fetchedCart.menuItems); // Update cart total after fetching data
      } else {
        setCartTotal(0); // Set total to 0 if menuItems is not available
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
      // Handle error and provide feedback to the user if needed
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart total based on menu items and their options
  const calculateCartTotal = (menuItems) => {
    if (!menuItems || menuItems.length === 0) {
      setCartTotal(0);
      return;
    }

    // Sum the totalPrice of each menu item
    const total = menuItems.reduce((acc, menu) => {
      return acc + (menu.totalPrice || 0); // Use 0 as fallback if totalPrice is undefined
    }, 0);

    // Update the cartTotal state
    setCartTotal(total);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Delete a menu item and update the cart
  const deleteMenuItem = async (index) => {
    if (!cart || !cart.menuItems) return; // Safeguard for empty cart

    const updatedMenuItems = cart.menuItems.filter((_, i) => i !== index);
    const updatedCart = { ...cart, menuItems: updatedMenuItems };

    // Optimistically update the cart state
    setCart(updatedCart);

    try {
      // Send the updated cart to the server
      await axios.post("http://34.27.212.162/api/v1/cart/save", updatedCart, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Cart updated successfully", updatedCart);
    } catch (error) {
      console.error("Error updating cart:", error);
      // Revert the cart state if the server request fails
      setCart((prevCart) => ({
        ...prevCart,
        menuItems: cart.menuItems,
      }));
    }

    // Recalculate the total price after deletion
    calculateCartTotal(updatedMenuItems);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!cart || !cart.menuItems || cart.menuItems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No items in the cart</Text>
      </View>
    );
  }

  const handleCheckout = () => {
    navigation.navigate("OrderScreen", {
      cartTotal,
      cart: cart,
    });
    console.log("checkout button log", JSON.stringify(cart));
  };

  const renderItem = ({ item }) =>
    item.map((it) => (
      <View style={styles.itemContainer} key={it.optionId}>
        <Text style={styles.itemTitle}>{it.optionTitle}</Text>
        <Text style={styles.itemPrice}>Price: {it.optionPrice}원</Text>
      </View>
    ));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.scrollViewCon}>
        <ScrollView>
          <Pressable
            style={styles.storeContainer}
            onPress={() => navigation.navigate("Store")}
          >
            <Text style={styles.storeName}>{storeName}</Text>
          </Pressable>
          <Text style={styles.totalPrice}>총 가격: {cartTotal}원</Text>
          {cart.menuItems.map((menu, index) => (
            <View
              style={styles.cartDetailsContainer}
              key={`${menu.menuId}-${index}`}
            >
              <View style={{ flexDirection: "row" }}>
                <Text style={styles.menuName}>
                  {menu.menuName} = {menu.totalPrice}원
                </Text>
                <Pressable onPress={() => deleteMenuItem(index)}>
                  <Image
                    source={require("../assets/icons/trash-can.png")}
                    resizeMode="contain"
                    style={styles.trash}
                  />
                </Pressable>
              </View>
              {menu.selectedOptions && menu.selectedOptions.length > 0 ? (
                menu.selectedOptions
                  .filter((list) => list.options && list.options.length > 0)
                  .map((list) => (
                    <View key={list.listId} style={styles.listContainer}>
                      <Text style={styles.listName}>{list.listName}</Text>
                      {renderItem({ item: list.options })}
                    </View>
                  ))
              ) : (
                <View></View>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
      <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
        <Text style={styles.checkoutButtonText}>주문하기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewCon: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F7F7F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 10,
    color: "#333",
  },
  cartDetailsContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
    textAlign: "center",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#FF3B30",
  },
  listContainer: {
    marginBottom: 20,
  },
  listName: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: "#000",
  },
  itemContainer: {
    marginBottom: 10,
    padding: 16,
    backgroundColor: "#E2EBDE",
    borderRadius: 10,
    borderColor: "#E0E0E0",
    borderWidth: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  itemPrice: {
    fontSize: 16,
    color: "#FF9500",
    marginVertical: 5,
  },
  storeContainer: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
  trash: {
    width: 24,
    height: 24,
    tintColor: "#94D35C",
  },
  checkoutButton: {
    backgroundColor: "#EECAD5",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    margin: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  checkoutButtonText: {
    fontSize: 18,
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default CartScreen;
