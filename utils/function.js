import { STORAGE_KEY } from "@/constant";

export const setStorageSync = (key, value) => {
  return uni.setStorageSync(
    STORAGE_KEY + key,
    value ? JSON.stringify(value) : value
  );
};

/**
 * 获取本地缓存
 * @param {*} key
 * 是否报了默认值，默认false，将空值置为undefined
 * @param {boolean} hasDefaultValue
 * @returns
 */

export const getStorageSync = (key, hasDefaultValue = false) => {
  let obj;
  try {
    const value = uni.getStorageSync(STORAGE_KEY + key);
    obj = value ? JSON.parse(value) : hasDefaultValue ? value : undefined;
  } catch (error) {
    console.warn("getStorageSync", error);
  }
  return obj;
};

export const removeStorageSync = (key) => {
  uni.removeStorageSync(STORAGE_KEY + key);
};

export const clearStorage = () => {
  uni.clearStorage();
};

// 检测网络
export const checkNetwork = () => {
  return new Promise((resolve, reject) => {
    uni.getNetworkType({
      success: (res) => {
        if (res.networkType === "none") {
          reject({
            errMsg: "无网络连接",
          });
          return;
        }
        resolve(res.networkType);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};
