import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		userInfo: {}
	},
	getters: {
		userId(state) {
			return state.userInfo.id || null;
		}
	},
	mutations: {
		//更新state数据
		setStateAttr(state, param) {
			if (param instanceof Array) {
				for (let item of param) {
					state[item.key] = item.val;
				}
			} else {
				state[param.key] = param.val;
			}
		}
	},
	actions: {
		async setUserData({
			state,
			commit
		}, data) {
			commit('setStateAttr', {
				key: 'userInfo',
				val: data
			})
			uni.setStorageSync('userInfo', data);
		},
		logout({
			state,
			commit
		}) {
			commit('setStateAttr', {
				key: 'userInfo',
				val: {}
			})
			uni.removeStorageSync('userInfo');
		}
	}
})


export default store
