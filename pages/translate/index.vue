<template>
	<view class="translate">
		<view class="translate-header">
			<view class="left" @click="() => onPopup('original')">
				{{ getTranslateText(translateResult.original) }}
			</view>
			<view class="center">
				<uni-icons custom-prefix="iconfont" type="icon-qiehuan" size="20" @click="onChangeLanguage"></uni-icons>
			</view>
			<view class="right" @click="() => onPopup('translate')">
				{{ getTranslateText(translateResult.translate) }}
			</view>
		</view>
		<view class="original-wrap">
			<uni-easyinput
				class="original"
				type="textarea"
				clearable
				trim
				autoHeight
				placeholder="输入文字"
				focus
				suffix-icon="search"
				v-model="originalTextResult.original"
				:input-border="false"
				@iconClick="iconClick"
			></uni-easyinput>

			<audio-player
				key="original"
				class="original-sound"
				@play="() => onSound('original')"
				:src="audioSrcResult.original"
				v-if="supportAudio && originalTextResult.original"
			/>
		</view>
		<view class="dst" v-show="loading || originalTextResult.translate">
			<template v-if="loading">
				<view>加载中...</view>
			</template>
			<template v-else>
				{{ originalTextResult.translate }}

				<uni-icons class="icon paste" custom-prefix="iconfont" type="icon-niantie" size="20" @click="onPaste"></uni-icons>

				<audio-player key="original" class="icon sound" @play="() => onSound('translate')" :src="audioSrcResult.translate" v-if="supportAudio" />
			</template>
		</view>
		<uni-list class="history" border>
			<uni-list-item v-for="item in historyReverseList" clickable :key="item.key">
				<template v-slot:body>
					<view class="history-item" @click="onHistory(item)">
						<view class="history-item-header">
							{{ item.originalText }}
						</view>
						<view class="history-item-desc">
							{{ item.translateText }}
						</view>
					</view>
				</template>

				<template v-slot:footer>
					<uni-icons custom-prefix="iconfont" type="icon-a-ziyuan824" size="20" @click="() => onDelete(item)"></uni-icons>
				</template>
			</uni-list-item>
		</uni-list>

		<uni-popup ref="popupRef" type="top" background-color="#fff">
			<view class="popup-wrap">
				<template v-for="source in languageList" :key="source.code">
					<view class="item" @click="() => onTranslate(source)" v-show="changeType === 'translate' ? source.code !== 'auto' : true">
						<uni-icons class="item-icon" type="checkmarkempty" v-show="getChecked(source.code)"></uni-icons>
						{{ source.name }}
					</view>
				</template>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { throttle, getRandomStr } from '@/utils/common';
import { translateApi, text2audioApi } from './api';
import { languageList, defaultLanguageList } from './config';
import { updateHistoryCache, deleteHistoryCache, getHistoryCache, getHistoryCacheItem } from './utils';

import { AudioPlayer } from '@/components';

const popupRef = ref(null);
// original , translate
const changeType = ref('');
const loading = ref(false);
const originalTextResult = ref({
	original: '',
	translate: ''
});
const translateResult = ref({
	original: 'auto',
	translate: 'en'
});
const audioSrcResult = ref({
	original: '',
	translate: ''
});
const historyList = ref([]);

const historyReverseList = computed(() => {
	return historyList.value.slice(0).reverse();
});

const supportAudio = computed(() => {
	return ['en', 'zh'].includes(translateResult.value.translate);
});

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
			originalText: value
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
			key: getRandomStr()
		};
		return source;
	});
};

const requestTranslate = () => {
	const value = originalTextResult.value.original;
	if (!value) return;
	audioSrcResult.value = {
		original: '',
		translate: ''
	};
	originalTextResult.value.translate = '';
	loading.value = true;
	requestData(value)
		.then((source) => {
			const newList = updateHistoryCache(source);
			originalTextResult.value.translate = source.translateText;
			historyList.value = newList;
		})
		.catch((e) => {
			console.error('requestTranslate.catch', e);
			originalTextResult.value.translate = undefined;
		})
		.finally(() => {
			loading.value = false;
		});
};

const iconClick = throttle(requestTranslate, 1000);

const onPopup = (value) => {
	changeType.value = value;
	popupRef.value.open();
};

