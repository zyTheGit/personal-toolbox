<template>
  <view class="audio" @click="handleClick">
    <uni-icons class="icon" :type="iconType" size="20" color="#000"></uni-icons>
  </view>
</template>

<script setup>
import { ref, onBeforeUnmount, watch, computed } from "vue";

const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  autoplay: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["play"]);

const innerAudioContext = ref(uni.createInnerAudioContext());
const paused = ref(true);

innerAudioContext.value.autoplay = false;
innerAudioContext.value.onError((res) => {
  console.log("audio.onError", res);
  innerAudioContext.value.destroy();
});
innerAudioContext.value.onPause(() => {
  paused.value = true;
});
innerAudioContext.value.onEnded(() => {
  paused.value = true;
});

const iconType = computed(() => (paused.value ? "sound" : "sound-filled"));

const playing = () => {
  if (!innerAudioContext.value || !innerAudioContext.value.src) return;

  innerAudioContext.value.play();
  paused.value = false;
  console.log("播放", paused);
};

const pause = () => {
  if (!innerAudioContext.value) return;
  paused.value = true;
  innerAudioContext.value.pause();
  console.log("暂停", paused);
};

const stop = () => {
  if (!innerAudioContext.value) return;
  innerAudioContext.value.stop();
  console.log("停止", paused);
};

const destroy = () => {
  if (!innerAudioContext.value) return;
  innerAudioContext.value.offError();
  innerAudioContext.value.offPause();
  innerAudioContext.value.offEnded();
  innerAudioContext.value.pause();
  innerAudioContext.value.destroy();
  innerAudioContext.value = null;
};

const handleClick = () => {
  if (paused.value) {
    playing();
  } else {
    pause();
  }
  emit("play", paused.value);
};

watch(
  () => props.src,
  (newSrc, oldSrc) => {
    innerAudioContext.value.src = newSrc;
    paused.value = true;
    if (!newSrc) {
      stop();
      return;
    }
    if (newSrc === oldSrc) return;
    if (props.autoplay) {
      playing();
    }
  }
);

onBeforeUnmount(() => {
  destroy();
});

defineExpose({ audio: innerAudioContext });
</script>

<style lang="less" scoped>
.audio {
  display: inline-flex;
}
</style>
