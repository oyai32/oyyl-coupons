'use strict';
const {
	mpWxGetSessionKey
} = require('wx-auth')

const db = uniCloud.database();
const collection = db.collection('oyyl-user')

exports.main = async (event, context) => {
	const {
		operation,
		data
	} = event;
	// 通过微信登录
	if (operation === 'loginByWeixin') {
		// 获取openid
		const res = await mpWxGetSessionKey(data)
		const {userInfo}=res
		const {
			openId,
			nickName: nickname,
			gender,
			avatarUrl: avatar
		} = userInfo;
		// 通过openid查库里的数据
		const result = await collection.where({
			wx_openid: openId
		}).get()
		let user = result.data
		let id = null;
		// 如果已经有了，则更新库里的信息
		if (result.data.length > 0) {
			id = result.data[0]._id
			const r = await collection.doc(id).update({
				nickname,
				gender,
				avatar
			})
		} else {
			// 若没有，则插入该用户数据
			const r = await collection.add({
				nickname,
				gender,
				avatar,
				wx_openid: openId
			})
			id = r.id
		}
		return {
			data:{
				status: 1,
				userInfo: {
					id,
					nickname,
					gender,
					avatar
				}
			}
		}
	}
	return {
		data:{
			status: 0,
			msg: '获取用户失败'
		}
	}
};
