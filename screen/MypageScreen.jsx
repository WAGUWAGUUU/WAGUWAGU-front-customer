import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SpeechBubble from "../components-common/SpeechBubble";
import { getInfo, updateInfo } from "../api/authApi";
import axios from "axios";

const KAKAO_API_KEY = "f8609808f0ad80f284bc679eb3d80315";

const MyPage = ({ navigation }) => {
  const [modify, setModify] = useState(false);
  const [customerNickname, setCustomerNickname] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerLatitude, setCustomerLatitude] = useState(0.0);
  const [customerLongitude, setCustomerLongitude] = useState(0.0);

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

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        const res = await getInfo();
        if (res.status === 200) {
          const { customerEmail, customerNickname, customerAddress, customerPhone } = res.data;
          if (customerNickname) setCustomerNickname(customerNickname);
          if (customerEmail) setCustomerEmail(customerEmail);
          if (customerAddress) setCustomerAddress(customerAddress);
          if (customerPhone) setCustomerPhone(customerPhone);
        }
      } catch (error) {
        console.log("사용자 정보 불러오는 중 에러", error);
        Alert.alert("Error", "사용자 정보를 불러오는 중 에러가 발생했습니다.");
      }
    };
    fetchCustomerInfo();
  }, []);

  const handleModify = async () => {
    if (modify) {
      try {
        await AsyncStorage.setItem("customerNickname", customerNickname);
        await AsyncStorage.setItem("customerAddress", customerEmail);
        try {
          const res = await updateInfo({
            customerNickname,
            customerAddress,
            customerLatitude,
            customerLongitude,
          });
          if (res.status === 200) {
            Alert.alert("정보 수정 성공", "정보 수정이 완료되었습니다!");
            // navigation.replace('Main');
          } else {
            Alert.alert(
              "정보 수정 실패",
              "정보 수정에 실패했습니다. 다시 시도해주세요."
            );
          }
        } catch (error) {
          console.log("정보 수정 중 에러", error);
          Alert.alert("Error", "정보 수정 중 에러가 발생했습니다.");
        }
      } catch (error) {
        console.error("Failed to save user data:", error);
      }
      setModify(false); // Exit edit mode
    } else {
      setModify(true); // Enter edit mode
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.profile}>
          <Image
            source={require("../assets/Vector.png")}
            style={styles.profileImage}
            resizeMode="cover" // Adjust this as needed
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.greeting}>먹짱! </Text>
            <Text style={styles.greetingName}>{customerNickname}</Text>
          </View>
        </View>
        <View style={styles.infoBox}>
          {modify ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>닉네임</Text>
                <TextInput
                  style={styles.input}
                  value={customerNickname}
                  onChangeText={setCustomerNickname}
                  textAlign="right" // Align text to the right
                />
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>주소</Text>
                <TextInput
                  style={styles.input}
                  value={customerAddress}
                  onChangeText={setCustomerAddress}
                  textAlign="right" // Align text to the right
                />
              </View>
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
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>이메일</Text>
                <Text style={styles.value}>{customerEmail}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>전화번호</Text>
                <Text style={styles.value}>{customerPhone}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.infoRow}>
                <Text style={styles.label}>주소</Text>
                <Text style={styles.value}>{customerAddress}</Text>
              </View>
            </>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleModify}>
            <SpeechBubble
              content={modify ? "저장하기" : "수정하기"}
              backgroundColor="#ffffff"
              textColor="black"
              height={50}
              width="100%"
            />
          </TouchableOpacity>
        </View>
        {/* <View style={styles.buttonContainer}>
          <TouchableOpacity>
            <SpeechBubble
              content="찜한 가게 보기"
              backgroundColor="#ffffff"
              textColor="black"
              height={50}
              width="100%"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity>
            <SpeechBubble
              content="쿠폰 보기"
              backgroundColor="#ffffff"
              textColor="black"
              height={50}
              width="100%"
            />
          </TouchableOpacity>
        </View> */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => navigation.navigate("내리뷰")}>
            <SpeechBubble
              content="내가 쓴 리뷰 보기"
              backgroundColor="#ffffff"
              textColor="black"
              height={50}
              width="100%"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity>
            <SpeechBubble
              content="로그아웃"
              backgroundColor="#ffffff"
              textColor="black"
              height={50}
              width="100%"
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  profile: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40, // Half of the width/height
    marginBottom: 10,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#E5595980",
  },
  greetingName: {
    fontSize: 28,
    fontWeight: "bold",
  },
  infoBox: {
    width: "100%",
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#EECAD5",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    paddingRight: 10,
  },
  value: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
    borderColor: "#ddd",
    borderBottomWidth: 1,
  },
  separator: {
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: "black",
    marginVertical: 5,
  },
  buttonContainer: {
    width: "100%", // Ensure the container takes full width
    marginBottom: 10,
  },
});

export default MyPage;
