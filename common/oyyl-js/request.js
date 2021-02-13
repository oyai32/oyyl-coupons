import {
	msg
} from './util'

/**
 * @param {String} cloudFnName
 * @param {String} operation  操作类型（增删改查）
 * @param {Object} data 请求参数
 * @param {Object} ext 附加参数
 */
export const request = (cloudFnName, operation, data = {}, ext = {}) => {
	return new Promise((resolve, reject) => {
		if (ext.showLoading !== false) {
			uni.showLoading()
		}
		uniCloud.callFunction({
			name: cloudFnName,
			data: {
				operation,
				data
			}
		}).then(res => {
			if (ext.showLoading !== false) {
				uni.hideLoading()
			}
			resolve(res.result.data);
		}).catch((err) => {
			if (ext.showLoading !== false) {
				uni.hideLoading()
			}
			reject(err);
		})
	})
}
