<template>
  <view class="translate">
    <view class="translate-header">
      <view class="chip" @click="() => onPopup(changeTypeMap.ORIGINAL)">
        {{ getTranslateText(translateResult.original) }}
      </view>
      <view class="swap" @click="onChangeLanguage">
        <uni-icons
          custom-prefix="iconfont"
          type="icon-qiehuan"
          size="18"
        ></uni-icons>
      </view>
      <view class="chip" @click="() => onPopup('translate')">
        {{ getTranslateText(translateResult.translate) }}
      </view>
    </view>
    <view class="original-wrap card">
      <textarea
        class="original"
        auto-height
        :maxlength="-1"
        v-model="textResult.original"
        confirm-type="search"
        placeholder="输入文字"
        @confirm="onSearch"
      ></textarea>

      <view
        class="action-group original-audio"
        v-if="getSupportAudio() && textResult.original"
      >
        <uni-icons
          class="clear"
          type="close"
          size="20"
          @click="onClear"
        ></uni-icons>
        <audio-player
          @play="() => onSound(changeTypeMap.ORIGINAL)"
          :src="audioResult.original"
          class="sound"
        />
      </view>
    </view>
    <view class="dst card" v-show="loading || textResult.translate">
      <template v-if="loading">
        <view>加载中...</view>
      </template>
      <template v-else>
        <view class="dst-content">{{ textResult.translate }}</view>

        <view class="action-group">
          <uni-icons
            class="paste"
            custom-prefix="iconfont"
            type="icon-niantie"
            size="20"
            @click="onPaste"
          ></uni-icons>

          <audio-player
            v-if="getSupportAudio(changeTypeMap.TRANSLATE)"
            :src="audioResult.translate"
            @play="() => onSound(changeTypeMap.TRANSLATE)"
            class="sound"
          />
        </view>
      </template>
    </view>

    <translate-list
      :list="historyList"
      @history="onHistory"
      @delete="onDelete"
    />

    <uni-popup ref="popupRef" type="top" background-color="#fff">
      <view class="popup-wrap">
        <view
          v-for="source in languageList"
          :key="source.code"
          class="item"
          @click="() => onTranslate(source)"
        >
          <template
            v-if="
              changeType === changeTypeMap.TRANSLATE
                ? source.code !== 'auto'
                : true
            "
          >
            <uni-icons
              class="item-icon"
              type="checkmarkempty"
              v-show="getChecked(source.code)"
            ></uni-icons>
            {{ source.name }}
          </template>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, watch } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getStorageSync, setStorageSync } from "@/utils/function";
import { throttle, getRandomStr } from "@/utils/common";
import { STORAGE_LANG_KEY } from "@/constant";
import { translateApi, text2audioApi } from "./api";
import { languageList, defaultLanguageList, changeTypeMap } from "./config";
import {
  updateHistoryCache,
  deleteHistoryCache,
  getHistoryCache,
  getHistoryCacheItem,
} from "./utils";

import { AudioPlayer, TranslateList } from "@/components";

const popupRef = ref(null);
// original , translate
const changeType = ref("");
const loading = ref(false);
const textResult = ref({
  original: "",
  translate: "",
});
const translateResult = ref({
  original: "auto",
  sourceOriginal: "auto",
  translate: "en",
});
const audioResult = ref({
  original: "",
  originalText: "",
  translate: "",
  translateText: "",
});
const historyList = ref([]);

const getSupportAudio = (code = changeTypeMap.ORIGINAL) => {
  let value = translateResult.value[code];
  if (code === changeTypeMap.ORIGINAL) {
    value = translateResult.value.sourceOriginal;
  }

  return ["en", "zh"].includes(value);
};

const getChecked = (code) => {
  return translateResult.value[changeType.value] === code;
};

const getTranslateText = (code) => {
  return languageList.find((i) => i.code === code)?.name;
};

const requestData = (value) => {
  const { original: from, translate: to } = translateResult.value;
  const { newSource } =
    getHistoryCacheItem([...historyList.value], {
      original: from,
      translate: to,
      originalText: value,
    }) ?? {};
  if (newSource) {
    return Promise.resolve(newSource);
  }
  return translateApi({ keywords: value, from, to }).then((res) => {
    const result = res.data;
    const { trans_result, from, to } = result;
    const [{ dst }] = trans_result ?? [];
    const source = {
      original: from,
      translate: to,
      originalText: value,
      translateText: dst,
      updateTime: Date.now(),
      key: getRandomStr(),
    };
    return source;
  });
};

