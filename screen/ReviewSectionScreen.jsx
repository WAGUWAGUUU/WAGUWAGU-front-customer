import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Dimensions } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

import { Rating } from "react-native-ratings";

const ReviewSectionScreen = ({ navigation, route }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRatings, setAverageRatings] = useState([]);
  const { storeId, storeName } = route.params;

  const fetchReviews = async () => {
    try {
      const response = await axios.get(
        `http://34.27.212.162/api/v1/reviews/store/${storeId}`
      );
      console.log(storeId);
      setReviews(response.data);
      console.log("리뷰", response.data);
      const processedData = processData(response.data);
      setAverageRatings(processedData);
    } catch (error) {
      console.log("error fetching reviews", error);
    }
  };

  useEffect(() => {
    console.log("storeId************" + storeId);
    if (storeId) {
      fetchReviews();
    }
  }, [storeId]);
  const processData = (reviews) => {
    const monthlyRatings = {};

    reviews.forEach((review) => {
      const month = moment(review.timestamp).format("M월");
      if (!monthlyRatings[month]) {
        monthlyRatings[month] = { sum: 0, count: 0 };
      }
      monthlyRatings[month].sum += review.rating;
      monthlyRatings[month].count += 1;
    });

    const averageRatings = Object.keys(monthlyRatings)
      .map((month) => ({
        month,
        monthNumber: parseInt(month),
        average: Math.max(
          1,
          Math.min(
            5,
            parseFloat(
              (monthlyRatings[month].sum / monthlyRatings[month].count).toFixed(
                1
              )
            )
          )
        ),
      }))
      .sort((a, b) => a.monthNumber - b.monthNumber);

    return averageRatings;
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewContainer}>
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>

      <Rating
        type="star"
        fractions={1}
        startingValue={item.rating}
        imageSize={20}
        readonly
        style={styles.rating}
      />
      <Text style={styles.content}>{item.content}</Text>
    </View>
  );
  const chartData = {
    labels: averageRatings.map((item) => item.month),
    datasets: [
      {
        data: averageRatings.map((item) => parseFloat(item.average)),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}></Text>
      <Text style={styles.storeName}>{storeName}</Text>
      {averageRatings.length > 0 && (
        <BarChart
          showYAxisIndices={false}
          data={chartData}
          width={Dimensions.get("window").width - 32} // from react-native
          height={220}
          chartConfig={{
            paddingRight: 30,
            paddingLeft: 30,
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            barPercentage: 0.3,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          style={{
            marginVertical: 10,
            borderRadius: 12,
          }}
        />
      )}
      <FlatList
        data={reviews}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderReview}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginVertical: 16,
    textAlign: "center",
  },
  reviewContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timestamp: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  content: {
    fontSize: 16,
  },
  storeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});

export default ReviewSectionScreen;
