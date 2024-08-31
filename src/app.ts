import { PropsWithChildren } from 'react'
import { useLaunch, request, getStorageSync } from '@tarojs/taro'
import { useStore } from './store/user'
import './assets/font/iconfont.css'
import './app.less'
import './assets/icons/beginPoint.png'
import './assets/icons/endPoint.png'
import './assets/icons/bicycle.png'
import { useInterceptor } from './hooks/useInterceptor'

function App({ children }: PropsWithChildren<any>) {
  useInterceptor()
  const setBmr = useStore((store) => store.setBmr)
  const setLogin = useStore((store) => store.setLogin)
  const updatePic = useStore((store) => store.updatePic)
  const updateUserName = useStore((store) => store.updateUserName)
  const setuserId = useStore((store) => store.setuserId)

  useLaunch(() => {
    console.log('App launched.')
    async function getUser() {
      const res = await request({
        method: 'GET',
        url: 'https://api.xmcug.cn/user',
        header: {
          Authorization: `Bearer ${getStorageSync('token')}`,
        },
      })
      if (res.data.result.user_id) {
        setLogin(true)
        const { weight, height, age, sex } = res.data.result
        setBmr(weight, height, age, sex)
        updatePic(res.data.result.head_pic)
        updateUserName(res.data.result.username)
        setuserId(res.data.result.user_id)
      } else {
        setLogin(false)
      }
    }
    if (getStorageSync('token')) getUser()
  })

  // children 是将要会渲染的页面
  return children
}

export default App
