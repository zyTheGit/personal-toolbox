import { request } from "@/utils/request";
import { getRandomStr } from "@/utils/common";
import md5 from "@/utils/md5";
import { TRANSLATE_CONFIG } from "@/constant";
import { setTokenCache, getTokenCache } from "./utils";

const { translate, text2audio } = TRANSLATE_CONFIG;

export const translateApi = (params) => {
  const { url, appid, secretKey } = translate;
  const { keywords: q, from, to } = params;
  const salt = getRandomStr();
  const sign = appid + q + salt + secretKey;
  const signResult = md5.hex_md5_32(sign);
  return request({
    url,
    data: {
      q,
      appid,
      salt,
      from: from,
      to: to,
      sign: signResult,
    },
  });
};

export const text2audioApi = async (params) => {
  const { url } = text2audio;
  const { text } = params;
  const cacheToken = getTokenCache();
  const token = cacheToken ? cacheToken : await getAccessToken();
  return request({
    url,
    data: {
      tex: text,
      tok: token,
      ctp: 1,
      lan: "zh",
      cuid: "test1",
      per: "4194",
      aue: 3,
    },
    header: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    responseType: "arraybuffer",
  }).then((res) => {
    return res.data;
  });
};

const getAccessToken = () => {
  const { tokenUrl, appid, secretKey } = text2audio;
  return request({
    url: tokenUrl,
    data: {
      grant_type: "client_credentials",
      client_id: appid,
      client_secret: secretKey,
    },
  }).then((res) => {
    const { access_token, expires_in } = res.data;
    setTokenCache({ expiresIn: expires_in, token: access_token });
    return access_token;
  });
};
