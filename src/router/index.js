import Vue from 'vue'
import Router from 'vue-router'
import store from '../store'

Vue.use(Router)

const routes = [{
  name: 'index', // 首页
  path: '/',
  component: require('../app.vue')
}]

const router = new Router([{
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes
}])

// app中订单列表跳转
routes.beforeEach((to, from, next) => {
  if ((store.state.env === 'ios' || store.state.env === 'android') &&
    to.name === 'ordersListHours') {
    next('/ordersHours')
  } else {
    next()
  }
})

// 每次view切换判断登陆状态
routes.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.auth)) {
    // 如果to需要登录
    if (!store.state.user.auth) {
      // 如果没有登录，跳到登陆页
      next({
        name: 'usersLogin',
        query: { redirect: to.fullPath }
      })
    } else {
      // 如果已经登录
      if (store.state.user.name && store.state.user.tel && store.state.user.IDnumber) {
        // 如果姓名、电话、身份证信息完整
        next()
      } else {
        // 如果不完整，则跳到信息补充页面
        next({
          path: '/fastSignup',
          query: { redirect: to.fullPath }
        })
      }
    }
  } else {
    // 如果不需要登录
    next()
  }
})
// 拦截跳转，判断页面是否需要重新加载
routes.beforeEach((to, from, next) => {
  if (from.path) {
    // 非首次切换view
    if (store.state.env === 'ios' || store.state.env === 'android' || (store.state.env === 'wechat' && (to.name === 'pay' || to.name === 'ewalletRecharge' || to.name === 'ewalletRechargeActivity' || to.name === 'ewalletRechargeCustom' || to.name === 'ewalletRechargeCustomActivity'))) {
      // 在ios或者android app容器中
      // 在微信中的支付页面
      const Url = require('url')
      window.location.assign(to.path + Url.format({ query: this.app.query }))
    } else {
      next()
    }
  } else {
    // 进入app后第一次切换view
    next()
  }
})
// 如果在微信中，每次切换view需要重新获取签名
// routes.afterEach(() => {
//   if (store.state.env === 'wechat') {
//     require('scripts/common/getJSSign')()
//   }
// })
export default router
