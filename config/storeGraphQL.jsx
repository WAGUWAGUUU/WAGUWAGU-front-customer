import axios from "axios";
const endpoint = "http://34.41.123.200/api/v1/store/graphql";

export const getMenuCategoryByStoreQL = async (variables) => {
  try {
    const data = await axios.post(
      endpoint,
      {
        query: `
          query getMenuCategoryByStoreId($storeId: ID) {
            getMenuCategoryByStoreId(storeId: $storeId) {
              menuCategoryId
              menuCategoryName
            }
          }
        `,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("데이터 확인" + data.data.data.getMenuCategoryByStoreId);
    return data.status === 200
      ? data.data.data.getMenuCategoryByStoreId
      : "error";
  } catch (error) {
    return error;
  }
};

export const getMenuByMenuCategoryQL = async (variables) => {
  try {
    const data = await axios.post(
      endpoint,
      {
        query: `
          query getAllMenuByMenuCategory($menuCategoryId: ID) {
            getAllMenuByMenuCategory(menuCategoryId: $menuCategoryId) {
              menuId
              menuName
              menuIntroduction
              menuPrice
              menuPossible
              menuImage
            }
          }
        `,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data.status === 200
      ? data.data.data.getAllMenuByMenuCategory
      : "error";
  } catch (error) {
    return error;
  }
};

export const getAllMenuByStoreIdQL = async (variables) => {
  try {
    const data = await axios.post(
      endpoint,
      {
        query: `
          query getAllMenuByStoreId($storeId: ID) {
            getAllMenuByStoreId(storeId: $storeId) {
              menuName
              menuIntroduction
            }
          }
        `,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data.status === 200 ? data.data.data.getAllMenuByStoreId : "error";
  } catch (error) {
    return error;
  }
};

export const getAllStoresNearUserQL = async (variables) => {
  try {
    console.log("zebal");
    const data = await axios.post(
      endpoint,
      {
        query: `
            mutation userNearStore($category: String,$input:UserLocationRequest ) {
              userNearStore(category: $category, input:$input) {
                ownerId
                storeId
                storeName
                storeAddress
                storeLongitude
                storeLatitude
                storeMinimumOrderAmount
                storeIntroduction
                storeImage
                distanceFromStoreToCustomer
                deliveryFee
              }
            }
          `,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("+_+_+_" + data.data.data.userNearStore);

    return data.status === 200 ? data.data.data.userNearStore : null;
  } catch (error) {
    return error;
  }
};

export const getAllStoresNearUserNoCategoryQL = async (variables) => {
  try {
    const data = await axios.post(
      endpoint,
      {
        query: `
            mutation userNearStoreAll($input: UserLocationRequest ) {
              userNearStoreAll(input:$input) {
                ownerId
                storeId
                storeName
                storeAddress
                storeLongitude
                storeLatitude
                storeMinimumOrderAmount
                storeIntroduction
                storeImage
                distanceFromStoreToCustomer
                deliveryFee
              }
            }
          `,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return data.status === 200 ? data.data.data.userNearStoreAll : null;
  } catch (error) {
    return error;
  }
};

export const getStoreDetailQL = async (variables) => {
  try {
    const data = await axios.post(
      endpoint,
      {
        query: `
            mutation storeInfoDetail($storeId: ID, $input : UserLocationRequest) {
              storeInfoDetail(storeId: $storeId,input:$input ) {
                ownerId
                storeId
                storeName
                storeAddress
                storeLongitude
                storeLatitude
                storeMinimumOrderAmount
                storeIntroduction
                storeImage
                distanceFromStoreToCustomer
                deliveryFee
              }
            }
          `,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data.status === 200 ? data.data.data.storeInfoDetail : "error";
  } catch (error) {
    return error;
  }
};

// MenuDetailScreen.jsx

export const getMenuByIdQL = async (variables) => {
  try {
    const data = await axios.post(
      endpoint,
      {
        query: `
            query getMenuById($menuId: ID) {
              getMenuById(menuId: $menuId) {
                menuId
                menuName
                menuIntroduction
                menuPrice
                menuPossible
                menuImage
              }
            }
          `,
        variables: variables,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data.status === 200 ? data.data.data.getMenuById : "error";
  } catch (error) {
    return error;
  }
};
