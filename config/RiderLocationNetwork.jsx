import axios from "axios";
export const riderLocationApi = async (url, method, body, params) => {
  const res = await axios({
    url,
    method,
    baseURL: "http://35.222.175.132", // baseURL
    data: body,
    params: params,
    //   headers: {
    //     Authorization: getToken(),
    //   },
  });

  return res;
};
