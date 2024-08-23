import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import SpeechBubble from "../components-common/SpeechBubble";
import { getInfo, updateInfo } from "../api/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const KAKAO_API_KEY = "f8609808f0ad80f284bc679eb3d80315";

const SignupScreen = ({ navigation }) => {
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerNickname, setCustomerNickname] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerLatitude, setCustomerLatitude] = useState(0.0);
  const [customerLongitude, setCustomerLongitude] = useState(0.0);
  const [websocket, setWebSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        const res = await getInfo();
        if (res.status === 200) {
          const {
            customerEmail,
            customerNickname,
            customerAddress,
            customerLatitude,
            customerLongitude,
            customerId,
            token,
          } = res.data;

          if (customerAddress === null) {
            setCustomerEmail(customerEmail);
            setCustomerNickname(customerNickname);
          } else {
            navigation.replace("Main");

            // Save customer data to AsyncStorage
            if (customerId) {
              await AsyncStorage.setItem("customerId", JSON.stringify(customerId));
            }
            if (customerNickname) {
              await AsyncStorage.setItem("customerNickname", customerNickname);
            }
            if (customerEmail) {
              await AsyncStorage.setItem("customerEmail", customerEmail);
            }
            if (customerAddress) {
              await AsyncStorage.setItem("customerAddress", customerAddress);
            }
            if (customerLatitude) {
              await AsyncStorage.setItem("customerLatitude", JSON.stringify(customerLatitude));
            }
            if (customerLongitude) {
              await AsyncStorage.setItem("customerLongitude", JSON.stringify(customerLongitude));
            }

            // WebSocket 연결 설정
            const storedCustomerId = await AsyncStorage.getItem("customerId");
            connectWebSocket(storedCustomerId);
          }
        }
      } catch (error) {
        console.log("사용자 정보 불러오는 중 에러", error);
        Alert.alert("Error", "사용자 정보를 불러오는 중 에러가 발생했습니다.");
      }
    };

    fetchCustomerInfo();

    // Clean up WebSocket on component unmount
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);


  const connectWebSocket = (customerId) => {
    let reconnectInterval = 5000; // 5초 후 재연결 시도
    try {
      const ws = new WebSocket(
        `ws://34.41.123.200/alarm/ws/customer/${customerId}`
      );

      ws.onopen = () => {
        console.log("WebSocket 연결되었습니다");
        reconnectInterval = 5000; // 연결에 성공하면 재연결 시도를 초기화
      };

      ws.onmessage = (event) => {
        console.log("Message from server:", event.data);
        setMessages((prevMessages) => [...prevMessages, event.data]);
      };

      ws.onclose = () => {
        console.log("WebSocket 연결 해제되었습니다");
        setTimeout(connectWebSocket, reconnectInterval);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close(); // 오류가 발생하면 연결을 종료하고 재시도
      };

      setWebSocket(ws);
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      setTimeout(connectWebSocket, reconnectInterval);
    }
  };

  const handleAddressChange = async () => {
    if (!customerAddress.trim()) {
      Alert.alert("주소 오류", "주소를 입력해주세요.");
      return;
    }

    try {
      const response = await axios.get(
        `https://dapi.kakao.com/v2/local/search/address.json`,
        {
          params: {
            query: customerAddress,
          },
          headers: {
            Authorization: `KakaoAK ${KAKAO_API_KEY}`, // API 키를 헤더에 포함
          },
        }
      );

      const { documents } = response.data;
      if (documents.length > 0) {
        const { x, y } = documents[0].address; // 카카오는 x(경도), y(위도)를 반환합니다.
        setCustomerLatitude(parseFloat(y));
        setCustomerLongitude(parseFloat(x));
        Alert.alert("주소 찾기 성공", "주소를 찾았습니다.");
      } else {
        Alert.alert("주소 찾기 실패", "주소를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("주소를 변환하는 중 오류가 발생했습니다:", error);
      Alert.alert("Error", "주소를 변환하는 중 오류가 발생했습니다.");
    }
  };

  const handleSignup = async () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\d{11}$/;

    if (!emailPattern.test(customerEmail)) {
      Alert.alert("유효하지 않은 이메일", "올바른 이메일 형식이 아닙니다!");
      return;
    }
    if (!customerEmail || !customerNickname || !customerPhone || !customerAddress) {
      Alert.alert("빈 칸 오류", "빈 칸 없이 모두 입력해주세요!");
      return;
    }
    if (!phonePattern.test(customerPhone)) {
      Alert.alert("유효하지 않은 전화번호", "전화번호는 11자리 숫자로 입력해주세요!");
      return;
    }

    try {
      const res = await updateInfo({ customerNickname, customerAddress, customerLatitude, customerLongitude, customerPhone });
      if (res.status === 200) {
        Alert.alert('회원가입 성공', '회원가입이 완료되었습니다!');
        navigation.replace('Main');

        // Store customerId and connect WebSocket
        const storedCustomerId = await AsyncStorage.getItem('customerId');
        if (storedCustomerId) {
          connectWebSocket(storedCustomerId);
        }
      } else {
        Alert.alert('회원가입 실패', '회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.log("회원가입 중 에러", error);
      Alert.alert('Error', '회원가입 중 에러가 발생했습니다.');
    }
  };

  return (
    <View style={{ backgroundColor: "#fff" }}>
      <View style={styles.container}>
        <Image
          source={require("../assets/food-icon.png")} // 첫 번째 이미지 경로
          style={styles.iconImage}
        />
        <Image
          source={require("../assets/waguwagu6.png")} // 두 번째 이미지 경로
          style={styles.logoImage}
          resizeMode="contain" // 이미지가 버튼에 맞게 조정되도록 설정
        />
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>이메일</Text>
        <TextInput
          style={[styles.input, customerEmail && styles.disabledInput]}
          placeholder="Email"
          value={customerEmail}
          onChangeText={setCustomerEmail}
          editable={false}
        />
        <Text style={styles.infoText}>닉네임</Text>
        <TextInput
          style={styles.input}
          placeholder="Nickname"
          value={customerNickname}
          onChangeText={setCustomerNickname}
        />
        <Text style={styles.infoText}>전화번호</Text>
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="numeric" // 숫자 입력 전용
        />
        <Text style={styles.infoText}>배달주소</Text>
        <View style={styles.addressContainer}>
          <TextInput
            style={styles.addressInput}
            placeholder="Address"
            value={customerAddress}
            onChangeText={setCustomerAddress} // 주소가 변경될 때만 상태 업데이트
          />
          <TouchableOpacity
            onPress={handleAddressChange}
            style={styles.addressButton}
          >
            <SpeechBubble
              content="주소 확인"
              backgroundColor="#EECAD5"
              textColor="#634F4F"
              height={50}
              width="100%"
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSignup}>
          <SpeechBubble
            content="가입 완료"
            backgroundColor="#ffffff"
            textColor="#634F4F"
            onPress={() => console.log("가입완료 Pressed")}
            height={50}
            width="100%"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    backgroundColor: "#fff",
  },
  iconImage: {
    width: 60,
    height: 60,
    marginRight: 20,
  },
  logoImage: {
    width: 250, // 두 번째 이미지의 너비
  },
  infoBox: {
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  infoText: {
    fontSize: 20,
    color: "#4C241D",
    marginBottom: 10,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  addressInput: {
    flex: 7, // 주소 입력 필드가 7 비율을 차지
    height: 40,
    borderColor: "#634F4F",
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  addressButton: {
    flex: 3, // 주소 확인 버튼이 3 비율을 차지
    marginLeft: 10,
  },
  input: {
    width: "100%", // 가로 길이를 화면의 100%로 설정
    height: 40, // 높이를 40으로 설정
    borderColor: "#634F4F", // 테두리 색상
    borderWidth: 1, // 테두리 두께
    borderRadius: 25, // 모서리를 둥글게 설정
    paddingHorizontal: 16, // 좌우 패딩
    fontSize: 16, // 텍스트 크기
    backgroundColor: "#FFFFFF", // 배경색
    marginBottom: 20,
  },
  disabledInput: {
    backgroundColor: "#e0e0e0", // 비활성화된 상태에서의 배경색
  },
});

export default SignupScreen;
