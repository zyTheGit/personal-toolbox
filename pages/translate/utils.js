import { setStorageSync, getStorageSync } from "@/utils/function";
import { historyCacheLength, historyKey } from "./config";

export const deleteHistoryCache = (source) => {
  const list = getHistoryCache();
  const index = list.findIndex((item) => item.key === source.key);
  if (index !== -1) {
    list.splice(index, 1);
  }
  setStorageSync(historyKey, list);
  return list;
};

export const updateHistoryCache = (source) => {
  const list = getHistoryCache();
  const index = list.findIndex(
    (item) =>
      item.original === source.original &&
      item.translate === source.translate &&
      item.originalText === source.originalText
  );
  if (index !== -1) {
    source = { ...source, updateTime: Date.now() };
    list.splice(index, 1);
  } else if (list.length >= historyCacheLength) {
    list.pop();
  }
  list.push(source);
  setStorageSync(historyKey, list);
  return list;
};

export const getHistoryCache = () => {
  const historyList = getStorageSync(historyKey) ?? [];
  return historyList;
};

export const getHistoryCacheItem = (historyList, source) => {
  const historyMap = new Map(
    historyList.map((i) => {
      const { original, translate, originalText } = i;
      const key = `${original}${translate}${originalText}`;
      return [key, i];
    })
  );
  const { original, translate, originalText } = source;
  const mapKey = `${original}${translate}${originalText}`;
  const data = historyMap.get(mapKey);
  if (data) {
    historyMap.delete(mapKey);
    data.updateTime = Date.now();
    return {
      newSource: data,
      newList: historyMap.values(),
    };
  }
};
