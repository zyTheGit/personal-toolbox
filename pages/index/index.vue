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
          v-for="(item, j) in sortChildren(source.children)"
          :key="j"
          @click="() => openPage(item)"
        >
          <view class="grid-item-box">
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

const sortChildren = (children) => {
  return children.sort((a, b) => {
    const aSort = a.sort || 0;
    const bSort = b.sort || 0;
    if (aSort !== bSort) {
      return aSort - bSort;
    }
    return a.label.localeCompare(b.label);
  });
};

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
    background-color: #fff;

    .text {
      color: #333;
      text-decoration: underline;
    }
  }
}
</style>
