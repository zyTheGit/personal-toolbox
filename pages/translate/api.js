import { request } from "@/utils/request";
import { getRandomStr } from "@/utils/common";
import md5 from "@/utils/md5";
import { TRANSLATE_CONFIG } from "@/constant";

const { apiUrl, appid, secretKey } = TRANSLATE_CONFIG;

export const translateApi = (params) => {
  const { keywords: q, from, to } = params;
  const salt = getRandomStr();
  const sign = appid + q + salt + secretKey;
  const signResult = md5.hex_md5_32(sign);
  return request({
    url: apiUrl,
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
