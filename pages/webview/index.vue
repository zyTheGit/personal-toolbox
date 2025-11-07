<template>
  <view class="webview">
    <web-view :webview-styles="webviewStyles" :src="webPageSrc"></web-view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const webPageSrc = ref("");
const webviewStyles = ref({
  progress: {
    color: "#1588f5",
  },
});
onLoad((params) => {
  const { url, title } = params;
  webPageSrc.value = url;
  uni.setNavigationBarTitle({
    title,
  });
  console.log(params);
});
</script>

<style lang="less">
.webview {
  width: 100%;
  height: 100%;
}
</style>
