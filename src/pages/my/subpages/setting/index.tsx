import { Avatar, Cell, Button, Popup, Picker } from '@nutui/nutui-react-taro'
import { CommonEventFunction, View, Text, Input } from '@tarojs/components'
import { ArrowRight } from '@nutui/icons-react-taro'
import {
  useRouter,
  request,
  removeStorageSync,
  switchTab,
  uploadFile,
  getStorageSync,
  useLoad,
  useUnload,
} from '@tarojs/taro'
import { useState } from 'react'
import { useStore } from '@/store/user'
import './index.less'

definePageConfig({
  navigationBarTitleText: '个人设置',
})

const listData1 = [
  Array.from({ length: 250 - 30 + 1 }, (_, i) => i + 30).map((item) => ({
    value: item,
    text: item + '厘米',
  })),
]

const listData2 = [
  Array.from({ length: 150 - 30 + 1 }, (_, i) => i + 30).map((item) => ({
    value: item,
    text: item + 'kg',
  })),
]

const listData3 = [
  Array.from({ length: 120 - 3 + 1 }, (_, i) => i + 3).map((item) => ({
    value: item,
    text: item + '岁',
  })),
]

const listData4 = [
  [
    { value: 1, text: '男' },
    { value: 0, text: '女' },
  ],
]

