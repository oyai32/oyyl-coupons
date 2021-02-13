import {
	request
} from '@/common/oyyl-js/request'
export default {
	methods: {
		// 微信小程序登录
		async mpWxLogin(userInfoData) {
			await this.mpWxGetUserInfo(userInfoData)
			this.$util.msg('登陆成功');
			setTimeout(() => {
				uni.navigateBack();
			}, 1000)
		},
		// 获取用户信息
		mpWxGetUserInfo(userInfoData) {
			return new Promise((resolve, reject) => {
				if (!userInfoData.detail.userInfo) {
					reject(new Error('未拿到用户信息'))
				}
				this.$util.throttle(async () => {
					const [loginErr, loginData] = await uni.login({
						provider: 'weixin'
					})
					const [err, userData] = await uni.getUserInfo();
					const res = await request('oyyl-user', 'loginByWeixin', {
						code: loginData.code,
						encryptedData: userData.encryptedData,
						iv: userData.iv,
						userInfo: JSON.parse(userData.rawData)
					}, {
						showLoading: true
					});
					if (res.status === 0) {
						this.$util.msg(res.msg);
						reject(new Error(res.msg))
					} else {
						resolve(res.userInfo)
					}
				})
			}).then(userInfo => {
				this.$store.dispatch('setUserData', userInfo);
				return userInfo
			})
		}
	}
}
