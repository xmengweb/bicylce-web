import { View, Text } from '@tarojs/components'
import moment from 'moment'
import { eventCenter, getStorageSync, navigateTo, request, useLoad, useRouter } from '@tarojs/taro'
import { Button, Avatar, Image, TextArea, Popup } from '@nutui/nutui-react-taro'
import { IconFont, ArrowRight, Edit, Comment, HeartFill, Heart, Share } from '@nutui/icons-react-taro'
import { useState } from 'react'
import CommentCard from '@/components/commentCard'
import { IMsgProps } from '@/components/msgCard'
import { useStore } from '@/store/user'
import './index.less'

definePageConfig({
  navigationBarTitleText: '动态',
  enableShareAppMessage: true,
})

export default function ReadPost() {
  const router = useRouter()
  const hasLogin = useStore((store) => store.hasLogin)
  const [postDetail, setPostDetail] = useState<IMsgProps>()
  const [comments, setComments] = useState<any[]>([])
  const [comment, setComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [showBottom, setShowBottom] = useState(false)
  // const userId = useStore((store) => store.userId)

  async function getDetail(id, isLogin) {
    try {
      const res = await request({
        method: 'GET',
        url: `https://api.xmcug.cn/posts/${id}/detail`,
        header: {
          Authorization: `Bearer ${getStorageSync('token')}`,
        },
        data: {
          isLogin,
        },
      })
      const { user, createdAt, title, content, imgUrls, rides, commentCount, likeCount, post_id, isLikedByUser } =
        res.data.result
      setPostDetail({
        userName: user.username,
        avatarSrc: user.head_pic,
        createdAt,
        title,
        content,
        imgUrls,
        recordInfo: rides,
        commentCount,
        likeCount,
        postId: post_id,
        isLikedByUser,
      })
      setIsLiked(isLikedByUser)
      setComments(res.data.result.comments)
    } catch (error) {
      console.log(error)
    }
  }

  async function submitComment() {
    await request({
      method: 'POST',
      url: `https://api.xmcug.cn/posts/${router.params.id}/comments`,
      header: {
        Authorization: `Bearer ${getStorageSync('token')}`,
      },
      data: {
        commentContent: comment,
      },
    })
    getDetail(router.params.id, hasLogin)
    setShowBottom(false)
  }

  function handleLike() {
    async function patchLike() {
      const res = await request({
        method: 'PATCH',
        url: `https://api.xmcug.cn/posts/${router.params.id}/like`,
        header: {
          Authorization: `Bearer ${getStorageSync('token')}`,
        },
      })
      if (res.data.success) {
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        if (postDetail) {
          const likeCount = postDetail.likeCount + (newIsLiked ? 1 : -1)
          setPostDetail({ ...postDetail, likeCount })
        }
      }
    }
    patchLike()
  }

  useLoad(() => {
    console.log('load')

    getDetail(router.params.id, hasLogin)
    if (router.params.comefrom === 'comment') {
      setShowBottom(true)
    }
  })

  return (
    <View className="read-post-page">
      <View className="head">
        <Avatar size="normal" src={postDetail?.avatarSrc} />
        <View className="info">
          <View className="title">{postDetail?.userName}</View>
          <View className="location">{postDetail && moment(new Date(postDetail.createdAt)).format('MM-DD HH:mm')}</View>
        </View>
      </View>
      <View className="content">
        <View className="title">{postDetail?.title}</View>
        <View className="text" style={{ marginBottom: '10px' }}>
          {postDetail?.content}
        </View>
        {postDetail?.recordInfo && (
          <View
            className="guiji-info"
            onClick={() => {
              navigateTo({
                url: '/pages/bicycle/subpages/detail/index',
                success: function () {
                  setTimeout(() => {
                    // 通过eventChannel向被打开页面传送数据
                    eventCenter.trigger('acceptDataFromOpenerPage', { ...postDetail?.recordInfo, isOther: true })
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
                  <Text className="number">{postDetail?.recordInfo.distance.toFixed(2)}</Text>km
                </Text>
                <Text className="name">里程距离</Text>
              </View>
              <View className="sudu">
                <Text>
                  <Text className="number">{postDetail?.recordInfo.average_speed.toFixed(2)} </Text> km/h
                </Text>
                <Text className="name">平均速度</Text>
              </View>
              <View className="zuikuaisudu">
                <Text>
                  <Text className="number">{postDetail?.recordInfo.fatest_speed.toFixed(2)} </Text> km/h
                </Text>
                <Text className="name">最快速度</Text>
              </View>
            </View>
          </View>
        )}
        <View className="imgs">
          {postDetail?.imgUrls &&
            postDetail?.imgUrls.map((url, index) => <Image key={index} mode="widthFix" width="80vw" src={url} />)}
        </View>
        <View className="bottom">
          <View className="share bottom-icon">
            <Button icon={<Share size={20} />} openType="share" fill="none">
              分享
            </Button>
          </View>
          <View className="comment bottom-icon">
            <Comment size={20} />
            {postDetail?.commentCount && postDetail.commentCount > 0 ? postDetail.commentCount : '评论'}
          </View>
          <View className="like bottom-icon" onClick={handleLike}>
            {isLiked ? <HeartFill size={20} color="red" /> : <Heart size={20} />}
            {postDetail?.likeCount && postDetail.likeCount > 0 ? postDetail.likeCount : '点赞'}
          </View>
        </View>
      </View>
      <View className="comment2">
        <View style={{ marginBottom: '20px' }}>全部评论</View>
        <View className="comment-ground" onClick={() => setShowBottom(true)}>
          <Edit style={{ margin: '0 5px' }} />
          留下精彩的评论
        </View>
        {comments.map((item, index) => {
          return (
            <CommentCard
              key={index}
              head_pic={item.user.head_pic}
              username={item.user.username}
              text_content={item.commentContent}
              time={moment(new Date(item.createdAt)).format('MM-DD HH:mm')}
            />
          )
        })}
      </View>
      <Popup
        style={{ minHeight: 0, height: '100px', borderRadius: '5px' }}
        visible={showBottom}
        position="bottom"
        onClose={() => {
          setShowBottom(false)
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <TextArea autoFocus value={comment} onChange={(value) => setComment(value)} />
          <Button fill="none" size="large" style={{ width: '100px', marginRight: '8px' }} onClick={submitComment}>
            提交
          </Button>
        </View>
      </Popup>
    </View>
  )
}