export default function Setting() {
  const setBmr = useStore((store) => store.setBmr)
  const username = useStore((store) => store.username)
  const headpic = useStore((store) => store.headpic)
  const updateUserName = useStore((store) => store.updateUserName)
  const updatePic = useStore((store) => store.updatePic)
  const setLogin = useStore((store) => store.setLogin)
  const router = useRouter()
  const [showBottom, setShowBottom] = useState(false)
  const [input, setInput] = useState(username)
  const [weight, setWeight] = useState(60)
  const [height, setHeight] = useState(170)
  const [age, setAge] = useState(25)
  const [sex, setSex] = useState('男')

  const [visible1, setVisible1] = useState(false)
  const [visible2, setVisible2] = useState(false)
  const [visible3, setVisible3] = useState(false)
  const [visible4, setVisible4] = useState(false)

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
      const { result } = res.data
      setWeight(result.weight ? result.weight : 60)
      setHeight(result.height ? result.height : 170)
      setAge(result.age ? result.age : 25)
      setSex(result.sex ? '男' : '女')
    } else {
      setLogin(false)
    }
  }

  useLoad(() => {
    getUser()
  })

  useUnload(() => {
    request({
      method: 'GET',
      url: 'https://api.xmcug.cn/user',
      header: {
        Authorization: `Bearer ${getStorageSync('token')}`,
      },
    }).then((res) => {
      const { result } = res.data
      setBmr(result.weight, result.height, result.age, !!result.sex)
    })
  })

  const handleImg: CommonEventFunction = async (event) => {
    const res = await uploadFile({
      url: 'https://api.xmcug.cn/posts/upload',
      filePath: event.detail.avatarUrl,
      name: 'file',
      header: {
        Authorization: `Bearer ${getStorageSync('token')}`,
      },
    })
    setUserInfo(JSON.parse(res.data).data.url, undefined)
  }

  const handleName = () => {
    setUserInfo(undefined, input)
  }

  const confirmPicker1 = (value) => {
    setUserInfo(undefined, undefined, undefined, value)
  }
  const confirmPicker2 = (value) => {
    setUserInfo(undefined, undefined, value)
  }
  const confirmPicker3 = (value) => {
    setUserInfo(undefined, undefined, undefined, undefined, value)
  }
  const confirmPicker4 = (value) => {
    setUserInfo(undefined, undefined, undefined, undefined, undefined, value)
  }

  const handleLogout = () => {
    removeStorageSync('token')
    setLogin(false)
    updateUserName('未登录')
    updatePic('')
    switchTab({ url: '/pages/bicycle/index' })
  }

  const setUserInfo = async (pic?: string, name?: string, w?: number, h?: number, a?: number, s?: number) => {
    const res = await request({
      method: 'PATCH',
      url: 'https://api.xmcug.cn/user',
      data: {
        userId: router.params.id,
        username: name,
        head_pic: pic,
        weight: w,
        height: h,
        age: a,
        sex: !!s,
      },
    })
    if (res.data.success) {
      name && updateUserName(name)
      pic && updatePic(pic)
      w && setWeight(w)
      h && setHeight(h)
      a && setAge(a)
      s && setSex(s ? '男' : '女')
    }
    setShowBottom(false)
  }

  return (
    <View className="setting">
      <Cell.Group className="head">
        <Cell
          className="nutui-cell-clickable"
          title="头像"
          extra={
            <>
              <Avatar size="small" src={headpic} />
              <ArrowRight />
              <Button
                onChooseAvatar={handleImg}
                style={{ position: 'absolute', width: '100%', height: '100%', border: 0 }}
                openType="chooseAvatar"
              />
            </>
          }
          align="center"
        />
        <Cell
          className="nutui-cell-clickable"
          title="昵称"
          align="center"
          extra={
            <>
              <Text style={{ marginRight: '5px' }}>{username}</Text>
              <ArrowRight />
            </>
          }
          onClick={() => {
            setShowBottom(true)
          }}
        />
        <Popup
          visible={showBottom}
          position="bottom"
          onClose={() => {
            setShowBottom(false)
          }}
        >
          {showBottom && (
            <>
              <Input
                className="my-input"
                type="nickname"
                onInput={(val) => {
                  setInput(val.detail.value)
                }}
                focus
                value={input}
              />
              <Button type="success" onClick={handleName}>
                提交
              </Button>
            </>
          )}
        </Popup>
      </Cell.Group>
      <Cell.Group>
        <Cell
          title="身高"
          extra={
            <>
              <Text style={{ marginRight: '5px' }}>{height}</Text>
              <ArrowRight />
            </>
          }
          onClick={() => {
            setVisible1(true)
          }}
        />
        <Cell
          title="体重"
          extra={
            <>
              <Text style={{ marginRight: '5px' }}>{weight}</Text>
              <ArrowRight />
            </>
          }
          onClick={() => {
            setVisible2(true)
          }}
        />
        <Cell
          title="年龄"
          extra={
            <>
              <Text style={{ marginRight: '5px' }}>{age}</Text>
              <ArrowRight />
            </>
          }
          onClick={() => {
            setVisible3(true)
          }}
        />
        <Cell
          title="性别"
          extra={
            <>
              <Text style={{ marginRight: '5px' }}>{sex}</Text>
              <ArrowRight />
            </>
          }
          onClick={() => {
            setVisible4(true)
          }}
        />
        <Picker
          title="请选择身高"
          visible={visible1}
          options={listData1}
          defaultValue={[height]}
          onConfirm={(_list, values) => confirmPicker1(values[0])}
          onClose={() => setVisible1(false)}
        />
        <Picker
          title="请选择体重"
          visible={visible2}
          options={listData2}
          defaultValue={[weight]}
          onConfirm={(_list, values) => confirmPicker2(values[0])}
          onClose={() => setVisible2(false)}
        />
        <Picker
          title="请选择年龄"
          visible={visible3}
          options={listData3}
          defaultValue={[age]}
          onConfirm={(_list, values) => confirmPicker3(values[0])}
          onClose={() => setVisible3(false)}
        />
        <Picker
          title="请选择性别"
          visible={visible4}
          options={listData4}
          onConfirm={(_list, values) => confirmPicker4(values[0])}
          onClose={() => setVisible4(false)}
        />
      </Cell.Group>
      <Button className="my-btn" type="danger" onClick={handleLogout}>
        退出登录
      </Button>
    </View>
  )
}
