<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.initLogin();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			async initLogin() {
				const userInfo = uni.getStorageSync('userInfo');
				if (userInfo) {
					this.$store.dispatch('setUserData', userInfo)
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import './common/oyyl-styles/base.scss';
</style>