const onChangeLanguage = () => {
	const { original, translate } = translateResult.value;
	if (original === 'auto') return;
	translateResult.value.original = translate;
	translateResult.value.translate = original;
};

const onTranslate = (source) => {
	const { code } = source;
	const list = Object.entries(translateResult.value);
	const optKey = changeType.value === 'translate' ? 'original' : 'translate';
	for (const [key, value] of list) {
		if (key === changeType.value) {
			if (code === 'auto') break;

			if (value === code) break;

			const optValue = translateResult.value[optKey];
			if (code === optValue) {
				// 如果左边是自动翻译，选择的跟右边一样，不让选择
				if (value === 'auto') {
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
	}
	popupRef.value.close();
};

const onPaste = () => {
	uni.setClipboardData({
		data: translateResult.value.translate,
		success: function (res) {
			uni.showToast({
				title: '译文已复制',
				icon: 'none'
			});
		},
		fail: (err) => {
			// 复制失败时的回调（如无权限等）
			uni.showToast({
				title: '译文失败',
				icon: 'none'
			});
			console.error('复制失败：', err);
		}
	});
};

const onSound = (type) => {
	const text = originalTextResult.value[type];
	text2audioApi({
		text
	}).then((res) => {
		// const base64 = uni.arrayBufferToBase64(res);
		// audioSrcResult.value[type] = `data:audio/mp3;base64,${base64}`;
		console.log(res);
		audioSrcResult.value[type] = res;
	});
};

const onHistory = (source) => {
	const { original, translate, originalText, translateText } = source;

	translateResult.value = {
		original,
		translate
	};
	originalTextResult.value = {
		original: originalText,
		translate: translateText
	};
	audioSrcResult.value = {
		original: '',
		translate: ''
	};
	uni.pageScrollTo({
		scrollTop: 0, // 滚动到的位置（顶部为 0）
		duration: 100 // 滚动动画时长（毫秒，可选，默认 300）
	});
};

const onDelete = (source) => {
	uni.showModal({
		title: '提示',
		content: '确认要删除这个记录吗？',
		success: function (res) {
			if (res.confirm) {
				const { key } = source;
				historyList.value = historyList.value.filter((i) => i.key !== key);
				deleteHistoryCache(source);
			}
		}
	});
};

onLoad(() => {
	const lst = getHistoryCache();
	historyList.value = lst;
	console.log('history', lst);
});
</script>

<style lang="less" scoped>
.translate {
	width: 100%;
	height: 100%;
	padding: 8px;
	box-sizing: border-box;

	&-header {
		display: flex;
		width: 100%;
		height: 50px;
		justify-content: center;
		align-items: center;
		gap: 20px;
		color: #1a73e8;
	}

	.dst {
		position: relative;
		min-height: 100px;
		padding: 12px;
		padding-right: 24px;
		background-color: #f5f5f5;

		.icon {
			position: absolute;
			right: 16px;
		}

		.paste {
			top: 12px;
		}

		.sound {
			top: 46px;
		}
	}

	.original-wrap {
		position: relative;

		.original {
			display: flex;
			align-items: center;
			align-content: center;
			padding: 8px 10px;
			border: 1px solid #e0e0e0;
			box-sizing: border-box;

			::v-deep .is-textarea {
				// align-items: center;

				.uni-textarea-textarea {
					font-size: 16px;
				}

				.uniui-search {
					color: #000 !important;
				}
			}
		}

		.original-sound {
			position: absolute;
			right: 16px;
			top: 46px;
		}
	}

	.history {
		&-item {
			flex: 1;

			&-desc {
				color: #999999;
			}
		}

		::v-deep .uni-list-item__container {
			align-items: center;
			gap: 6px;
			padding: 12px;
		}
	}
}

.popup-wrap {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	padding: 12px;
	box-sizing: border-box;

	.item {
		position: relative;
		padding-left: 40px;
		line-height: 40px;

		&:active {
			background-color: #eee;
		}

		&-icon {
			position: absolute;
			left: 12px;
			top: 50%;
			transform: translateY(-50%);
			z-index: 1;
		}
	}
}

::v-deep .uni-popup > uni-view {
	height: 100%;
}
</style>
