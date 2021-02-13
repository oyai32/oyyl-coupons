<template>
	<uni-popup ref="uniPopup" :maskClick="false">
		<view class="helpBox column">
			<view class="closeBtn" @click="close">×</view>
			<view class="inviter row mb5">
				<image :src="inviter.avatar"></image>
				{{inviter.nickname}}:
			</view>
			<view class="mb5">我正在领取<text class="c-primary">{{coupon.price}}元</text>现金券</view>
			<view class="imgBox">
				<image class="img" :src='couponImg'></image>
			</view>
			<view class="coupon mb5">
				<view v-show="!isHelped&&!isMine" class="tc">~请帮我助力~</view>
				<view v-show="isHelped&&!isMine" class="tc">~感谢你的助力~</view>
				<view v-show="!isHelped&&notNeed" class="tc">~我已经拿到券啦，还是谢谢你哦~</view>
			</view>
			<button v-show="!isHelped&&!isMine" class="btn help" open-type="getUserInfo" :data-help-id="helpInfo._id"
			 @getuserinfo="clickHelp">
				点击助力
			</button>
			<button v-show="isMine" class="btn help" data-name="shareBtn" @click="close" :data-id='helpInfo._id' :data-count="helpInfo.need_count"
			 open-type="share">邀请人助力
			</button>
			<view v-show="isHelped&&!isMine" class="btn" @click="close">关 闭</view>
		</view>
	</uni-popup>
</template>

<script>
	import loginMpWx from '@/common/oyyl-mixin/login-mp-wx.js'
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import couponImg from '@/static/coupon.png'
	import {
		request
	} from '@/common/oyyl-js/request.js'

	export default {
		mixins: [loginMpWx], // 使用mixin (在main.js注册全局组件)
		components: {
			uniPopup
		},
		props: {
			helpId: String
		},
		data() {
			return {
				inviter: {
					nickname: ''
				},
				couponImg,
				coupon: {
					price: '',
					desc: ''
				},
				helpInfo: {} // 助力信息
			};
		},
		watch: {
			helpId(id) {
				this.open()
				id && this.getCouponInfo(id);
			}
		},
		computed: {
			userId() {
				return this.$store.getters.userId
			},
			// 是否已经助力过
			isHelped() {
				// 当前用户id
				const helps = this.helpInfo.helps || []
				// 助力者中有当前用户
				return helps.some(cur => cur.user_id === this.userId)
			},
			// 是否打开了自己的邀请
			isMine() {
				return this.helpInfo.user_id === this.userId
			},
			notNeed() {
				return this.helpInfo.state !== 0
			}
		},
		methods: {
			open() {
				this.$refs.uniPopup.open();
			},
			close() {
				this.$refs.uniPopup.close();
			},
			// 查询助力相关信息
			async getCouponInfo(userCouponId) {
				// 邀请用户的信息、优惠券信息
				const res = await request('oyyl-coupons', 'queryInvitedHelp', {
					_id: userCouponId
				});
				const userCoupon = res[0];
				if (userCoupon) {
					this.inviter = userCoupon.user[0];
					this.coupon = userCoupon.coupon[0];
					this.helpInfo = userCoupon
				}
			},
			// 点击助力
			async clickHelp(userInfoData) {
				if (!this.userId) {
					// 若该用户未登录过，则需要先获取用户信息，并存起来
					await this.mpWxGetUserInfo(userInfoData);
				}

				// 将更新用户邀请表
				const {
					helpId
				} = userInfoData.target.dataset

				const {
					nickName: nickname,
					avatarUrl: avatar
				} = userInfoData.detail.userInfo
				// 助力者信息
				const userInfo = {
					nickname,
					avatar,
					user_id: this.userId
				}
				try {
					const res = await request('oyyl-coupons', 'updateUserCoupons', {
						userCouponId: helpId,
						userInfo
					}, {
						showLoading: true
					});
					this.$util.msg(res.msg);
					this.helpInfo.helps.push(userInfo)
				} catch (e) {
					this.$util.msg('请稍后再试！');
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.helpBox {
		position: fixed;
		z-index: 2;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		margin: auto 30px;
		height: 230px;
		padding: 20px;
		background: #fff;
		border-radius: 10px;

		.closeBtn {
			position: absolute;
			right: -10px;
			top: -10px;
			width: 30px;
			height: 30px;
			background: #fff;
			border-radius: 50%;
			border:3px solid #7F7F7F;
			text-align: center;
			line-height: 30px;
			font-size:20px;
			color:#7F7F7F;
		}

		.inviter {
			height: 60rpx;
			text-align: center;

			image {
				width: 50rpx;
				height: 50rpx;
				border-radius: 50%;
				margin-right: 10rpx;
			}
		}

		.imgBox {
			display: flex;
			justify-content: center;

			.img {
				height: 100px;
				width: 100px;
			}

		}


		.btn {
			border: 1rpx solid $uni-color-primary;
			height: 80rpx;
			line-height: 80rpx;
			text-align: center;
			width: 100%;
			color: $uni-color-primary;
			background: #fff;
			border-radius: 40rpx;
			margin-top: 10px;

			&.help {
				background: $uni-color-primary;
				color: white;
			}

			&::after {
				border: none !important;
			}
		}
	}
</style>
