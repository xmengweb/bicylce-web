import { useStore } from '@/store/user'
import { useDidShow,redirectTo } from '@tarojs/taro'

const useFlagShow = () => {
  const hasLogin = useStore((store) => store.hasLogin)

  useDidShow(()=>{
    if(!hasLogin){
      redirectTo({ url: '/pages/my/subpages/login/index' })
    }
  })
}

export default useFlagShow
