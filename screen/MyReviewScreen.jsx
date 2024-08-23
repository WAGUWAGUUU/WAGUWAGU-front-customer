import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { Rating } from "react-native-ratings";
const MyReviewScreen = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      const userId = await AsyncStorage.getItem("customerId");
      try {
        const response = await fetch(
          `http://34.27.212.162/api/v1/reviews/myReview/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        setError(err.message);
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>내 리뷰</Text> */}
      <FlatList
        data={reviews}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <Text style={styles.storeName}>{item.storeName}</Text>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <Rating style={styles.rating}>별점: {item.rating}</Rating>
            <Text style={styles.timestamp}>
              작성 시간: {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  reviewItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    fontSize: 16,
    marginVertical: 10,
  },
  rating: {
    fontSize: 14,
    color: "#555",
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});

export default MyReviewScreen;
