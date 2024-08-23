import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default StoreListSpeechBubble = (props) => {
  return (
    <View
      style={[
        styles.container,
        { width: props.width },
        { backgroundColor: "#FFFFFF" },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image
          style={[styles.image, { resizeMode: "contain" }]}
          source={
            props.image
              ? {
                  uri:
                    "https://storage.googleapis.com/waguwagu_bucket/" +
                    props.image,
                }
              : require("../assets/food-icon.png")
          }
        />
      </View>
      <View style={styles.textContainer}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.textTitle}>
          {props.title}
        </Text>
        <Text style={styles.text}>{props.time}</Text>
        <Text style={styles.text}>{props.storeMinimumOrderAmount}</Text>
        <Text style={styles.text}>{props.fee}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 15,
    padding: 13,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    height: 150,
    color: "#94D35C",
    backgroundColor: "#FFFFFF",
    alignItems: "flex-end",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 3,
    borderColor: "#dcdcdc",
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  textTitle: {
    fontSize: 25,
    paddingBottom: 15,
    fontFamily: "Regular",
  },
  text: {
    fontSize: 17,
    fontFamily: "런드리고딕OTF Regular",
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
