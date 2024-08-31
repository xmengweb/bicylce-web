import { View, Text } from '@tarojs/components'
import {
  switchTab,
  login,
  request,
  getUserProfile,
  showLoading,
  hideLoading,
  setStorage,
  showToast,
} from '@tarojs/taro'
import { Avatar, Button } from '@nutui/nutui-react-taro'
import { useStore } from '@/store/user'
import './index.less'

definePageConfig({
  navigationBarTitleText: '登录悦动骑行',
})

export default function Login() {
  const setBmr = useStore((store) => store.setBmr)
  const setLogin = useStore((store) => store.setLogin)
  const setuserId = useStore((store) => store.setuserId)
  const updatePic = useStore((store) => store.updatePic)
  const updateUserName = useStore((store) => store.updateUserName)

  function handleLogin() {
    showLoading({
      title: '登录中',
    })
    getUserProfile({
      desc: '完善用户个人资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res0) => {
        // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
        const name = res0.userInfo.nickName
        const pic = res0.userInfo.avatarUrl
        login({
          success: async function (res) {
            if (res.code) {
              //发起网络请求
              const loginres = await request({
                method: 'POST',
                url: 'https://api.xmcug.cn/auth/onlogin',
                data: {
                  code: res.code,
                  wxHeadPic: pic,
                  wxUserName: name,
                },
              })
              updateUserName(loginres.data.data.user.username)
              updatePic(loginres.data.data.user.head_pic)
              const { weight, height, age, sex } = loginres.data.data.user
              setBmr(weight, height, age, sex)
              setLogin(true)
              setuserId(loginres.data.data.user.user_id)
              setStorage({
                key: 'token',
                data: loginres.data.data.token,
              })
              hideLoading()
              showToast({
                title: '登录成功',
                icon: 'success',
                duration: 2000,
              })
              switchTab({ url: '/pages/my/index' })
            } else {
              hideLoading()
              console.log('登录失败！' + res.errMsg)
            }
          },
          fail: () => {
            hideLoading()
          },
        })
      },
    })
  }

  return (
    <View className="login">
      <View className="info">
        <Avatar size="120" src="https://cugdemo.oss-cn-hangzhou.aliyuncs.com/logo.jpg" />
        <Text style={{ fontSize: '25px', color: 'black', fontWeight: 'bold', marginBottom: '8px' }}>悦动骑行</Text>
        <Text style={{ fontSize: '15px', color: '#8c8c8c' }}>开心骑行,{`  `}健康生活</Text>
      </View>
      <Button
        type="success"
        onClick={handleLogin}
        style={{ marginTop: '40px', width: '80%', height: '50px', fontSize: '18px' }}
      >
        微信授权一键登录
      </Button>
    </View>
  )
}
