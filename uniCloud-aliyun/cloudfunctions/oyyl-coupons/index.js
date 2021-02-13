'use strict';
const db = uniCloud.database();
const collection = db.collection('oyyl-coupons')
const userCouponCol = db.collection('oyyl-user-coupons')

const _insertData = async (data) => {
	// 先查数据库里是否有该记录
	let res = await userCouponCol.where({
		coupon_id: data.coupon_id,
		user_id: data.user_id
	}).field({
		'_id': true
	}).get()

	if (res.data.length > 0)
		return res.data[0]._id
	// 没记录则插入，且返回插入后的id
	res = await userCouponCol.add(data)
	return res.id
}

// 更新助力者
const _updateData = async (data) => {
	const {
		userCouponId,
		userInfo
	} = data;
	// 查该条记录当前的状态和助力人信息，若已助力或助力完毕，则不更新表
	// 若未助力完毕，且助力用户数=需助力数-1，则助力用户加1并更新助力状态
	// 若未助力完毕，且助力用户数<需助力数-1，则助力用户加1
	let userCoupon = await userCouponCol.doc(userCouponId).get()
	userCoupon = userCoupon.data[0]
	if (userCoupon.state !== 0) {
		return {
			success: false,
			msg: '助力人数已满！'
		}
	}
	let flag = userCoupon.helps.some(cur => cur.user_id === userInfo.user_id)
	if (flag) {
		return {
			success: false,
			msg: '你已经助力过咯！'
		}
	}
	// 未助力过且还能助力
	// 进入事务
	const transaction = await db.startTransaction()
	try {
		const {
			need_count: needCount,
			helps
		} = userCoupon
		const nowCount = helps.length;
		helps.push(userInfo)
		// 只差本用户
		if (nowCount + 1 === needCount) {
			await transaction.collection('oyyl-user-coupons').doc(userCouponId).update({
				helps,
				state: 1
			})
		} else {
			await transaction.collection('oyyl-user-coupons').doc(userCouponId).update({
				helps
			})
		}
		// 查询插入用户后的助力者人数
		const endRes = await transaction.collection('oyyl-user-coupons').doc(userCouponId).get()

		// 助力人数不能超过所需人数
		if (endRes.data.helps.length <= needCount) {
			await transaction.commit()
			return {
				success: true,
				msg: '助力成功'
			}
		} else {
			// 超过人数则回滚
			await transaction.rollback(-100)
			return {
				success: false,
				msg: '助力人数已满！'
			}
		}

	} catch (e) {
		await transaction.rollback()
		console.error(`transaction error`, e)
		return {
			success: false,
			error: e,
			msg: '助力失败！'
		}
	}
}

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const {
		operation,
		data
	} = event;
	let res = null
	switch (operation) {
		// 查询所有未删除的优惠券数据
		case 'query':
			return await collection.where({
				is_del: false
			}).orderBy("_id", "asc").get();
		//  查询该用户相关的所有优惠券
		case 'queryUserCoupons':
			return await userCouponCol.where(data).get()
		// 插入用户优惠券表
		case 'insertUserCoupons':
			res = await _insertData(data)
			break;
		// 更新用户优惠券表
		case 'updateUserCoupons':
			res = await _updateData(data)
			break;
		// 查询助力领券的邀请者和券信息
		case 'queryInvitedHelp':
			return await userCouponCol
				.aggregate()
				.match(data)
				.lookup({
					from: 'oyyl-user', // 关联用户表拿邀请者信息
					localField: 'user_id',
					foreignField: '_id',
					as: 'user',
				})
				.lookup({
					from: 'oyyl-coupons', // 关联优惠券表拿优惠券信息
					localField: 'coupon_id',
					foreignField: '_id',
					as: 'coupon',
				})
				.end()
	}
	return {
		data: res
	}
};
