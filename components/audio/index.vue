<template>
  <view class="audio" v-bind="$attr">
    <uni-icons
      v-if="paused"
      class="icon"
      type="sound"
      size="20"
      color="#000"
      @click="playing"
    ></uni-icons>
    <uni-icons
      v-else
      class="icon"
      type="sound-fail"
      size="20"
      color="#000"
    ></uni-icons>
  </view>
</template>

<script setup>
import { ref, onBeforeUnmount, watch, computed } from "vue";

const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  immediate: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["play", "pause"]);

const innerAudioContext = ref(uni.createInnerAudioContext());

innerAudioContext.value.autoplay = true;

innerAudioContext.value.onError((res) => {
  console.log(res.errMsg);
  console.log(res.errCode);
});

const paused = computed(() => innerAudioContext.value.paused);

const playing = () => {
  if (!paused.value) return;
  innerAudioContext.value.onPlay(() => {
    console.log("开始播放", paused);
  });
};

watch(
  () => props.src,
  (src) => {
    innerAudioContext.value.src = src;
    if (props.immediate) {
      playing();
    }
  }
);

onBeforeUnmount(() => {
  if (!innerAudioContext.value) return;
  innerAudioContext.value.offError();
  innerAudioContext.value.offPlay();
  innerAudioContext.value.pause();
  innerAudioContext.value.destroy();
  innerAudioContext.value = null;
});

defineExpose({ innerAudioContext });
</script>

<style lang="less" scoped>
.audio {
  display: inline-flex;
}
</style>
