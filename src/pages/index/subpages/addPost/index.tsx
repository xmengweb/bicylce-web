import { View } from '@tarojs/components'
import { getStorageSync, request, useLoad,showToast,navigateBack } from '@tarojs/taro'
import { Button, Input, Popup, TextArea, Uploader } from '@nutui/nutui-react-taro'
import { Link } from '@nutui/icons-react-taro'
import { useState } from 'react'
import moment from 'moment'
import RecordCard, { IRecordInfo } from '@/components/recordCard'
import { useStore } from '@/store/user'
import useFlagShow from '@/hooks/useFlagShow'
import './index.less'

definePageConfig({
  navigationBarTitleText: '发布动态',
})

export default function AddPost() {
  useFlagShow()
  const userId = useStore((store) => store.userId)
  const [recordInfo, setRecordInfo] = useState<undefined|IRecordInfo>(undefined)
  const [showBottom, setShowBottom] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [UploaderValues] = useState<any[]>([])
  const [recordList, setRecordList] = useState([])

  useLoad(() => {
    async function getList() {
      const res = await request({
        method: 'GET',
        url: 'https://api.xmcug.cn/ride',
        data: {
          page: 1,
          limit: 10,
          userId,
        },
      })
      setRecordList(res.data.results)
    }
    getList()
  })

  const submit = async () => {
    let tmp: string[] = []
    UploaderValues.forEach((item) => {
      item.responseText?.data && tmp.push(JSON.parse(item.responseText?.data).data.url)
    })
    const res = (await request({
      method: 'POST',
      url: 'https://api.xmcug.cn/posts/',
      data: {
        userId,
        title,
        textContent: content,
        imageUrls: tmp,
        rideId: recordInfo?.record_id
      },
    })).data
    if(res.code==200){
      showToast({
        title: '发布成功',
        icon: 'success',
        duration: 2000,
      })
      navigateBack()
    }
  }

  const onChoose = (record) => {
    setRecordInfo(record)
    setShowBottom(false)
  }

  return (
    <View className="add-post-page">
      <Input className="title-input" value={title} onChange={(val) => setTitle(val)} placeholder="请输入标题~" />
      <TextArea
        value={content}
        onChange={(value) => setContent(value)}
        placeholder="请输入正文~"
        showCount
        maxLength={4000}
      />
      <View style={{ padding: '10px' }}>
        <Uploader
          url="https://api.xmcug.cn/posts/upload"
          value={UploaderValues}
          headers={{
            Authorization: `Bearer ${getStorageSync('token')}`,
          }}
          maxCount={6}
          xhrState={201}
          multiple
          style={{
            marginInlineEnd: '10px',
            marginBottom: '10px',
          }}
        />
        <View onClick={() => setShowBottom(true)} style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
          <Link style={{ marginRight: '5px' }} />
          {recordInfo?'已关联  '+moment(new Date(recordInfo.created_at)).format('MM-DD HH:mm'):'关联骑行记录'}
        </View>
      </View>
      <Button type="success" style={{ width: '80%', margin: '20px auto', display: 'block' }} onClick={submit}>
        提交
      </Button>
      <Popup
        visible={showBottom}
        position="bottom"
        onClose={() => {
          setShowBottom(false)
        }}
        lockScroll
      >
        {recordList.map((item) => {
        return (
          <>
            <RecordCard recordInfo={item} isShowInfo onChoose={onChoose} />
          </>
        )
      })}
      </Popup>
    </View>
  )
}
