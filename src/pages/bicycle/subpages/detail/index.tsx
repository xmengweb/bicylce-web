import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Map, Text } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import { Del, Share, Footprint } from '@nutui/icons-react-taro'
import { MapContext, createMapContext, eventCenter } from '@tarojs/taro'
import { IRecordInfo } from '@/components/recordCard'
import { useStore } from '@/store/user'
import ManCard from '@/components/manCard'
import './index.less'

definePageConfig({
  navigationBarTitleText: '骑行详情',
})

const infoList = [
  {
    numberdw: '秒',
    name: '时长',
  },
  {
    numberdw: 'km/h',
    name: '配速',
  },
  {
    numberdw: 'km/h',
    name: '极速',
  },
]

export default function Record() {
  const username = useStore((store) => store.username)
  const headpic = useStore((store) => store.headpic)
  const [enableSatellite, setenableSatellite] = useState(false)
  const [skew, setskew] = useState(0)
  const mapRef = useRef<MapContext>(createMapContext('map'))
  const [recordInfo, setRecordInfo] = useState<IRecordInfo & { isOther: boolean }>({
    average_speed: 0,
    fatest_speed: 0,
    distance: 0,
    startPoint: '',
    endPoint: '',
    marker: [],
    polyline: [
      {
        points: [],
        color: '',
        width: 1,
        arrowLine: true,
      },
    ],
    record_id: 0,
    userId: 0,
    created_at: '',
    seconds: 0,
    isOther: false,
    stay_times: 0,
    cal: 0,
    max_height: 0,
    min_height: 0,
    height_dif: 0,
  })
  const formattedDate = useMemo(() => {
    const date = new Date(recordInfo.created_at)
    const month = date.getMonth() + 1 // getMonth()返回的月份从0开始，所以需要+1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()

    return `${month.toString().padStart(2, '0')}月${day.toString().padStart(2, '0')}日 ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }, [recordInfo])

  useEffect(() => {
    eventCenter.once('acceptDataFromOpenerPage', (arg) => {
      setRecordInfo(arg)
    })
  }, [recordInfo])

  const renderData = function () {
    const { seconds, average_speed, fatest_speed, distance } = recordInfo
    const data = [seconds, average_speed, fatest_speed, distance]
    return infoList.map((item, index) => {
      let dom = (
        <View className="number">
          <Text className="text-number">{data[index].toFixed(2)}</Text>
          {item.numberdw}
        </View>
      )
      if (index == 0) {
        let seconds2 = seconds
        const hours = Math.floor(seconds2 / 3600)
        seconds2 %= 3600
        const minutes = Math.floor(seconds2 / 60)
        seconds2 %= 60
        if (hours > 0) {
          dom = (
            <View className="number">
              <Text className="text-number">{hours}</Text>时<Text className="text-number">{minutes}</Text>分
              <Text className="text-number">{seconds2}</Text>秒
            </View>
          )
        } else if (minutes > 0) {
          dom = (
            <View className="number">
              <Text className="text-number">{minutes}</Text>分<Text className="text-number">{seconds2}</Text>秒
            </View>
          )
        }
      }
      return (
        <View className="bottom-item" key={index}>
          {dom}
          <View className="name">{item.name}</View>
        </View>
      )
    })
  }

  const handlePlay = () => {
    if (recordInfo.distance < 0.1) return
    setenableSatellite(true)
    setskew(40)
    mapRef.current.addMarkers({
      markers: [
        {
          iconPath: '/assets/icons/bicycle.png',
          id: 2,
          latitude: 0,
          longitude: 0,
          width: 20,
          height: 20,
        },
      ],
    })
    mapRef.current.moveAlong({
      markerId: 2,
      path: recordInfo.polyline[0].points,
      duration: 2000,
      precision: 200,
      success: () => {
        setenableSatellite(false)
        setskew(0)
        mapRef.current.removeMarkers({
          markerIds: ['2'],
        })
      },
    })
  }

  return (
    <View className="record-detail">
      <Map
        id="map"
        style={{ width: '100%', height: '80vh' }}
        scale={15}
        markers={recordInfo.marker}
        polyline={recordInfo.polyline}
        enableSatellite={enableSatellite}
        includePoints={recordInfo.polyline[0].points}
        onError={() => {}}
        latitude={recordInfo.marker[0]?.latitude || 0}
        longitude={recordInfo.marker[0]?.longitude || 0}
        enable-overlooking
        skew={skew}
      />
      <View className="bottom-card">
        <View className="header">
          <ManCard size="small" name={username} pic={headpic} dontNeed />
          <View className="header-data">
            <View className="distance">
              <Text className="number">{recordInfo.distance}</Text>公里
            </View>
            <View className="time">{formattedDate}</View>
          </View>
        </View>
        <View className="bottom-data">
          {renderData()}
          <View className="bottom-item">
            <View className="number">
              <Text className="text-number">{recordInfo.cal.toFixed(2)}</Text>
            </View>
            <View className="name">卡路里</View>
          </View>
          <View className="bottom-item">
            <View className="number">
              <Text className="text-number">{recordInfo.stay_times}</Text>
            </View>
            <View className="name">静止次数</View>
          </View>
          <View className="bottom-item">
            <View className="number">
              <Text className="text-number">{recordInfo.height_dif ? recordInfo.height_dif : 0}</Text>
            </View>
            <View className="name">高度差</View>
          </View>
        </View>
        <View className="btns">
          {!recordInfo.isOther && (
            <Button className="btn btn1" type="primary" color="#f2f2f9" icon={<Del color="black" />} />
          )}
          <Button className="btn btn2" type="primary" color="#70f318" icon={<Share color="black" />} />
          <Button
            className="btn btn3"
            type="default"
            color="#70f318"
            icon={<Footprint color="black" />}
            onClick={handlePlay}
          >
            <Text className="text">轨迹回放</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}
