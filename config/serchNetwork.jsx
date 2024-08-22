import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const serchApi = async (url, method, body, params) => {
  const response = await axios({
    url,
    method,
    // baseURL: "http://192.168.0.20:8080", // baseURL
    baseURL: "http://34.44.29.146",
    data: body,
    params: params,
    headers: {
      Authorization: `Bearer ${await AsyncStorage.getItem("access_token")}`,
    },
  });

  return response;
};
