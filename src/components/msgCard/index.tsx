import { View, Image, Text } from '@tarojs/components'
import { navigateTo, eventCenter, showShareMenu, useShareAppMessage } from '@tarojs/taro'
import classNames from 'classnames'
import moment from 'moment'
import { IconFont, Comment, ArrowRight, HeartFill, Heart, Share } from '@nutui/icons-react-taro'
import { Avatar, Button } from '@nutui/nutui-react-taro'
import { IRecordInfo } from '../recordCard'
import './index.less'

export interface IMsgProps {
  userName: string
  avatarSrc: string
  createdAt: string
  title: string
  content: string
  imgUrls: string[]
  recordInfo: IRecordInfo | undefined
  commentCount: number
  likeCount: number
  postId: number
  isLikedByUser: boolean
}

interface IProp extends IMsgProps {
  likePost: (id: number) => void
}

export default function MsgCard(props: IProp) {
  const {
    isLikedByUser,
    userName,
    avatarSrc,
    createdAt,
    title,
    content,
    imgUrls,
    commentCount,
    likeCount,
    recordInfo,
    likePost,
    postId,
  } = props
  const className = classNames('cmpts-msg-card')

  useShareAppMessage(() => {
    return {
      title: `分享了一个帖子内容:${title.slice(0, 5)}...`,
      path: `/pages/index/subpages/readPost/index?id=${props.postId}`,
    }
  })

  function handleComment() {
    navigateTo({
      url: `/pages/index/subpages/readPost/index?id=${props.postId}&comefrom=comment`,
    })
  }

  return (
    <>
      <View className={className}>
        <View className="head">
          <Avatar size="normal" src={avatarSrc} />
          <View className="info">
            <View className="title">{userName}</View>
            <View className="location">{moment(new Date(createdAt)).format('MM-DD HH:mm')}</View>
          </View>
        </View>
        <View
          className="content"
          onClick={() => {
            navigateTo({
              url: '/pages/index/subpages/readPost/index?id=' + props.postId,
            })
          }}
        >
          <View className="title">{title}</View>
          <View className="text" style={{ marginBottom: '10px' }}>
            {content}
          </View>
          <View className="imgs">
            {imgUrls.map((url, index) => (
              <Image
                key={index}
                mode="aspectFill"
                style={{ width: '120px', height: '120px', borderRadius: '16px' }}
                src={url}
              />
            ))}
          </View>
          {recordInfo && (
            <View
              className="guiji-info"
              onClick={() => {
                navigateTo({
                  url: '/pages/bicycle/subpages/detail/index',
                  success: function () {
                    setTimeout(() => {
                      // 通过eventChannel向被打开页面传送数据
                      eventCenter.trigger('acceptDataFromOpenerPage', { ...recordInfo, isOther: true })
                    }, 100)
                  },
                })
              }}
            >
              <View className="title">
                <IconFont
                  fontClassName="iconfont"
                  classPrefix="icon"
                  name="lvzhou_lujing_guiji"
                  size={16}
                  color="#74e533"
                  style={{ marginRight: '3px' }}
                />
                轨迹记录
              </View>
              <ArrowRight size="12" style={{ position: 'absolute', top: '10px', right: '10px' }} />
              <View className="date">
                <View className="length">
                  <Text>
                    <Text className="number">{recordInfo.distance.toFixed(2)}</Text>km
                  </Text>
                  <Text className="name">里程距离</Text>
                </View>
                <View className="sudu">
                  <Text>
                    <Text className="number">{recordInfo.average_speed.toFixed(2)} </Text> km/h
                  </Text>
                  <Text className="name">平均速度</Text>
                </View>
                <View className="zuikuaisudu">
                  <Text>
                    <Text className="number">{recordInfo.fatest_speed.toFixed(2)} </Text> km/h
                  </Text>
                  <Text className="name">最快速度</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        <View className="bottom">
          <View
            className="share bottom-icon"
            onClick={() =>
              showShareMenu({
                withShareTicket: true,
              })
            }
          >
            <Button icon={<Share size={20} />} openType="share" fill="none">
              分享
            </Button>
          </View>
          <View className="comment bottom-icon" onClick={handleComment}>
            <Comment size={20} />
            {commentCount && commentCount > 0 ? commentCount : '评论'}
          </View>
          <View className="like bottom-icon" onClick={() => likePost(postId)}>
            {isLikedByUser ? <HeartFill size={20} color="red" /> : <Heart size={20} />}
            {likeCount && likeCount > 0 ? likeCount : '点赞'}
          </View>
        </View>
      </View>
    </>
  )
}
