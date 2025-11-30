<template>
  <view class="container">
    <view class="header">
      <image class="logo" src="/static/uni.png" mode="widthFix" />
      <text class="title">工具箱</text>
      <text class="subtitle">简洁高效的日常工具集合</text>
    </view>

    <view class="sections">
      <view class="category" v-for="(source, index) in displayList" :key="index">
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
                <uni-icons custom-prefix="iconfont" :type="item.icon" size="28"></uni-icons>
              </view>
              <text class="text">{{ item.label }}</text>
            </view>
          </uni-grid-item>
        </uni-grid>
      </view>
    </view>
    <view class="fab" @click="openAdd">+</view>

    <view v-if="showEditor" class="modal-mask">
      <view class="modal">
        <view class="modal-title">{{ isEdit ? '编辑工具' : '新增工具' }}</view>
        <view class="form">
          <view class="form-row">
            <text class="label">分组<text class="required">*</text></text>
            <picker :range="categoryOptions" :value="categoryPickerIndex" @change="onCategoryChange">
              <view :class="['picker-value', errors.group && !isNewCategory ? 'error' : '']">{{ categoryOptions[categoryPickerIndex] }}</view>
            </picker>
          </view>
          <view v-if="isNewCategory" class="form-row">
            <text class="label">分组名称<text class="required">*</text></text>
            <input :class="['input', errors.group && isNewCategory ? 'error' : '']" v-model="formCategoryTitle" placeholder="输入分组名称" @input="() => clearError('group')" />
          </view>
          <view class="form-row">
            <text class="label">名称<text class="required">*</text></text>
            <input :class="['input', errors.label ? 'error' : '']" v-model="form.label" placeholder="输入名称" @input="() => clearError('label')" />
          </view>
          <view class="form-row">
            <text class="label">类型</text>
            <picker :range="typeOptions" range-key="label" :value="typePickerIndex" @change="onTypeChange">
              <view class="picker-value">{{ typeOptions[typePickerIndex].label }}</view>
            </picker>
          </view>
          <view class="form-row">
            <text class="label">路径<text class="required">*</text></text>
            <input :class="['input', errors.path ? 'error' : '']" v-model="form.path" placeholder="页面路径或链接" @input="() => clearError('path')" />
          </view>
          <view class="form-row">
            <text class="label">图标</text>
            <input class="input" v-model="form.icon" placeholder="icon 名称" />
          </view>
          <view class="form-row">
            <text class="label">排序</text>
            <input class="input" type="number" v-model.number="form.sort" placeholder="数字" />
          </view>
        </view>
        <view class="modal-actions">
          <button class="btn secondary" @click="closeEditor">取消</button>
          <button class="btn primary" @click="saveTool">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { appList } from "./config.js";
import { getStorageSync, setStorageSync } from "@/utils/function";

const STORAGE_HOME_KEY = "home-app-list";

const appListLocal = ref([]);
const initList = () => {
  const saved = getStorageSync(STORAGE_HOME_KEY) || [];
  appListLocal.value = saved.length ? saved : JSON.parse(JSON.stringify(appList));
};
initList();

const displayList = computed(() => appListLocal.value);

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
const isEdit = ref(false);
const editingPos = ref({ groupIndex: -1, itemIndex: -1 });
const typeOptions = [
  { label: "内置页面", value: "page" },
  { label: "第三方地址", value: "webview" },
];
const typePickerIndex = ref(0);
const categoryOptions = computed(() => {
  const titles = appListLocal.value.map((i) => i.title);
  return [...titles, "新建分组"];
});
const categoryPickerIndex = ref(0);
const isNewCategory = ref(false);
const formCategoryTitle = ref("");
const form = ref({ label: "", path: "", icon: "", type: "page", sort: 1 });
const errors = ref({ group: false, label: false, path: false });

const openAdd = () => {
  isEdit.value = false;
  editingPos.value = { groupIndex: -1, itemIndex: -1 };
  typePickerIndex.value = 0;
  categoryPickerIndex.value = 0;
  isNewCategory.value = false;
  formCategoryTitle.value = "";
  form.value = { label: "", path: "", icon: "", type: "page", sort: 1 };
  showEditor.value = true;
};

const closeEditor = () => {
  showEditor.value = false;
};

const onTypeChange = (e) => {
  typePickerIndex.value = Number(e.detail.value);
  form.value.type = typeOptions[typePickerIndex.value].value;
};

const onCategoryChange = (e) => {
  categoryPickerIndex.value = Number(e.detail.value);
  isNewCategory.value = categoryOptions.value[categoryPickerIndex.value] === "新建分组";
  clearError('group');
};

const persist = () => {
  setStorageSync(STORAGE_HOME_KEY, appListLocal.value);
};

const saveTool = () => {
  errors.value = { group: false, label: false, path: false };
  const groupTitle = isNewCategory.value ? formCategoryTitle.value.trim() : categoryOptions.value[categoryPickerIndex.value];
  if (!groupTitle) errors.value.group = true;
  if (!String(form.value.label).trim()) errors.value.label = true;
  if (!String(form.value.path).trim()) errors.value.path = true;
  if (errors.value.group || errors.value.label || errors.value.path) {
    uni.showToast({ title: "请完善必填项", icon: "none" });
    return;
  }
  let groupIndex = appListLocal.value.findIndex((i) => i.title === groupTitle);
  if (groupIndex === -1) {
    appListLocal.value.push({ title: groupTitle, children: [] });
    groupIndex = appListLocal.value.length - 1;
  }
  const payload = { ...form.value };
  if (isEdit.value) {
    const { groupIndex: gi, itemIndex: ii } = editingPos.value;
    appListLocal.value[gi].children.splice(ii, 1, payload);
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
        isEdit.value = true;
        editingPos.value = { groupIndex, itemIndex };
        form.value = { ...item };
        typePickerIndex.value = Math.max(0, typeOptions.findIndex((opt) => opt.value === item.type));
        const titles = appListLocal.value.map((i) => i.title);
        const ti = Math.max(0, titles.indexOf(displayList.value[groupIndex].title));
        categoryPickerIndex.value = ti;
        isNewCategory.value = false;
        formCategoryTitle.value = "";
        showEditor.value = true;
      } else if (res.tapIndex === 1) {
        uni.showModal({
          title: "确认删除",
          content: "删除后不可恢复",
          success: (mRes) => {
            if (mRes.confirm) {
              appListLocal.value[groupIndex].children.splice(itemIndex, 1);
              persist();
            }
          },
        });
      }
    },
  });
};

const clearError = (field) => {
  errors.value[field] = false;
};
</script>

<style lang="less">
@import "./index.less";
</style>
