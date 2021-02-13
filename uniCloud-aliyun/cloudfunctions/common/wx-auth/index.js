'use strict';
/**
 * 微信相关业务
 */
const wxConfigMp = {
    appId: '',
    secret: '',
}

const crypto = require('crypto')

/**
 * 微信小程序授权登录获取session_key
 * @param {Object} options
 * @param {String} options.code 小程序code
 *
 * @param {String} options.encryptedData 可选，存在encryptedData和iv时返回用户信息（包含unionid）
 * @param {String} options.iv 可选
 */
const mpWxGetSessionKey = async options => {
	const {
		code,
		encryptedData,
		iv
	} = options;
	const {
		appId,
		secret
	} = wxConfigMp;

	let url = 'https://api.weixin.qq.com/sns/jscode2session';
	url += '?appid=' + appId;
	url += '&secret=' + secret;
	url += '&js_code=' + code + '&grant_type=authorization_code';
	const res = await uniCloud.httpclient.request(url, {
		method: 'GET',
		dataType: 'json'
	})

	const data = res.res.data;
	if (data.errcode) {
		return {
			status: 0,
			msg: 'appid错误',
			data,
			appId
		}
	}
	if (!data.session_key) {
		return {
			status: 0,
			msg: '获取微信授权失败',
			data
		}
	}
	if (!encryptedData || !iv) {
		return {
			status: 1,
			openid: data.openid,
			session_key: data.session_key
		}
	}
	const userInfo = WXBizDataCrypt({
		sessionKey: data.session_key,
		encryptedData,
		iv
	})
	return {
		status: 1,
		session_key: data.session_key,
		userInfo
	}
}

/**
 * 解密encryptedData 获取unionid
 * @param {Object} options
 * @param {String} options.sessionKey
 * @param {String} options.encryptedData
 * @param {String} options.iv
 */
const WXBizDataCrypt = options => {
	const appId = wxConfigMp.appId;
	let {
		sessionKey,
		encryptedData,
		iv
	} = options;
	sessionKey = new Buffer(sessionKey, 'base64')
	encryptedData = new Buffer(encryptedData, 'base64')
	iv = new Buffer(iv, 'base64')

	let decoded;
	try {
		// 解密
		let decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
		// 设置自动 padding 为 true，删除填充补位
		decipher.setAutoPadding(true)
		decoded = decipher.update(encryptedData, 'binary', 'utf8')
		decoded += decipher.final('utf8')
		decoded = JSON.parse(decoded)
	} catch (err) {
		throw new Error('Illegal Buffer')
	}
	if (decoded.watermark.appid !== appId) {
		throw new Error('Illegal Buffer')
	}
	return decoded
}


module.exports = {
	mpWxGetSessionKey
}
