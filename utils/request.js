import { checkNetwork } from "./function";

const wrapRequest = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success(res) {
        resolve(res);
      },
      fail(err) {
        let errMsg = err.errMsg ?? err.msg ?? "请求失败";
        if (errMsg.includes("timeout")) {
          errMsg = "请求超时";
        }
        err.errMsg = errMsg;
        reject(err);
      },
    });
  });
};

export const request = async (options) => {
  const { showErrorToast = true, ...otherOption } = options;
  try {
    await checkNetwork();
    const result = await wrapRequest(otherOption);
    return result;
  } catch (error) {
    if (showErrorToast) {
      uni.showToast({
        title: error.errMsg,
        icon: "none",
      });
    }
    return error;
  }
};
