<template>
	<view class="pageBox">
		<!--优惠券列表-->
		<coupon v-for="item of couponList" :key="item._id" :item="item"></coupon>
		<!--优惠券列表 end-->
		
		<!--助力弹窗-->
		<invited-help :help-id="userCouponId"></invited-help>
		<!--助力弹窗 end-->
	</view>
</template>

<script>
	import coupon from './components/coupon.vue';
	import invitedHelp from './components/invited-help.vue'

	import {
		request
	} from '@/common/oyyl-js/request.js'

	export default {
		components: {
			coupon,
			invitedHelp
		},
		// 通过provide把方法传到coupon组件中使用
		provide() {
			return {
				insertUserCoupon: this.insertUserCoupon
			}
		},
		data() {
			return {
				couponList: [],
				userCouponId: ''
			}
		},
		onLoad(options) {
			// 从链接中拿到转发优惠券记录的id（如果是从邀请信息中进来的，则有该id）
			this.userCouponId = options.userCouponId
		},
		mounted() {
			this.selData();
		},
		// 注：分享方法是生命周期函数，不能放在子组件中使用
		async onShareAppMessage(e) {
			// 若是菜单分享，则不做处理
			if (e.from === 'menu') {
				this.$util.msg('菜单分享！');
				return;
			}

			// 先判断是否登录
			if (!this.$util.isLogin()) {
				return;
			}
			//  拿到优惠券的id和需要助力的人数
			const {
				id: couponId,
				count: needCount
			} = e.target.dataset
			const userId = this.userId;
			if (couponId && userId) {
				// 插入数据库,返回该分享记录的id
				const id = await this.insertUserCoupon(couponId, needCount, userId, 0)
				return {
					title: '我正在抢现金券，拜托帮我助力',
					path: '/pages/oyyl-index/oyyl-index?userCouponId=' + id,
					imageUrl: '../../static/logo.png'
				}
			}
		},
		methods: {
			async selData() {
				// 查所有的优惠券数据
				const selAllCoupons = await request('oyyl-coupons', 'query', {});
				
				// 获取该用户所有优惠券的记录
				const getUserCoupons = await request('oyyl-coupons', 'queryUserCoupons', {
					user_id: this.userId
				});

				let [couponList, userCoupons] = await Promise.all([selAllCoupons, getUserCoupons])

				// 将当前用户的优惠券转成map格式
				let userCouponsMap = {}; // key为优惠券code
				userCoupons.forEach(cur => {
					userCouponsMap[cur.coupon_id] = {
						helps: cur.helps,
						state: cur.state
					}
				})
				this.couponList = couponList.map(cur => {
					let userCoupons = userCouponsMap[cur._id];
					return {
						id: cur._id,
						price: cur.price,
						needCount: cur.need_count, //需要人数
						desc: cur.desc,
						endDate: cur.end_date,
						limitDesc: cur.type === 1 ? '无门槛' : '满' + cur.limit_num + '可用',
						state: userCoupons ? userCoupons.state : null, // null为该用户没有分享过
						helps: userCoupons ? userCoupons.helps : [] // 已助力人
					}
				})
			},
			/**
			 * 插入用户优惠券记录
			 * @param {Object} couponId 优惠券id
			 * @param {Object} needCount 需要邀请的人数
			 * @param {Object} userId 用户id
			 * @param {Object} state 状态  0 未领取  1 已领取未使用 2 已使用
			 */
			async insertUserCoupon(couponId, needCount, userId, state) {
				const res = await request('oyyl-coupons', 'insertUserCoupons', {
					coupon_id: couponId,
					user_id: userId,
					state,
					need_count: needCount,
					helps: []
				});
				setTimeout(() => {
					this.selData(); // 更新完数据后再查询一遍
				}, 1000)
				return;
			}
		},
		computed: {
			userId() {
				return this.$store.getters.userId
			}
		}
	}
</script>

<style lang='scss' scoped>
	.pageBox {
		padding: 20rpx;
	}
</style>