const requestTranslate = () => {
  const value = textResult.value.original;
  if (!value) return;
  audioResult.value = {
    original: "",
    originalText: "",
    translate: "",
    translateText: "",
  };
  loading.value = true;
  requestData(value)
    .then((source) => {
      const list = updateHistoryCache(source);
      translateResult.value.sourceOriginal = source.original;
      textResult.value.translate = source.translateText;
      historyList.value = list;
    })
    .catch((e) => {
      console.error("requestTranslate.catch", e);
      textResult.value.translate = "";
    })
    .finally(() => {
      loading.value = false;
    });
};

const onSearch = throttle(requestTranslate, 1000);

const onPopup = (value) => {
  changeType.value = value;
  popupRef.value.open();
};

const onChangeLanguage = () => {
  const { original, translate } = translateResult.value;
  if (original === "auto") return;
  translateResult.value.original = translate;
  translateResult.value.translate = original;
};

const onTranslate = (source) => {
  const { code } = source;
  const list = Object.entries(translateResult.value);
  const optKey =
    changeType.value === changeTypeMap.TRANSLATE
      ? changeTypeMap.ORIGINAL
      : changeTypeMap.TRANSLATE;
  for (const [key, value] of list) {
    if (key !== changeType.value) continue;

    if (value === code) break;
    if (code === "auto" && changeType.value === changeTypeMap.TRANSLATE) break;

    const optValue = translateResult.value[optKey];
    if (code === optValue) {
      // 如果左边是自动翻译，选择的跟右边一样，不让选择
      if (value === "auto") {
        const val = defaultLanguageList.find((i) => i !== code);
        translateResult.value[optKey] = val;
        translateResult.value[key] = code;
      } else {
        translateResult.value[optKey] = value;
        translateResult.value[key] = optValue;
      }
    } else {
      translateResult.value[key] = code;
    }

    requestTranslate();
  }
  popupRef.value.close();
};

const onPaste = () => {
  uni.setClipboardData({
    data: textResult.value.translate,
    success: function (res) {
      uni.showToast({
        title: "译文已复制",
        icon: "none",
      });
    },
    fail: (err) => {
      uni.showToast({
        title: "译文失败",
        icon: "none",
      });
      console.error("复制失败：", err);
    },
  });
};

const onClear = () => {
  textResult.value.original = "";
  textResult.value.translate = "";
};

const onSound = (type) => {
  const text = textResult.value[type];
  const textKey = `${type}Text`;
  // 如果当前播放文本和上次一致不用再调用请求接口
  if (audioResult.value[textKey] === text) {
    return;
  }
  text2audioApi({
    text,
  }).then((res) => {
    // const base64 = uni.arrayBufferToBase64(res);
    // audioResult.value[type] = `data:audio/mp3;base64,${base64}`;
    audioResult.value[type] = res;
    audioResult.value[textKey] = text;
  });
};

const onHistory = (source) => {
  const { original, translate, originalText, translateText } = source;

  translateResult.value = {
    original,
    translate,
    sourceOriginal: original,
  };
  textResult.value = {
    original: originalText,
    translate: translateText,
  };
  audioResult.value = {
    original: "",
    originalText: "",
    translate: "",
    translateText: "",
  };
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 100,
  });
};

const onDelete = (source) => {
  uni.showModal({
    title: "提示",
    content: "确认要删除这个记录吗？",
    success: function (res) {
      if (res.confirm) {
        const { key } = source;
        historyList.value = historyList.value.filter((i) => i.key !== key);
        deleteHistoryCache(source);
      }
    },
  });
};

// 切换左侧自动语言，自动翻译的值重置到用户选择的内容
watch(
  () => translateResult.value.original,
  (value) => {
    translateResult.value.sourceOriginal = value;
  }
);

onLoad(() => {
  const lst = getHistoryCache();
  historyList.value = lst;

  const savedLang = getStorageSync(STORAGE_LANG_KEY);
  if (savedLang) {
    translateResult.value = { ...translateResult.value, ...savedLang };
  }
});

watch(
  () => translateResult.value,
  (val) => {
    setStorageSync(STORAGE_LANG_KEY, {
      original: val.original,
      translate: val.translate,
    });
  },
  { deep: true }
);
</script>

<style lang="less" scoped>
@import "./index.less";
</style>
