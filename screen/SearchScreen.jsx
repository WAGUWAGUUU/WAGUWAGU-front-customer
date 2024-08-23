import React, { useState, useEffect } from "react";
import { Text, View, FlatList, Alert } from "react-native";
import { Searchbar } from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import {
  searchByKeyword,
  createStore,
  deleteByCustomerId,
} from "../config/serchApi";
import {
  getAllStoresNearUserNoCategoryQL,
  getAllMenuByStoreIdQL,
} from "../config/storeGraphQL";
import { UserInformation } from "../config/orderApi";
import SearchStoreListSpeechBubble from "../components-store/SearchStoreListSpeechBubble";

export default function SearchScreen({ navigation }) {
  const [keywordQuery, setKeywordQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchHistory, setSearchHistory] = useState([]);

  const dimensionWidth = 300;

  const handleSearch = async (type, reset = false) => {
    try {
      setLoading(true);
      const pageable = {
        page: reset ? 0 : page,
        size: 10,
      };
      let data = [];

      if (type === "keyword") {
        if (!keywordQuery) {
          Alert.alert("알림", "검색할 키워드를 입력해주세요.");
          return;
        }

        data = await searchByKeyword(keywordQuery, pageable);
        console.log("Search Results: ", data);
      }

      if (reset) {
        setResults(data);
        setPage(1);
      } else {
        setResults((prevResults) => [...prevResults, ...data]);
        setPage((prevPage) => prevPage + 1);
      }

      setTotalPages(Math.ceil(data.total / pageable.size));

      // Update search history
      setSearchHistory((prevHistory) => [...prevHistory, keywordQuery]);
    } catch (error) {
      console.error(`${type} search failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreResults = () => {
    if (page < totalPages && !loading) {
      handleSearch("keyword");
    }
  };

  const saveStore = async () => {
    try {
      setLoading(true);

      const userInfo = await UserInformation();
      if (!userInfo) {
        Alert.alert("알림", "사용자 정보를 가져올 수 없습니다.");
        navigation.navigate("HomeScreen");
        return;
      }
      console.log("User Information:", userInfo);

      let storesNearUser = [];
      try {
        storesNearUser = await getAllStoresNearUserNoCategoryQL({
          input: {
            longitude: userInfo.customerLongitude,
            latitude: userInfo.customerLatitude,
          },
        });
        if (!storesNearUser || storesNearUser.length === 0) {
          throw new Error("No stores found near user.");
        }
        console.log("Stores near user:", storesNearUser);
      } catch (error) {
        Alert.alert("알림", "주변 가게 정보를 가져올 수 없습니다.");
        navigation.navigate("HomeScreen");
        return;
      }

      for (const store of storesNearUser) {
        let menuDetails = [];
        try {
          menuDetails = await getAllMenuByStoreIdQL({
            storeId: store.storeId,
          });
          if (!menuDetails || menuDetails.length === 0) {
            throw new Error("No menu details found for the store.");
          }
          console.log("Menu details:", menuDetails);
        } catch (error) {
          Alert.alert("알림", "메뉴 정보를 가져올 수 없습니다.");
          navigation.navigate("HomeScreen");
          return;
        }

        for (const menuDetail of menuDetails) {
          console.log("menuDetail: ", menuDetail);
          const storeData = {
            storeId: store.storeId || "1",
            customerId: userInfo.customerId,
            storeName: store.storeName || "초록마을 짱구할아버지네",
            storeIntroduction:
              store.storeIntroduction ||
              "안녕하세요~ 초록마을에 사는 짱구할아버지예요~",
            menuName: menuDetail.menuName || "Default Menu Name",
            menuIntroduction:
              menuDetail.menuIntroduction || "Default Menu Introduction",
          };

          try {
            const response = await createStore(storeData);
            console.log("Store saved successfully:", response);
          } catch (error) {
            console.error("Failed to save store:", error);
          }
        }
      }

      // After saving, run the search and display results
      handleSearch(true);

    } catch (error) {
      console.error("Failed to save stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = async (storeId) => {
    try {
      const userInfo = await UserInformation();
      if (!userInfo) {
        Alert.alert("알림", "사용자 정보를 가져올 수 없습니다.");
        navigation.navigate("HomeScreen");
        return;
      }
      await deleteByCustomerId(userInfo.customerId);
      console.log(
        "Store deleted successfully for customer ID:",
        userInfo.customerId
      );

      // Remove last search query from history
      setSearchHistory((prevHistory) => prevHistory.slice(0, -1));
      setKeywordQuery("");
      navigation.navigate("Store", { storeId });
    } catch (error) {
      console.error("Failed to delete store by customer ID:", error);
      Alert.alert("알림", "가게를 삭제하는 중에 문제가 발생했습니다.");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      saveStore();
    }, [])
  );

  useEffect(() => {
    return () => {
      const deleteStoreByCustomerId = async () => {
        try {
          const userInfo = await UserInformation();
          if (!userInfo) {
            Alert.alert("알림", "사용자 정보를 가져올 수 없습니다.");
            navigation.navigate("HomeScreen");
            return;
          }
          await deleteByCustomerId(userInfo.customerId);
          console.log(
            "Store deleted successfully for customer ID:",
            userInfo.customerId
          );
        } catch (error) {
          console.error("Failed to delete store by customer ID:", error);
        }
      };

      deleteStoreByCustomerId();
    };
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Searchbar
        placeholder={"검색할 키워드를 입력해주세요"}
        value={keywordQuery}
        onChangeText={(text) => {
          setKeywordQuery(text);
          setPage(0);
        }}
        onSubmitEditing={() => handleSearch("keyword", true)}
        style={{ marginBottom: 20 }}
      />

      {loading && <Text>Loading...</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) =>
          item.storeId !== null
            ? item.storeId.toString()
            : Math.random().toString()
        }
        renderItem={({ item }) => {
          console.log("Item Data: ", item);  // Log the entire item object
          return (
            <SearchStoreListSpeechBubble
              key={item.storeId}
              width={dimensionWidth}
              title={item.storeName}
              image={item.storeImage}
              storeMinimumOrderAmount={item.storeMinimumOrderAmount}
              fee={item.deliveryFee}
              onPress={() => handleItemPress(item.storeId)}
            />
          );
        }}
        onEndReached={loadMoreResults} // Ensure this references the correct function
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
