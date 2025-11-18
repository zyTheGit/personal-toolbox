<template>
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
</template>

<script setup>
import { computed } from 'vue';
import { isArray } from '@/utils/common.js';

const props = defineProps({
	list: {
		type: Array,
		default: () => [],
		required: true
	}
});

const emit = defineEmits(['history', 'delete']);

const historyReverseList = computed(() => {
	return isArray(props.list) ? props.list.slice(0).reverse() : [];
});

const onDelete = (source) => {
	emit('delete', source);
};

const onHistory = (source) => {
	emit('history', source);
};
</script>

<style lang="less" scoped>
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
</style>
