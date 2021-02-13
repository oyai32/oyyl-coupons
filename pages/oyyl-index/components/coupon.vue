<template>
	<view class="coupon-item">
		<!--左侧券面-->
		<view class="coupon-money">
			<view class="layof">￥{{item.price}}</view>
			<view class="demand">{{item.limitDesc}}</view>
		</view>
		<!--左侧券面 end-->
		<view class="shareLab">
			<view>{{item.desc}}</view>
			<!--人数统计-->
			<view>
				<view class="mb10 f14" v-if="couponState.state==='need'">邀请
					<text class="c-primary f16 fb">{{item.needCount}}</text>
					人可得
				</view>
				<view class="mb10 f14" v-if="couponState.state==='inviting'">还差
					<text class="c-primary f16 fb">{{remainNum}}</text>
					人
				</view>
			</view>
			<!--人数统计 end-->
			<!--操作提示-->
			<view class="btnLab">
				<!--分享型按钮-->
				<button v-if="couponState.type==='share'" :class="['get-btn',couponState.className||'']" data-name="shareBtn"
				 :data-id='item.id' :data-count="item.needCount" open-type="share">{{couponState.name}}
				</button>
				<!--文字-->
				<text v-if="couponState.type==='text'" class="c-grey">{{couponState.name}}</text>
				<!--普通按钮-->
				<button v-if="couponState.type==='btn'" :class="['get-btn',couponState.className||'']" data-id='item.id' @click="couponState.fn">
					{{couponState.name}}
				</button>
			</view>
			<!--操作提示 end-->
		</view>
	</view>
</template>

<script>
	export default {
		components: {},
		// 接受oyyl-index传来的方法
		inject: ['insertUserCoupon'],
		props: {
			item: {
				type: Object,
				default: function() {
					return {}
				}
			}
		},
		data() {
			return {}
		},
		computed: {
			couponState() {
				// 显示状态：notNeed 不需要邀请  need 需要但还没邀请  inviting 正在邀请  canUse 已领取未使用 used 已使用
				const {
					needCount,
					state
				} = this.item
				if (needCount === 0 && !state) return {
					state: 'notNeed',
					type: 'btn',
					className: 'bg',
					name: '立即领券',
					fn: this.getCoupon
				};
				switch (state) {
					case 0:
						return {
							state: 'inviting',
							type: 'share',
							name: '分享领券'
						};
					case 1:
						return {
							state: 'canUse',
							type: 'btn',
							className: 'bg',
							name: '立即使用',
							fn: this.useCoupon
						};
					case 2:
						return {
							state: 'used',
							type: 'text',
							name: '已使用'
						};
					default:
						return {
							state: 'need',
							type: 'share',
							className: 'bg',
							name: '邀请好友'
						}
				}
			},
			// 剩余数量
			remainNum() {
				const {
					needCount,
					helps
				} = this.item
				return needCount - helps.length
			},
			userId() {
				return this.$store.getters.userId;
			}
		},
		methods: {
			// 领取优惠券(不需要邀请的券，可直接领取)
			async getCoupon() {
				// 先判断是否登录
				if (!this.$util.isLogin()) {
					return;
				}
				const {
					id,
					needCount
				} = this.item
				// 能直接领取的券，state直接改为1
				await this.insertUserCoupon(id, needCount, this.userId, 1)
				this.$util.msg('领取成功，可前往使用');
			},
			// 使用优惠券
			useCoupon() {
				console.log('useCoupon', this.item)
				this.$util.msg('已点击正在使用');
			}
		}
	}
</script>

<style lang='scss'>
	.coupon-item {
		display: flex;
		border-radius: 10rpx;
		margin-bottom: 20rpx;
		border: 1px solid #eeeeee;
		position: relative;
		background: white;

		.coupon-money {
			width: 35%;
			height: 170rpx;
			padding: 30rpx 20rpx 30rpx 0;
			display: flex;
			justify-content: space-around;
			flex-direction: column;
			text-align: center;
			background: $uni-color-primary;
			color: #fff;
			border-radius: 10rpx 0 0 10rpx;
			border-right: 2px dotted white;

			.demand {
				font-size: 28rpx;
			}

			.layof {
				width: 100%;
				height: 60rpx;
				font-size: 60rpx;
				margin-bottom: 10rpx;
				font-weight: bold;
			}
		}

		.shareLab {
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			align-items: center;
			padding: 10px;

			.get-btn {
				padding: 0 40rpx;
				text-align: center;
				border-radius: 40rpx;
				color: $uni-color-primary;
				border: 1px solid red;
				border: 1px solid $uni-color-primary;
				font-size: 28rpx;
				background-color: white;
				height: 65rpx;
				line-height: 65rpx;
				width: 200rpx;

				&.bg {
					color: white;
					background-color: $uni-color-primary;
				}

			}
		}
	}

	.c-primary {
		color: $uni-color-error;
	}
</style>
