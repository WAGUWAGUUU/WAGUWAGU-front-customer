// orderNetwork.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const orderApi = async (url, method, body, params) => {
  const res = await axios({
    url,
    method,
    // baseURL: "http://35.223.83.225:8080", // baseURL
    baseURL: "http://35.223.83.225",
    data: body,
    params: params,
    headers: {
      Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
    },
  });

  return res;
};
