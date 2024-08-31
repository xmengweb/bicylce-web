import { View, Text } from '@tarojs/components'
import { Avatar } from '@nutui/nutui-react-taro'
import classNames from 'classnames'
import './index.less'

interface IProps {
  src: string
}

export default function MsgListCard(props: IProps) {
  const { src } = props
  const className = classNames('cmpts-msglist-card')
  return (
    <>
      <View className={className}>
        <View className="manInfoCard">
          <Avatar size="normal" src={src} />
          <View className="manInfo">
            <Text>姓名</Text>
            <Text>昨天 12:44 湖北</Text>
          </View>
          <View className="gz">关注</View>
        </View>
        <View className="des">描述</View>
        <View className="imgs"></View>
        <View className="deal">
          <View>分享</View>
          <View>评论</View>
          <View>点赞</View>
        </View>
      </View>
    </>
  )
}
