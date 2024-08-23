import { LogBox } from 'react-native';

LogBox.ignoreAllLogs(); // 모든 로그 무시

import { NavigationContainer } from "@react-navigation/native";

import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
// import { AppRegistry } from "react-native";


import { name as appName } from "./app.json";
import { Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { RecoilRoot } from "recoil";
import SearchScreen from "./screen/SearchScreen";
import OrderHistoryScreen from "./screen/OrderHistoryScreen";
import MypageScreen from "./screen/MypageScreen";
import HomeScreen from "./screen/HomeScreen";
import LoginScreen from "./screen/LoginScreen";
import SignupScreen from "./screen/SignupScreen";
import StoreScreen from "./screen/StoreScreen";
import StoreListScreen from "./screen/StoreListScreen";
import OrderScreen from "./screen/OrderScreen";
import CartScreen from "./screen/CartScreen";
import MenuDetailScreen from "./screen/MenuDetailScreen";
import KaKaoLoginScreen from "./screen/KaKaoLoginScreen";
import RiderRealTimeLocationScreen from "./screen/RiderRealTimeLocationScreen";
import ReviewForm from "./screen/ReviewForm";
import ReviewSectionScreen from "./screen/ReviewSectionScreen";
import MyReviewScreen from "./screen/MyReviewScreen";

import OrderDetailScreen from "./screen/OrderDetailScreen";
import Toast from "react-native-toast-message";
// import messaging from "@react-native-firebase/messaging";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { registerRootComponent } from "expo";
// // import RemoteConfig from "@react-native-firebase/remote-config";
// import { initializeApp } from "@react-native-firebase/app";
// initializeApp();

export default function App() {
  const BottomTab = createMaterialBottomTabNavigator();
  const Stack = createStackNavigator();

  ////

  // const saveUserToken = async () => {
  //   const userId = await AsyncStorage.getItem("customerId");
  //   if (!userId) return;
  //   console.log(userId);
  //   if (Platform.OS === "android") {
  //     const reqBody = {
  //       userId: userId,
  //       fcmToken: FcmToken,
  //     };
  //     try {
  //       await axios.post(
  //         "http://192.168.0.26:8080/api/v1/FcmTokens/save",
  //         reqBody,
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //     } catch (error) {
  //       console.error("Error saving FCM user token", error);
  //     }
  //   } else {
  //     console.log("iOS users do not receive FCM tokens.");
  //   }
  // };

  // const getFcmToken = async () => {
  //   try {
  //     if (Platform.OS === "android") {
  //       // Only get FCM token for Android
  //       const fcmToken = await messaging().getToken();
  //       setFcmToken(fcmToken);
  //       console.log("[+] FCM Token :: ", fcmToken);
  //     } else {
  //       console.log("[+] Skipping FCM token generation for iOS");
  //     }
  //   } catch (error) {
  //     console.error("Error getting FCM token:", error);
  //   }
  // };

  // const subscribe = () => {
  //   messaging().onMessage(async (remoteMessage) => {
  //     console.log("[+] Remote Message ", JSON.stringify(remoteMessage));
  //   });
  // };

  // useEffect(() => {
  //   getFcmToken();
  //   saveUserToken();
  //   subscribe();
  // }, [FcmToken]);

  //
  const BottomView = () => {
    return (
      <View style={{ flex: 1 }}>
        <BottomTab.Navigator
          initialRouteName="Home"
          activeColor="#f0edf6"
          barStyle={{ backgroundColor: "#EECAD5" }}
        >
          <BottomTab.Screen
            name="홈"
            component={HomeScreen}
            options={{
              tabBarLabel: "홈",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="home" color={color} size={20} />
              ),
            }}
          />
          <BottomTab.Screen
            name="검색"
            component={SearchScreen}
            options={{
              tabBarLabel: "검색",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="file-search-outline"
                  color={color}
                  size={20}
                />
              ),
            }}
          />

          <BottomTab.Screen
            name="주문내역"
            component={OrderHistoryScreen}
            options={{
              tabBarLabel: "주문내역",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="text-box-outline"
                  color={color}
                  size={20}
                />
              ),
            }}
          />
          <BottomTab.Screen
            name="장바구니"
            component={CartScreen}
            options={{
              tabBarLabel: "장바구니 ",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cart" color={color} size={20} />
              ),
            }}
          />

          {/* <BottomTab.Screen
            name="내리뷰"
            component={MyReviewScreen}
            options={{
              tabBarLabel: "내 리뷰 ",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="pencil-outline"
                  color={color}
                  size={20}
                />
              ),
            }}
          /> */}

          <BottomTab.Screen
            name="마이페이지"
            component={MypageScreen}
            options={{
              tabBarLabel: "마이페이지",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="account-circle"
                  color={color}
                  size={20}
                />
              ),
            }}
          />

          {/* <BottomTab.Screen
            name="메뉴"
            component={MenuDetailScreen}
            options={{
              tabBarLabel: "메뉴 상세",
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="account-circle"
                  color={color}
                  size={20}
                />
              ),
            }}
          /> */}
        </BottomTab.Navigator>
      </View>
    );
  };

  return (
    <RecoilRoot>
      <NavigationContainer>
        <Toast />
        <View style={styles.container}></View>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerMode: "screen",
            headerTintColor: "white",
            headerStyle: { backgroundColor: "#F1D3CE" },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OrderScreen"
            component={OrderScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OrderDetailScreen"
            component={OrderDetailScreen}
            options={{
              headerTitle: "주문 상세",
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen name="MypageScreen" component={MypageScreen} />
          <Stack.Screen
            name="OrderHistoryScreen"
            component={OrderHistoryScreen}
          />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen
            name="StoreList"
            component={StoreListScreen}
            options={{
              title: "",
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerTintColor: "#000",
            }}
          />
          <Stack.Screen
            name="Main"
            component={BottomView}
            options={{ headerShown: false, title: "" }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Mypage"
            component={MypageScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="KaKaoLoginScreen" // 여기에서 KaKaoLoginScreen을 추가합니다.
            component={KaKaoLoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignupScreen"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Store"
            component={StoreScreen}
            options={{
              title: "",
              headerTransparent: true,
              headerBackTitleVisible: false,
              headerTintColor: "#000",
            }}
          />
          <Stack.Screen
            name="CartScreen"
            component={CartScreen}
            options={{
              title: "장바구니",
              headerTintColor: "#000",
              headerBackTitleVisible: false,
              // headerTransparent: true,
            }}
          />
          <Stack.Screen
            name="MenuDetailScreen"
            component={MenuDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ReviewScreen"
            component={ReviewForm}
            options={{
              headerTitle: "리뷰",
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="내리뷰"
            component={MyReviewScreen}
            options={{
              headerTitle: "MY 리뷰",
              headerBackTitleVisible: false,
            }}
          />

          <Stack.Screen name="ReviewSection" component={ReviewSectionScreen} />
          <Stack.Screen
            name="RiderRealTimeLocationScreen"
            component={RiderRealTimeLocationScreen}
            options={{
              headerTitle: "라이더 실시간 위치",
              headerTitleAlign: "center",
              headerStyle: {
                backgroundColor: "#94D35C",
                // height: 40,
              },
              // headerTitleStyle: {
              //   fontSize: 25,
              // },
            }}
            // options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </RecoilRoot>
  );
}
// registerRootComponent(App);

const styles = StyleSheet.create({
  container: {
    flex: 0.02,
    padding: 16,
    backgroundColor: "#F1D3CE",
    alignItems: "center",
    justifyContent: "center",
  },
});
