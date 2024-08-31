import { View, Text } from '@tarojs/components'
import { Avatar } from '@nutui/nutui-react-taro'
import './index.less'

interface IProp {
  head_pic: string
  username: string
  text_content: string
  time: string
}

export default function CommentCard({ head_pic, username, text_content, time }: IProp) {
  return (
    <View className="comment-card">
      <View className="header">
        <Avatar size="small" src={head_pic} />
        <Text className="name">{username}</Text>
      </View>
      <View className="text-content">{text_content}</View>
      <View className="time">{time}</View>
    </View>
  )
}
