<template>
  <view class="container">
    <uni-section
      type="line"
      v-for="(source, index) in appList"
      :title="source.title"
      :key="index"
    >
      <uni-grid :column="3">
        <uni-grid-item
          v-for="(item, j) in source.children"
          :key="j"
          @click="() => openPage(item)"
        >
          <view class="grid-item-box" style="background-color: #fff">
            <uni-icons
              custom-prefix="iconfont"
              :type="item.icon"
              size="30"
            ></uni-icons>
            <text class="text">{{ item.label }}</text>
          </view>
        </uni-grid-item>
      </uni-grid>
    </uni-section>
  </view>
</template>

<script setup>
import { appList } from "./config.js";

const openPage = (source) => {
  const { type, path, label } = source;
  let url;
  switch (type) {
    case "page":
      url = path;
      break;
    case "webview":
      url = `../webview/index?url=${path}&title=${label}`;
      break;
  }
  uni.navigateTo({
    url,
  });
};
</script>

<style lang="less">
.container {
  padding: 16px;

  .grid-item-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;

    .text {
      color: #333;
      text-decoration: underline;
    }
  }
}
</style>
