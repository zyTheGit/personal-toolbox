<template>
  <view v-if="visible" class="modal-mask">
    <view class="modal">
      <view class="modal-title">{{
        isEditMode ? "编辑工具" : "新增工具"
      }}</view>
      <view class="form">
        <view class="form-row">
          <text class="label">分组<text class="required">*</text></text>
          <picker
            :range="categoryOptions"
            :value="categoryPickerIndex"
            @change="onCategoryChange"
          >
            <view
              :class="[
                'picker-value',
                errors.group && !isNewCategory ? 'error' : '',
              ]"
              >{{ categoryOptions[categoryPickerIndex] }}</view
            >
          </picker>
        </view>
        <view v-if="isNewCategory" class="form-row">
          <text class="label">分组名称<text class="required">*</text></text>
          <input
            :class="['input', errors.group && isNewCategory ? 'error' : '']"
            v-model="formCategoryTitle"
            placeholder="输入分组名称"
            @input="() => clearError('group')"
          />
        </view>
        <view class="form-row">
          <text class="label">名称<text class="required">*</text></text>
          <input
            :class="['input', errors.label ? 'error' : '']"
            v-model="form.label"
            placeholder="输入名称"
            @input="() => clearError('label')"
          />
        </view>
        <view class="form-row">
          <text class="label">类型</text>
          <picker
            :range="typeOptions"
            range-key="label"
            :value="typePickerIndex"
            @change="onTypeChange"
          >
            <view class="picker-value">{{
              typeOptions[typePickerIndex].label
            }}</view>
          </picker>
        </view>
        <view class="form-row">
          <text class="label">路径<text class="required">*</text></text>
          <input
            :class="['input', errors.path ? 'error' : '']"
            v-model="form.path"
            placeholder="页面路径或链接"
            @input="() => clearError('path')"
          />
        </view>
        <view class="form-row">
          <text class="label">图标</text>
          <input class="input" v-model="form.icon" placeholder="icon 名称" />
        </view>
        <view class="form-row">
          <text class="label">排序</text>
          <input
            class="input"
            type="number"
            v-model.number="form.sort"
            placeholder="数字"
          />
        </view>
      </view>
      <view class="modal-actions">
        <button class="btn secondary" @click="close">取消</button>
        <button class="btn primary" @click="save">保存</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  groups: {
    type: Array,
    default: () => [],
  },
  initialData: {
    type: Object,
    default: () => null,
  },
  initialGroupIndex: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["update:visible", "confirm"]);

const isEditMode = computed(() => !!props.initialData);

const typeOptions = [
  { label: "内置页面", value: "page" },
  { label: "第三方地址", value: "webview" },
];

const categoryOptions = computed(() => {
  return [...props.groups, "新建分组"];
});

const form = ref({ label: "", path: "", icon: "", type: "page", sort: 1 });
const formCategoryTitle = ref("");
const categoryPickerIndex = ref(0);
const typePickerIndex = ref(0);
const isNewCategory = ref(false);
const errors = ref({ group: false, label: false, path: false });

watch(
  () => props.visible,
  (val) => {
    if (val) {
      resetForm();
    }
  }
);

const resetForm = () => {
  errors.value = { group: false, label: false, path: false };
  if (props.initialData) {
    form.value = { ...props.initialData };
    typePickerIndex.value = Math.max(
      0,
      typeOptions.findIndex((opt) => opt.value === form.value.type)
    );
    categoryPickerIndex.value = props.initialGroupIndex;
    isNewCategory.value = false;
    formCategoryTitle.value = "";
  } else {
    form.value = { label: "", path: "", icon: "", type: "page", sort: 1 };
    typePickerIndex.value = 0;
    categoryPickerIndex.value = 0;
    isNewCategory.value = false;
    formCategoryTitle.value = "";
  }
};

const onTypeChange = (e) => {
  typePickerIndex.value = Number(e.detail.value);
  form.value.type = typeOptions[typePickerIndex.value].value;
};

const onCategoryChange = (e) => {
  categoryPickerIndex.value = Number(e.detail.value);
  isNewCategory.value =
    categoryOptions.value[categoryPickerIndex.value] === "新建分组";
  clearError("group");
};

const clearError = (field) => {
  errors.value[field] = false;
};

const close = () => {
  emit("update:visible", false);
};

const save = () => {
  errors.value = { group: false, label: false, path: false };
  const groupTitle = isNewCategory.value
    ? formCategoryTitle.value.trim()
    : categoryOptions.value[categoryPickerIndex.value];
  if (!groupTitle) errors.value.group = true;
  if (!String(form.value.label).trim()) errors.value.label = true;
  if (!String(form.value.path).trim()) errors.value.path = true;

  if (errors.value.group || errors.value.label || errors.value.path) {
    uni.showToast({ title: "请完善必填项", icon: "none" });
    return;
  }

  emit("confirm", {
    ...form.value,
    groupName: groupTitle,
  });
};
</script>

<style lang="less" scoped>
/* Copied from original index.less and scoped */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  width: 600rpx;
  background-color: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  padding: 30rpx;

  .modal-title {
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 20rpx;

    .form-row {
      display: flex;
      align-items: center;

      .label {
        width: 140rpx;
        font-size: 28rpx;
        color: #333;

        .required {
          color: red;
          margin-left: 4rpx;
        }
      }

      .input,
      .picker-value {
        flex: 1;
        height: 72rpx;
        line-height: 72rpx;
        background-color: #f5f5f5;
        border-radius: 8rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        border: 1px solid transparent;

        &.error {
          border-color: red;
        }
      }
    }
  }

  .modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 40rpx;
    gap: 20rpx;

    .btn {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      font-size: 28rpx;
      border-radius: 40rpx;

      &.secondary {
        background-color: #f5f5f5;
        color: #666;
      }

      &.primary {
        background-color: #007aff;
        color: #fff;
      }
    }
  }
}
</style>
