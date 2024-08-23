import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  AppState,
  Dimensions,
  Platform,
} from "react-native";

import { createPayment } from "../config/PaymentApi";
import {
  getPaymentState,
  requestDdalkakPayment,
} from "../config/DdalkakPaymentApi";
import { UserInformation, createOrderAndReturnUUID } from "../config/orderApi";
import { getStoreDetailQL } from "../config/storeGraphQL";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OrderScreen({ route, navigation }) {
  const { storeDeliveryTime } = route.params;
  const [riderRequest, setRiderRequest] = useState("");
  const [consumerRequest, setConsumerRequest] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showInput1, setShowInput1] = useState(false);
  const [menuName, setMenuName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerLongitude, setCustomerLongitude] = useState("");
  const [customerLatitude, setCustomerLatitude] = useState("");
  const [storeId, setStoreId] = useState("");
  const [cartTotal, setCartTotal] = useState(0);
  const [cart, setCart] = useState({});
  const [error, setError] = useState(false);
  const [paymentButtonText, setPaymentButtonText] = useState("결제하기");
  const [payId, setPayId] = useState(null);
  const [payState, setPayState] = useState(null);

  useEffect(() => {
    if (route.params) {
      setCartTotal(route.params.cartTotal || 0);
      setCart(route.params.cart || {});
      setStoreId(route.params.cart ? route.params.cart.storeId : "");
    } else {
      setError(true);
    }

    const fetchUserInfo = async () => {
      try {
        const userInfo = await UserInformation();
        setCustomerLongitude(userInfo.customerLongitude);
        setCustomerLatitude(userInfo.customerLatitude);
      } catch (error) {
        console.error("Failed to fetch user information:", error);
        Alert.alert(
          "오류",
          "사용자 정보를 가져오지 못했습니다. 네트워크를 확인하고 다시 시도해 주세요."
        );
        setError(true);
      }
    };

    fetchUserInfo();
  }, [route.params]);

  const handleCreateOrder = async () => {
    console.log(payId);
    try {
      const userInfo = await UserInformation();
      const storeInfo = await getStoreDetailQL({
        storeId: cart.storeId,
        input: {
          longitude: userInfo.customerLongitude,
          latitude: userInfo.customerLatitude,
        },
      });
      console.log("Store Info:", storeInfo);

      const userRequest = {
        storeId: cart.storeId,
        storePhone: cart.storePhone,
        storeName: cart.storeName,
        storeAddress: storeInfo.storeAddress,
        customerRequests: consumerRequest,
        riderRequests: riderRequest,
        deliveryFee: storeInfo.deliveryFee,
        distanceFromStoreToCustomer: storeInfo.distanceFromStoreToCustomer,
        storeLongitude: storeInfo.storeLongitude,
        storeLatitude: storeInfo.storeLatitude,
        storeMinimumOrderAmount: cart.storeMinimumOrderAmount,
        customerAddress: userInfo.customerAddress,
        customerNickname: userInfo.customerNickname,
        menuItems: cart.menuItems?.map((item) => ({
          menuName: item.menuName,
          totalPrice: item.totalPrice,
          selectedOptions: item.selectedOptions?.map((optionList) => ({
            listName: optionList.listName,
            options: optionList?.options?.map((option) => ({
              optionTitle: option.optionTitle,
              optionPrice: option.optionPrice,
            })),
          })),
        })),
        orderTotalPrice: cartTotal,
      };

      const savedOrderId = await createOrderAndReturnUUID(userRequest);
      // 결제 내역 생성
      const paymentRequest = { id: payId, orderId: savedOrderId };
      await createPayment(paymentRequest);

      console.log("주문건 값들: " + JSON.stringify(userRequest, null, 2));

      console.log("Order created successfully:", savedOrderId);

      // 주문 생성 후 알림 요청을 보내고 음성 파일 재생
      await notifyAndPlayAudio(storeId);

      Alert.alert("주문 성공", "주문이 성공적으로 생성되었습니다.", [
        {
          text: "확인",
          onPress: () => navigation.navigate("Main"),
        },
      ]);
    } catch (error) {
      console.error("Failed to create order:", error);
      setError(true);
    }
  };

  const handlePayment = async (cartTotal) => {
    // 딸깍 페이 이용
    const requestPaymentDto = {
      payNum: 1000,
      payAmount: cartTotal,
      failRedirUrl: "exp://192.168.45.216:8081",
      successRedirUrl: "exp://192.168.45.216:8081",
    };

    const res = await requestDdalkakPayment(requestPaymentDto);
    console.log(res);
    if (res.data.code === 0) {
      await Linking.openURL(res.data.appLink);
      setPayId(res.data.payId);
    }
  };

  const handlePaymentAndOrder = async () => {
    console.log(Platform.OS);
    if (Platform.OS === "android") {
      if (payState === "PAY_COMPLETE") {
        console.log(payState, "결제 진행");
        await handleCreateOrder();
      } else await handlePayment(cartTotal);
    } else await handleCreateOrder();
  };

  const notifyAndPlayAudio = async (storeId) => {
    try {
      const response = await fetch(
        "http://34.41.123.200/alarm/notify/order-completed",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ store_id: storeId }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const arrayBuffer = await blobToArrayBuffer(blob);
        const base64String = arrayBufferToBase64(arrayBuffer);
        const uri = FileSystem.documentDirectory + "notification.mp3";

        // Save the mp3 file locally
        await FileSystem.writeAsStringAsync(uri, base64String, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Load and play the audio
        const { sound } = await Audio.Sound.createAsync({ uri });
        await sound.playAsync();

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
            FileSystem.deleteAsync(uri);
          }
        });
      } else {
        console.error("Failed to notify:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to fetch and play audio:", error);
    }
  };

  const blobToArrayBuffer = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () =>
        reject(new Error("Failed to read blob as array buffer."));
      reader.readAsArrayBuffer(blob);
    });
  };

  const arrayBufferToBase64 = (arrayBuffer) => {
    let binary = "";
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>텅~</Text>
      </View>
    );
  }

  const savePaymentState = async (e) => {
    if (payId && e.url === "exp://192.168.45.216:8081") {
      console.log(payId, "결제 시");
      const paymentState = await getPaymentState(payId);
      setPayState(paymentState.payState);
      if (paymentState.payState === "PAY_COMPLETE") {
        Linking.removeAllListeners("url");
        console.log(paymentState.payState, "결제 직후");
        setPaymentButtonText("주문 완료");
      }
    }
  };

  // 결제 앱에서 결제 완료 후 돌아올 때 url 을 읽어오는 이벤트 리스너
  Linking.addEventListener("url", savePaymentState);

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.container}
    >
      <View style={styles.deliveryInfo}>
        <Text style={styles.deliveryText}>한집 배달</Text>
        <Text style={styles.deliveryText}>
          {parseInt(storeDeliveryTime * 4 + 10) +
            "~" +
            parseInt(storeDeliveryTime * 4 + 25) +
            "분"}
        </Text>
      </View>

      <Text style={styles.title}>주문하기</Text>
      <View style={[styles.deliveryText, { borderRadius: 15 }, { margin: 15 }]}>
        <Text style={styles.buttonText}>{cart.storeName}</Text>
      </View>

      {cart.menuItems &&
        cart.menuItems.map((item, index) => (
          <View key={index} style={styles.menuItem}>
            <Text style={styles.storeTitleText}>{item.menuName}</Text>
            <Text style={[styles.storeTitleText, { paddingLeft: 15 }]}>
              가격: {item.totalPrice}원
            </Text>
            {item.selectedOptions &&
              item.selectedOptions.map((optionList, optListIndex) => (
                <View key={optListIndex} style={styles.optionList}>
                  {/* <Text style={styles.optionListTitle}>
                    {optionList.listName}
                  </Text> */}
                  {optionList.options &&
                    optionList.options.map((option, optIndex) => (
                      <Text
                        key={optIndex}
                        style={[styles.optionText, { paddingLeft: 40 }]}
                      >
                        옵션: {option.optionTitle} ({option.optionPrice}원)
                      </Text>
                    ))}
                </View>
              ))}
          </View>
        ))}

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowInput1(!showInput1)}
        >
          <Text style={styles.buttonText}>라이더님께 요청 사항 전달</Text>
        </TouchableOpacity>
        {showInput1 && (
          <TextInput
            style={styles.input}
            placeholder="라이더 요청 사항을 입력해주세요"
            value={riderRequest}
            onChangeText={setRiderRequest}
          />
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowInput(!showInput)}
        >
          <Text style={styles.buttonText}>가게 사장님께 요청 사항 전달</Text>
        </TouchableOpacity>
        {showInput && (
          <TextInput
            style={styles.input}
            placeholder="가게 사장님께 요청 사항을 입력해주세요"
            value={consumerRequest}
            onChangeText={setConsumerRequest}
          />
        )}

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>결제수단</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>할인 쿠폰</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>선물함</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>포인트</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.paymentText}>결제금액</Text>
        <Text style={styles.cartDetail}>총 가격: {cartTotal}원</Text>
      </View>

      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.button, { marginBottom: 40 }]}
          onPress={handlePaymentAndOrder}
        >
          <Text style={styles.buttonText}>{paymentButtonText}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    display: "flex",
    alignSelf: "center",
    alignContent: "center",
    paddingLeft: 15,
    borderWidth: 3,
    borderRadius: 10,
    borderColor: "#F1D3CE",
    width: Dimensions.get("window").width - 50,
    margin: 10,
    padding: 5,
  },
  storeTitleText: {
    fontSize: 20,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  deliveryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  deliveryText: {
    fontSize: 16,
    backgroundColor: "#F1D3CE",
    padding: 10,
    borderRadius: 20,
  },
  section: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#EECAD5",
    padding: 15,
    borderRadius: 25,
    marginVertical: 5,
  },
  buttonText: {
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    fontSize: 16,
  },
  paymentSection: {
    backgroundColor: "#F1D3CE",
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  paymentText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 10,
  },
  errorText: {
    fontSize: 24,
    color: "#ff0000",
    textAlign: "center",
  },
});
