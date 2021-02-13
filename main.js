import Vue from 'vue'
import App from './App'
import store from './store'
import * as util from '@/common/oyyl-js/util.js'

Vue.prototype.$util = util
Vue.prototype.$store = store

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
	...App
})
app.$mount()
