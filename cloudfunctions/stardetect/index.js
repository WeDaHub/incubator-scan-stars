// 云函数入口文件
const cloud = require('wx-server-sdk');
const tencentcloud = require('tencentcloud-sdk-nodejs');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  console.log({ event, context });

  const TiiaClient = tencentcloud.tiia.v20190529.Client;
  const clientConfig = {
    credential: {
      secretId: '',
      secretKey: '',
    },
    region: 'ap-guangzhou',
    profile: {
      httpProfile: {
        endpoint: 'tiia.tencentcloudapi.com',
      },
    },
  };

  const client = new TiiaClient(clientConfig);
  const params = {
    ImageUrl: event.ImageUrl,
  };

  return await client.DetectCelebrity(params);
};
