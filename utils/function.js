import { STORAGE_KEY } from "@/constant";

export const setStorageSync = (key, value) => {
  return uni.setStorageSync(
    STORAGE_KEY + key,
    value ? JSON.stringify(value) : value
  );
};

export const getStorageSync = (key) => {
  let obj;
  try {
    const value = uni.getStorageSync(STORAGE_KEY + key);
    obj = value ? JSON.parse(value) : undefined;
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

// 文字转语音
export const textToSpeech = (options) => {
  const { text, ...optParams } = options ?? {};
  if (!text) {
    throw new Error(`textToSpeech的text 不能为空`);
  }
  const start = () => {
    // 检查设备是否支持语音合成
    if (!plus.speech) {
      uni.showToast({
        title: "当前设备不支持语音合成",
        icon: "none",
      });
      return;
    }

    // 开始语音合成
    plus.speech.speak(text, {
      // 可选配置
      lang: "zh-CN", // 语言（zh-CN 中文，en-US 英文等）
      rate: 1.0, // 语速（0.5-2.0）
      pitch: 1.0, // 音调（0.5-2.0）
      volume: 1.0, // 音量（0.0-1.0）
      onStart: function () {
        console.log("开始播放");
      },
      onError: function (e) {
        console.error("播放失败：", e.message);
        uni.showToast({
          title: "语音合成失败",
          icon: "none",
        });
      },
      onEnd: function () {
        console.log("播放结束");
      },
      ...(optParams ?? {}),
    });
  };
  const stop = () => {
    if (plus.speech) {
      plus.speech.stopSpeak();
    }
  };
  return {
    start,
    stop,
  };
};
