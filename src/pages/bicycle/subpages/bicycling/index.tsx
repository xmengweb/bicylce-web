import { useEffect, useMemo, useRef, useState } from 'react'
import haversine from 'haversine'
import classNames from 'classnames'
import {
  useLoad,
  startLocationUpdateBackground,
  getLocation,
  offLocationChange,
  onLocationChange,
  showModal,
  switchTab,
  request,
  useUnload,
  vibrateShort,
  navigateTo,
  eventCenter,
} from '@tarojs/taro'
import { View, Text, Map } from '@tarojs/components'
import { Button, Progress, Dialog } from '@nutui/nutui-react-taro'
import { IconFont } from '@nutui/icons-react-taro'
import { useStore } from '@/store/user'
import QQMapWX from '@/assets/libs/qqmap-wx-jssdk.min.js'
import useTimer from '@/hooks/useTimer'
import useFlagShow from '@/hooks/useFlagShow'
import './index.less'

definePageConfig({
  navigationBarBackgroundColor: '#000000',
})

interface IMarker {
  iconPath: string
  id: number
  latitude: number
  longitude: number
  width: number
  height: number
}
interface IPoint {
  longitude: number
  latitude: number
  time: number
  speed: number
  lastLength: number
  accuracy: number
}

const speedColor = ['#ffd500', '#ff8800', '#ff5d00', '#ff4d00', '#ff3d00', '#ff2d00', '#ff1d00']
const colorStep = 20

// const process_option = 'denoise_grade=4,need_mapmatch=0,transport_mode=riding;vacuate_grade:2'

