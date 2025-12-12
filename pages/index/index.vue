<template>
  <view class="container">
    <view class="header">
      <image class="logo" src="/static/uni.png" mode="widthFix" />
      <text class="title">工具箱</text>
      <text class="subtitle">简洁高效的日常工具集合</text>
    </view>

    <view class="sections">
      <view
        class="category"
        v-for="(source, index) in displayList"
        :key="index"
      >
        <view class="category-header">
          <text class="category-title">{{ source.title }}</text>
        </view>
        <uni-grid class="grid" :column="3" :showBorder="false" :square="false">
          <uni-grid-item
            v-for="(item, j) in sortChildren(source.children)"
            :key="j"
            @click="() => openPage(item)"
            @longpress="() => openItemActions(index, j)"
          >
            <view class="grid-item-box">
              <view class="icon-wrap">
                <uni-icons
                  custom-prefix="iconfont"
                  :type="item.icon"
                  size="28"
                ></uni-icons>
              </view>
              <text class="text">{{ item.label }}</text>
            </view>
          </uni-grid-item>
        </uni-grid>
      </view>
    </view>
    <view class="fab" @click="openAdd">+</view>

    <tool-editor
      v-model:visible="showEditor"
      :groups="groupTitles"
      :initial-data="editingData"
      :initial-group-index="initialGroupIndex"
      @confirm="handleSave"
    />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { getStorageSync, setStorageSync } from "@/utils/function";
import { ToolEditor } from "@/components";
import { STORAGE_HOME_KEY } from "@/constant";
import { appList } from "./config.js";

const appListLocal = ref([]);
const initList = () => {
  const saved = getStorageSync(STORAGE_HOME_KEY) || [];
  appListLocal.value = saved.length
    ? saved
    : JSON.parse(JSON.stringify(appList));
};
initList();

const displayList = computed(() => appListLocal.value);
const groupTitles = computed(() => appListLocal.value.map((i) => i.title));

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

const showEditor = ref(false);
const editingPos = ref({ groupIndex: -1, itemIndex: -1 });
const editingData = ref(null);
const initialGroupIndex = ref(0);

const openAdd = () => {
  editingPos.value = { groupIndex: -1, itemIndex: -1 };
  editingData.value = null;
  initialGroupIndex.value = 0;
  showEditor.value = true;
};

const persist = () => {
  setStorageSync(STORAGE_HOME_KEY, appListLocal.value);
};

const handleSave = (itemData) => {
  const { groupName, ...payload } = itemData;
  let groupIndex = appListLocal.value.findIndex((i) => i.title === groupName);

  if (groupIndex === -1) {
    appListLocal.value.push({ title: groupName, children: [] });
    groupIndex = appListLocal.value.length - 1;
  }

  const isEdit = editingPos.value.groupIndex !== -1;

  if (isEdit) {
    const { groupIndex: gi, itemIndex: ii } = editingPos.value;
    if (gi === groupIndex) {
      appListLocal.value[gi].children.splice(ii, 1, payload);
    } else {
      // Move to new group
      appListLocal.value[groupIndex].children.push(payload);

      // Remove from old group
      appListLocal.value[gi].children.splice(ii, 1);

      // Remove old group if empty
      if (appListLocal.value[gi].children.length === 0) {
        appListLocal.value.splice(gi, 1);
      }
    }
  } else {
    appListLocal.value[groupIndex].children.push(payload);
  }
  persist();
  showEditor.value = false;
};

const openItemActions = (groupIndex, itemIndex) => {
  uni.showActionSheet({
    itemList: ["编辑", "删除"],
    success: (res) => {
      if (res.tapIndex === 0) {
        const item = appListLocal.value[groupIndex].children[itemIndex];
        editingPos.value = { groupIndex, itemIndex };
        editingData.value = { ...item };
        initialGroupIndex.value = groupIndex;
        showEditor.value = true;
      } else if (res.tapIndex === 1) {
        uni.showModal({
          title: "确认删除",
          content: "删除后不可恢复",
          success: (mRes) => {
            if (mRes.confirm) {
              appListLocal.value[groupIndex].children.splice(itemIndex, 1);
              if (appListLocal.value[groupIndex].children.length === 0) {
                appListLocal.value.splice(groupIndex, 1);
              }
              persist();
            }
          },
        });
      }
    },
  });
};
</script>

<style lang="less">
@import "./index.less";
</style>
