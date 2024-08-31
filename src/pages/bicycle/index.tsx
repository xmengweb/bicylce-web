import { useMemo, useRef, useState } from 'react'
import { View, Text, ITouchEvent } from '@tarojs/components'
import { useLoad, navigateTo, getLocation, request, getStorageSync, useDidShow } from '@tarojs/taro'
import { IconFont, DoubleArrowUp, ArrowRight } from '@nutui/icons-react-taro'
import { useStore } from '@/store/user'
import { Animate, CircleProgress, Popup, Range } from '@nutui/nutui-react-taro'
import './index.less'
import QQMapWX from '../../assets/libs/qqmap-wx-jssdk.min.js'

const gradientColor = {
  '0%': '#78cca1',
  '50%': '#44cc86',
  '100%': '#15cc6d',
}

export default function Bicycle() {
  const qqmapsdk = useRef(
    new QQMapWX({
      key: 'ACFBZ-INFLJ-ADNFC-KEK7N-AHI7H-J6BCK',
    }),
  )
  const userId = useStore((store) => store.userId)
  const [curCity, setCurCity] = useState('----')
  const [curTemperature, setCurTemperature] = useState('---')
  const [curWind, setCurWind] = useState('---')
  const [showBasic, setShowBasic] = useState(false)
  const [curDate] = useState(new Date(Date.now()))
  const [totalLength, setTotalLength] = useState(0)
  const [targetLength, setTargetLength] = useState(100)
  const [todayLength, setTodayLength] = useState(0)
  // const [todayTime,setTodatTime]=useState(0)

  const todayDate = useMemo(() => {
    let month: string | number = curDate.getMonth() + 1
    let day: string | number = curDate.getDate()
    month = month < 10 ? '0' + month : month
    day = day < 10 ? '0' + day : day
    return [month, day]
  }, [curDate])

  const percent = useMemo(() => {
    if (targetLength == 0) return 100
    else return Number((todayLength / targetLength).toFixed(2)) * 100
  }, [targetLength, todayLength])

  const onJumpclick = (_event: ITouchEvent, link: string) => {
    if (link) {
      navigateTo({ url: link })
    }
  }

  async function getTodayInfo() {
    try {
      const res = await request({
        method: 'GET',
        url: 'https://api.xmcug.cn/ride/today',
        data: {
          userId,
        },
      })
      let total = 0
      res.data.forEach((item) => {
        total += item.distance
      })
      setTodayLength(total)
    } catch (error) {
      setTodayLength(0)
    }
  }
  async function getRemoteInfo() {
    try {
      const res = await request({
        method: 'GET',
        url: 'https://api.xmcug.cn/stat',
        header: {
          Authorization: `Bearer ${getStorageSync('token')}`,
        },
        data: {
          userId,
        },
      })
      setTargetLength(res.data.result.targetdistance)
      setTotalLength(res.data.result.totaldistance)
    } catch (error) {
      setTargetLength(10)
      setTotalLength(0)
    }
  }

  async function changeTarget(val) {
    const res = await request({
      method: 'POST',
      url: 'https://api.xmcug.cn/stat/settarget',
      data: {
        userId,
        targetdistance: val,
      },
    })
    if (res.data.success) {
      setTargetLength(val)
    }
  }

  useLoad(() => {
    getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success: (res) => {
        qqmapsdk.current.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          success: async function (res2) {
            setCurCity(res2.result.formatted_addresses.recommend)
            const res3 = (
              await request({
                method: 'GET',
                url: 'https://restapi.amap.com/v3/weather/weatherInfo',
                data: {
                  key: '5b219c37d20a382abd43fb9b8045434f',
                  city: res2.result.ad_info.adcode,
                  extensions: 'base',
                },
              })
            ).data
            setCurTemperature(res3.lives[0].weather + ' ' + res3.lives[0].temperature + '℃')
            setCurWind(res3.lives[0].winddirection + '风' + res3.lives[0].windpower + '级')

            // setCurDate('')
          },
        })
      },
    })
    getRemoteInfo()
    getTodayInfo()
  })

  useDidShow(() => {
    console.log('get')

    getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success: (res) => {
        qqmapsdk.current.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude,
          },
          success: async function (res2) {
            setCurCity(res2.result.formatted_addresses.recommend)
            const res3 = (
              await request({
                method: 'GET',
                url: 'https://restapi.amap.com/v3/weather/weatherInfo',
                data: {
                  key: '5b219c37d20a382abd43fb9b8045434f',
                  city: res2.result.ad_info.adcode,
                  extensions: 'base',
                },
              })
            ).data
            setCurTemperature(res3.lives[0].temperature)
            setCurWind(
              res3.lives[0].weather + ' ' + res3.lives[0].winddirection + '风' + res3.lives[0].windpower + '级',
            )

            // setCurDate('')
          },
        })
      },
    })
    getRemoteInfo()
    getTodayInfo()
  })

  return (
    <View className="bicycle">
      <View className="location">
        <IconFont fontClassName="iconfont" classPrefix="icon" name="dingwei" size={20} color="#00bc14" />
        <Text className="location-text" style={{ marginLeft: '5px' }}>
          {curCity}
        </Text>
      </View>
      <View className="info">
        <View className="left">
          <View className="temprature">
            <Text className="weightText">{curTemperature}</Text>℃
          </View>
          <View className="wind">{curWind}</View>
        </View>
        <View className="right">
          <View className="date">
            <Text className="weightText">{todayDate[0]}</Text>月<Text className="weightText">{todayDate[1]}</Text>日
          </View>
        </View>
      </View>
      <View
        className="history"
        onClick={(event: ITouchEvent) => {
          onJumpclick(event, '/pages/bicycle/subpages/record/index')
        }}
      >
        <View className="history-title">骑行记录</View>
        <ArrowRight size="12" style={{ position: 'absolute', top: '15px', right: '10px' }} />
        <View className="data">
          <View className="left">
            <Text style={{ position: 'absolute', top: '10px', fontWeight: 600 }}>累计骑行</Text>
            <View>
              <Text className="bigText" style={{ marginLeft: '10px' }}>
                {totalLength.toFixed(2)}
              </Text>
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Km</View>
            </View>
          </View>
          <View className="right">
            <Text className="title">今日骑行</Text>
            <Text
              className="set"
              onClick={(e) => {
                e.stopPropagation()
                setShowBasic(true)
              }}
            >
              设置
            </Text>
            <View style={{ marginBottom: '10px' }}>
              {todayLength.toFixed(2)}/{targetLength}公里
            </View>
            <CircleProgress percent={percent} radius={40} strokeWidth={10} background="#e5e9f2" color={gradientColor}>
              {percent.toFixed(2)}%
            </CircleProgress>
          </View>
        </View>
      </View>
      <Animate type="breath" loop style={{ display: 'flex', justifyContent: 'center' }}>
        <View
          className="run"
          onClick={(event: ITouchEvent) => {
            onJumpclick(event, '/pages/bicycle/subpages/bicycling/index')
          }}
        >
          <Text>开始</Text>
          <DoubleArrowUp className="nut-icon-am-jump  nut-icon-am-infinite dongicon" color="#70737a" />
        </View>
      </Animate>
      <Popup
        visible={showBasic}
        style={{ padding: '30px 50px', borderRadius: '15px', width: '55%' }}
        onClose={() => {
          setShowBasic(false)
        }}
      >
        <View>
          <Range
            min={0}
            max={targetLength > 100 ? targetLength : 100}
            defaultValue={targetLength}
            onEnd={(val: any) => changeTarget(val)}
          />
        </View>
      </Popup>
    </View>
  )
}
