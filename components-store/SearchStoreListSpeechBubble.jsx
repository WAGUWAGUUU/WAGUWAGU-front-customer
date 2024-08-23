import React from "react";
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";

export default function SearchStoreListSpeechBubble(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View
        style={[
          styles.container,
          { width: props.width },
          { backgroundColor: props.backgroundColor || "#FFFFFF" },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={
              props.image
              ? {
                  uri:
                    "https://storage.googleapis.com/waguwagu_bucket/" +
                    props.image,
                }
              : require("./../assets/food-icon.png")
            }
          />
        </View>
        <View style={styles.textContainer}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.textTitle}>
            {props.title}
          </Text>
          <Text style={styles.text}>{props.time}</Text>
          <Text style={styles.text}>
            최소주문액: {props.storeMinimumOrderAmount}원
          </Text>
          <Text style={styles.text}>배달비: {props.fee}원</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 15,
    padding: 13,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    height: 150,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 3,
    borderColor: "#dcdcdc",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 10,
  },
  textTitle: {
    fontSize: 20,
    fontWeight: "bold",
    paddingBottom: 10,
  },
  text: {
    fontSize: 16,
  },
  image: {
    width: 50,
    height: 50,
    padding: 50,
    marginRight: 10,
    alignSelf: "flex-start",
    borderRadius: 10,
  },
  imageContainer: {
    justifyContent: "center",
  },
});
