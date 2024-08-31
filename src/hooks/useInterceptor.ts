import Taro, { getStorageSync } from '@tarojs/taro';
import { useStore } from "@/store/user"
import { useEffect } from 'react';

// const dontNeedToken = [
//   { url: 'https://api.xmcug.cn/auth/onlogin', method: 'POST' },
//   { url: 'https://api.xmcug.cn/posts', method: 'GET' },
//   { url: 'https://api.xmcug.cn/user', method: 'GET' },
//   { url: 'https://restapi.amap.com/v3/weather/weatherInfo', method: 'GET' },
//   { url: 'https://api.xmcug.cn/stat', method: 'GET' },
//   { url: 'https://api.xmcug.cn/ride/today', method: 'GET' },
// ]

// 创建一个自定义Hook来封装拦截器逻辑
function useInterceptor() {
  const hasLogin = useStore((store) => store.hasLogin)

  useEffect(() => {
    const interceptor: Taro.interceptor = function (chain) {
      const requestParams = chain.requestParams
      if (hasLogin) {
        if (!requestParams.header) {
          requestParams.header = {}
        }
        requestParams.header.Authorization = `Bearer ${getStorageSync('token')}`
      }
      return chain.proceed(requestParams)
    }

    Taro.addInterceptor(interceptor)

    // 清理函数，如果组件卸载，移除拦截器
    return () => {
      Taro.cleanInterceptors()
    }
  }, [hasLogin]) // 依赖数组确保hasLogin变化时重新设置拦截器
}

export {
  useInterceptor
}
