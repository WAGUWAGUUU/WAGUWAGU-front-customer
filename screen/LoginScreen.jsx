import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const navigation = useNavigation(); // useNavigation 훅을 컴포넌트 최상위에서 호출

  const handleLogin = () => {
    // 로그인 성공 시 KaKaoLogin 화면으로 이동
    navigation.navigate("KaKaoLoginScreen");
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/food-icon.png")}
          style={styles.iconImage}
        />
        <Image
          source={require("../assets/waguwagu6.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>배달 주문 어플</Text>
        <TouchableOpacity onPress={handleLogin}>
          <Image source={require("../assets/kakao_login_medium_wide.png")} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconImage: {
    width: 95,
    height: 95,
  },
  logoImage: {
    width: 300,
  },
  logoText: {
    color: "#4C241D",
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  },
  image: {
    width: 200,
    height: 50,
  },
});

export default LoginScreen;
