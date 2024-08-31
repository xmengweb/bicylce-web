import { View, Text } from '@tarojs/components'
import classNames from 'classnames'
import { Avatar } from '@nutui/nutui-react-taro'
import { ArrowRight } from '@nutui/icons-react-taro'
import './index.less'

interface IProps {
  size?: string
  name?: string
  pic?: string
  dontNeed?: boolean
  onClick?: () => void
}

export default function ManCard(props: IProps) {
  const {
    size = 'large',
    name = '未登录',
    pic = 'https://img.ixintu.com/download/jpg/20200807/d0c358d183132ba04ff9c09706145567_512_512.jpg',
    onClick = () => {},
    dontNeed
  } = props
  const className = classNames('cmpts-man-card', size)
  return (
    <>
      <View className={className} onClick={onClick}>
        <Avatar size={size} src={pic} />
        <Text className="cmpts-man-name">{name}</Text>
        {dontNeed || <ArrowRight style={{position:'absolute',right:'50px',top:'43%'}} />}
      </View>
    </>
  )
}