export default function Bicycling() {
  useFlagShow()
  const { isActive, start, pause, reset, formatTime, seconds } = useTimer()
  const bmr = useStore((store) => store.bmr)
  const hasLogin = useStore((store) => store.hasLogin)
  const userId = useStore((store) => store.userId)
  const qqmapsdk = useRef(
    new QQMapWX({
      key: 'ACFBZ-INFLJ-ADNFC-KEK7N-AHI7H-J6BCK',
    }),
  )
  const beginPoint = useRef('')
  const pointsRef = useRef<IPoint[]>([])
  const entityNameRef = useRef(userId + 'user' + new Date().getTime())
  const stayToPause = useRef<any>(null)
  const tidRef = useRef(0)
  const tridRef = useRef(0)
  const stayTimesRef = useRef(0)
  const IntervalRef = useRef<any>()
  const min_height = useRef(0)
  const max_height = useRef(0)

  const [resetPercent, setResetPercent] = useState(0)
  const [curSpeed, setCurSpeed] = useState(0)
  const [markers, setMarkers] = useState<IMarker[]>([])
  const [points, setPoints] = useState<IPoint[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [fatestSpeed, setFatestSpeed] = useState(0)
  const [curPoint, setCurPoint] = useState({
    latitude: 29.58,
    longitude: 113.41,
  })

  const polyline = useMemo(() => {
    const colorList = points
      .map((item) => {
        return speedColor[Math.floor(item.speed / colorStep)]
      })
      .slice(0, points.length - 1)
    return [
      {
        points,
        color: '#09c462',
        colorList,
        width: 8,
        arrowLine: true,
      },
    ]
  }, [points])

  const totalLength = useMemo(() => {
    let len = 0
    points.forEach((element) => {
      len += element!.lastLength
    })
    return len
  }, [points])

  const averageSpeed = useMemo(() => {
    if (seconds == 0) return 0
    const ave_s = Number(((totalLength * 3600) / seconds).toFixed(2))
    if (fatestSpeed < ave_s) return fatestSpeed
    else return ave_s
  }, [totalLength, seconds, fatestSpeed])

  const handleTouchStart = () => {
    vibrateShort({ type: 'medium' })
    IntervalRef.current = setInterval(() => {
      setResetPercent((prev) => prev + 0.05)
    }, 100)
  }

  useEffect(() => {
    if (resetPercent > 1) {
      setResetPercent(1)
      vibrateShort({ type: 'medium' })
      clearInterval(IntervalRef.current)
    }
  }, [resetPercent])

  const handleTouchEnd = () => {
    if (resetPercent >= 1) {
      over().then((res) => {
        Dialog.open('test', {
          title: '骑行完成',
          content: '可去查看本次骑行轨迹',
          onConfirm: () => {
            navigateTo({
              url: '/pages/bicycle/subpages/detail/index',
              success: function () {
                setTimeout(() => {
                  // 通过eventChannel向被打开页面传送数据
                  eventCenter.trigger('acceptDataFromOpenerPage', { ...res, isOther: false })
                }, 100)
              },
            })
          },
          onCancel: () => {
            switchTab({ url: '/pages/bicycle/index' })
          },
        })
      })
    }
    IntervalRef.current && clearInterval(IntervalRef.current)
    setResetPercent(0)
  }

  useEffect(() => {
    setFatestSpeed((prevFatestSpeed) => {
      if (!isActive) return prevFatestSpeed
      return prevFatestSpeed ? (prevFatestSpeed > curSpeed ? prevFatestSpeed : curSpeed) : curSpeed
    })
  }, [curSpeed, isActive])

  useLoad(() => {
    startLocationUpdateBackground({
      success: () => {
        //打标记，后台定位模式已开启；
        start()
        offLocationChange()
        getLocation({
          type: 'gcj02',
          isHighAccuracy: true,
          success: (res) => {
            const curspeed = res.speed > 0 ? res.speed * 3.6 : 0
            const curTime = Date.now()
            const latitude = res.latitude
            const longitude = res.longitude
            min_height.current = res.altitude
            max_height.current = res.altitude
            pointsRef.current = [
              {
                latitude,
                longitude,
                time: curTime,
                speed: curspeed,
                accuracy: res.accuracy,
                lastLength: 0,
              },
              {
                latitude,
                longitude,
                time: curTime,
                speed: curspeed,
                accuracy: res.accuracy,
                lastLength: 0,
              },
            ]
            setMarkers([
              {
                iconPath: '/assets/icons/beginPoint.png',
                id: 0,
                latitude,
                longitude,
                width: 20,
                height: 20,
              },
            ])
            setPoints(() => pointsRef.current)
            setCurPoint({
              latitude,
              longitude,
            })
            request({
              url: 'https://tsapi.amap.com/v1/track/terminal/add',
              method: 'POST',
              data: {
                key: 'eb555207c9d51766d69c284abfbd498f',
                sid: 1025384,
                name: entityNameRef.current,
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
              },
            }).then((res2) => {
              tidRef.current = res2.data.data.tid
              request({
                url: 'https://tsapi.amap.com/v1/track/trace/add',
                method: 'POST',
                data: {
                  key: 'eb555207c9d51766d69c284abfbd498f',
                  sid: 1025384,
                  tid: res2.data.data.tid,
                },
                header: {
                  'content-type': 'application/x-www-form-urlencoded',
                },
              }).then((res3) => (tridRef.current = res3.data.data.trid))
            })
            // let rqData = {
            //   key: 'ACFBZ-INFLJ-ADNFC-KEK7N-AHI7H-J6BCK',
            //   service_id: '6640ce52e3e074566059a366',
            //   entity_id: entityNameRef.current,
            //   entity_name: 'bicycle-' + userId,
            // }
            // request({
            //   url: 'https://apis.map.qq.com/tracks/entity/create',
            //   method: 'POST',
            //   data: rqData,
            // })
            qqmapsdk.current.reverseGeocoder({
              location: {
                latitude,
                longitude,
              },
              success: function (res2) {
                beginPoint.current = res2.result.formatted_addresses.recommend
              },
            })
          },
        })
      },
      fail: () => {
        showModal({ content: '没有开启定位权限,快去开启' })
      },
    })
  })

  useUnload(() => {
    IntervalRef.current && clearInterval(IntervalRef.current)
    console.log('onUnload')
  })

  function clickHandler(e) {
    e.stopPropagation() // 阻止冒泡
  }

  const openDrawer = () => {
    setIsOpen(true)
  }

  const closeDrawer = () => {
    setIsOpen(false)
  }

  // useEffect(() => {
  //   startCompass()
  //   onCompassChange(setDirection)
  //   return () => {
  //     offCompassChange(setDirection)
  //     stopCompass()
  //   }
  // }, [setDirection])

  useEffect(() => {
    onLocationChange(async (res) => {
      const curspeed = res.speed > 0 ? res.speed * 3.6 : 0
      if (!isActive) return
      setCurSpeed(curspeed)
      const curTime = Date.now()
      const lastPoint = pointsRef.current.at(-1) as unknown as IPoint
      const lastLength = lastPoint
        ? haversine(
            {
              latitude: lastPoint!.latitude,
              longitude: lastPoint!.longitude,
            },
            {
              latitude: res.latitude,
              longitude: res.longitude,
            },
          )
        : 0
      if (lastLength * 1000 < 8 || res.accuracy > 35) return
      if (lastPoint.speed < 2.5 && curspeed < 2.5) {
        if (!stayToPause.current) {
          stayToPause.current = setTimeout(() => {
            stayTimesRef.current++
          }, 5000)
        }
        return
      }
      if (stayToPause.current) {
        clearTimeout(stayToPause.current)
      }
      stayToPause.current = null
      min_height.current > res.altitude && (min_height.current = res.altitude)
      max_height.current < res.altitude && (max_height.current = res.altitude)

      pointsRef.current = [
        ...pointsRef.current,
        {
          latitude: res.latitude,
          longitude: res.longitude,
          lastLength,
          time: curTime,
          speed: res.speed > 0 ? res.speed * 3.6 : 0,
          accuracy: res.accuracy,
        },
      ]
      setPoints(pointsRef.current)
      setCurPoint(pointsRef.current[pointsRef.current.length - 1])
    })
    return () => {
      offLocationChange()
    }
  }, [isActive])

  // const [testtext,settesttext]=useState('')
  async function upTrack() {
    const arr = pointsRef.current.map((item) => ({
      location: `${item.longitude.toFixed(6)},${item.latitude.toFixed(6)}`,
      locatetime: item.time,
      speed: item.speed,
      accuracy: item.accuracy,
    }))
    for (let index = 0; index < Math.ceil(arr.length / 100); index++) {
      await request({
        url: 'https://tsapi.amap.com/v1/track/point/upload',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        data: {
          key: 'eb555207c9d51766d69c284abfbd498f',
          sid: 1025384,
          tid: tidRef.current,
          trid: tridRef.current,
          points: JSON.stringify(arr.slice(100 * index, 100 * index + 100)),
        },
      })
    }
  }

  const over = async () => {
    await upTrack()
    const trackRes = await request({
      url: 'https://tsapi.amap.com/v1/track/terminal/trsearch',
      method: 'GET',
      data: {
        key: 'eb555207c9d51766d69c284abfbd498f',
        sid: 1025384,
        tid: tidRef.current,
        trid: tridRef.current,
        start_time: pointsRef.current[0].time,
        end_time: pointsRef.current.at(-1)!.time,
        correction: 'denoise=1,mapmatch=1,attribute=1,mode=driving',
        pagesize: 999,
      },
    })
    if (trackRes.data.data.tracks[0].counts > 999) {
      for (let i = 1; i < Math.ceil(trackRes.data.data.tracks[0].counts / 999); i++) {
        const re = await request({
          url: 'https://tsapi.amap.com/v1/track/terminal/trsearch',
          method: 'GET',
          data: {
            key: 'eb555207c9d51766d69c284abfbd498f',
            sid: 1025384,
            tid: tidRef.current,
            trid: tridRef.current,
            start_time: pointsRef.current[0].time,
            end_time: pointsRef.current.at(-1)!.time,
            correction: 'denoise=1,mapmatch=1,attribute=1,mode=driving',
            page: i + 1,
            pagesize: 999,
          },
        })
        trackRes.data.data.tracks[0].points.push(...re.data.data.data.tracks[0].points)
      }
    }
    if (trackRes.data.data.tracks[0].points.length >= 2) {
      pointsRef.current = trackRes.data.data.tracks[0].points
        .map((item, index) => {
          if (item?.speed === undefined) {
            return {
              longitude: item.location.split(',')[0],
              latitude: item.location.split(',')[1],
              time: item.locatetime,
              speed: trackRes.data.data.tracks[0].points[index + 1]?.speed,
            }
          }
        })
        .filter((item) => item !== undefined)
    }
    const latitude = curPoint.latitude
    const longitude = curPoint.longitude
    const titlelen = Number((trackRes.data.data.tracks[0].distance / 1000).toFixed(2))
    const newMarkers = [
      {
        ...markers[0],
        latitude: pointsRef.current.at(0)?.latitude,
        longitude: pointsRef.current.at(0)?.longitude,
      },
      {
        iconPath: '/assets/icons/endPoint.png',
        id: 1,
        latitude: pointsRef.current.at(-1)?.latitude,
        longitude: pointsRef.current.at(-1)?.longitude,
        width: 20,
        height: 20,
      },
    ]
    const colorList = pointsRef.current
      .map((item, index) => {
        if (item.speed === undefined) {
          item.speed = pointsRef.current[index + 1].speed || 1
        }
        return speedColor[Math.floor(Number(item.speed) / colorStep)] || '#ffd500'
      })
      .slice(0, pointsRef.current.length - 1)
    reset()
    return new Promise<any>((resolve) => {
      qqmapsdk.current.reverseGeocoder({
        location: {
          latitude,
          longitude,
        },
        success: async function (res2) {
          if (hasLogin) {
            let mets = 3
            if (averageSpeed >= 18) {
              mets = 6.5
            } else if (averageSpeed >= 15) {
              mets = 5.5
            } else if (averageSpeed >= 13) {
              mets = 4.4
            } else if (averageSpeed >= 12) {
              mets = 3.9
            } else {
              mets = 3.6
            }
            const res = await request({
              method: 'POST',
              url: 'https://api.xmcug.cn/ride/add',
              data: {
                average_speed: averageSpeed,
                fatest_speed: fatestSpeed,
                distance: titlelen,
                marker: newMarkers,
                polyline: [
                  {
                    points: pointsRef.current,
                    color: '#09c462',
                    colorList,
                    width: 8,
                    arrowLine: true,
                  },
                ],
                userId: userId,
                startPoint: beginPoint.current,
                endPoint: res2.result.formatted_addresses.recommend,
                seconds,
                cal: Number(((((bmr * mets) / 24) * seconds) / 60 / 60).toFixed(2)),
                min_height: min_height.current,
                max_height: max_height.current,
                height_dif: max_height.current - min_height.current,
                stay_times: stayTimesRef.current,
              },
            })
            resolve(res.data.result)
          }
        },
      })
    })
  }

  return (
    <>
      <View className="bicycling">
        {/* <Text>{testtext}</Text> */}
        <View className="sudu">{curSpeed.toFixed(2)}</View>
        <View className="sududw">Km/小时</View>
        <View className="time">{formatTime}</View>
        <View className="suduinfo">
          <View className="suduinfo-child">
            <Text className="suduinfo-child-data">{totalLength.toFixed(2)}</Text>
            <Text className="suduinfo-child-name">里程距离</Text>
            <Text className="suduinfo-child-dw">公里</Text>
          </View>
          <View className="suduinfo-child">
            <Text className="suduinfo-child-data">{averageSpeed.toFixed(2)}</Text>
            <Text className="suduinfo-child-name">平均速度</Text>
            <Text className="suduinfo-child-dw">Km/小时</Text>
          </View>
          <View className="suduinfo-child">
            <Text className="suduinfo-child-data">{fatestSpeed.toFixed(2)}</Text>
            <Text className="suduinfo-child-name">最快速度</Text>
            <Text className="suduinfo-child-dw">Km/小时</Text>
          </View>
        </View>
        <View className="set">
          {isActive ? (
            <View className="zanting">
              <Button
                style={{ width: '48px' }}
                shape="round"
                size="xlarge"
                color="#212126"
                onClick={() => {
                  pause()
                }}
                icon={
                  <IconFont
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    fontClassName="iconfont"
                    classPrefix="icon"
                    name="zanting"
                    color="#e53e31"
                    size={25}
                  />
                }
              />
            </View>
          ) : (
            <View className="begin">
              <Button
                style={{ width: '48px', marginRight: '10px' }}
                shape="round"
                size="xlarge"
                color="#212126"
                onClick={() => {
                  start()
                }}
                icon={
                  <IconFont
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    fontClassName="iconfont"
                    classPrefix="icon"
                    name="daochu1024-15"
                    color="#6fe087"
                    size={25}
                  />
                }
              />
              <Button
                style={{ width: '48px' }}
                shape="round"
                size="xlarge"
                color="#212126"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                icon={
                  <IconFont
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    fontClassName="iconfont"
                    classPrefix="icon"
                    name="tingzhi"
                    color="#ea3323"
                    size={25}
                  />
                }
              />
            </View>
          )}
          <View className="map">
            <Button
              style={{ width: '48px' }}
              shape="round"
              size="xlarge"
              color="#212126"
              onClick={() => {
                openDrawer()
              }}
              icon={
                <IconFont
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  fontClassName="iconfont"
                  classPrefix="icon"
                  name="ditu2"
                  color="#666666"
                  size={25}
                />
              }
            />
          </View>
        </View>
        {resetPercent > 0 && (
          <View className="toast">
            <Text style={{ fontSize: '15px', color: '#f4f4f4', marginBottom: '15px' }}>长按结束骑行</Text>
            <Progress percent={resetPercent * 100} color="#90e153" />
          </View>
        )}
      </View>
      <Dialog id="test" confirmText="去查看" cancelText="回到主页" />
      <View className={classNames('map-wrapper', isOpen ? 'open' : '')} onClick={closeDrawer}>
        <View className="map-content" style={{ width: '100%', height: '85vh' }} onClick={clickHandler}>
          <Map
            id="map"
            style={{ width: '100%', height: '100%' }}
            longitude={curPoint.longitude}
            latitude={curPoint.latitude}
            scale={18}
            show-location
            markers={markers}
            polyline={polyline}
            onError={() => {}}
          />
        </View>
      </View>
    </>
  )
}
