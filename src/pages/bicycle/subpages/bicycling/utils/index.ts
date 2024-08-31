// 定义一个函数来计算两个点之间的向量
function calculateVector(pointA, pointB) {
  return {
    dx: pointB.longitude - pointA.longitude,
    dy: pointB.latitude - pointA.latitude,
  };
}

// 定义一个函数来计算两个向量之间的夹角
function calculateAngle(vectorA, vectorB) {
  const dotProduct = vectorA.dx * vectorB.dx + vectorA.dy * vectorB.dy;
  const magnitudeProduct = Math.sqrt(
    vectorA.dx * vectorA.dx + vectorA.dy * vectorA.dy
  ) * Math.sqrt(vectorB.dx * vectorB.dx + vectorB.dy * vectorB.dy);
  return Math.floor(Math.acos(dotProduct / magnitudeProduct) * 180 / Math.PI);
}

// 定义一个函数来判断一个点是否是漂移点
function isOutlier(point, prevPoint, nextPoint, thresholdAngle) {
  const vectorToPrev = calculateVector(prevPoint, point);
  const vectorToNext = calculateVector(point, nextPoint);
  if ((vectorToPrev.dx === 0 && vectorToPrev.dy === 0) || (vectorToNext.dx === 0 && vectorToNext.dy === 0))
    return false
  const angle = 180 - calculateAngle(vectorToPrev, vectorToNext);
  console.log('angle:', angle);

  return angle < thresholdAngle;
}

// 定义一个阈值角度
const thresholdAngleInRadians = 40; // 例如，45度

// 过滤漂移点
function filteredPoints(points: any[]) {
  if (points.length < 3) return points
  return points.reduce((acc: any[], point, index) => {
    if (index === 0 || index === points.length - 1) {
      // 第一个和最后一个点不进行漂移点检测
      acc.push(point);
      return acc;
    }

    if (isOutlier(point, points[index - 1], points[index + 1], thresholdAngleInRadians)) {
      // 如果当前点是漂移点，则不将其添加到结果数组中
      console.log(`Point at index ${index + 1} is an outlier and will be filtered.`);
    } else {
      // 如果当前点不是漂移点，则将其添加到结果数组中
      acc.push(point);
    }

    return acc;
  }, [])
}

// // 过滤GPS飘逸点的函数
// function filterGPSPoints(points) {
//   // 定义阈值
//   const speedThreshold = 15 // 速度阈值，单位为m/s
//   const accelerationThreshold = 4 // 加速度阈值，单位为m/s^2
//   // 如果点的数量小于等于2，直接返回原始点集合
//   if (points.length <= 2) {
//     return points
//   }

//   // 过滤后的点集合
//   const filteredPoints = [points[0]]

//   // 遍历原始点集合
//   for (let i = 1; i < points.length - 1; i++) {
//     const prevPoint = points[i - 1]
//     const currentPoint = points[i]
//     const nextPoint = points[i + 1]
//     // 计算当前点的速度和加速度
//     const speed = calculateSpeed(prevPoint, currentPoint)
//     const acceleration = calculateAcceleration(prevPoint, currentPoint, nextPoint)
//     // 如果速度和加速度都低于阈值，认为是有效点，加入过滤后的点集合
//     if (speed <= speedThreshold && Math.abs(acceleration) <= accelerationThreshold) {
//       currentPoint.speed = speed.toFixed(3)
//       filteredPoints.push(currentPoint)
//     }
//   }

//   // 加入最后一个点
//   points[points.length - 1].speed = calculateSpeed(points[points.length - 2], points[points.length - 1])
//   if (points[points.length - 1].speed < speedThreshold) filteredPoints.push(points[points.length - 1])

//   return filteredPoints
// }

// // 计算两个点之间的速度
// function calculateSpeed(prevPoint, currentPoint) {
//   const distance = calculateDistance(prevPoint, currentPoint)
//   const time = (currentPoint.time - prevPoint.time) / 1000 // 假设timestamp是时间戳
//   return distance / time
// }

// // 计算三个点之间的加速度
// function calculateAcceleration(prevPoint, currentPoint, nextPoint) {
//   const speed1 = calculateSpeed(prevPoint, currentPoint)
//   const speed2 = calculateSpeed(currentPoint, nextPoint)
//   const time = (nextPoint.time - prevPoint.time) / 1000 // 假设timestamp是时间戳

//   return (speed2 - speed1) / time
// }

// // 将角度转换为弧度
// function deg2rad(deg) {
//   return deg * (Math.PI / 180)
// }

// //计算垂距
// function distToSegment(start, end, center) {
//   //下面用海伦公式计算面积
//   let a = Math.abs(calculationDistance2(start, end))
//   let b = Math.abs(calculationDistance2(start, center))
//   let c = Math.abs(calculationDistance2(end, center))
//   let p = (a + b + c) / 2.0
//   let s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)))
//   return (s * 2.0) / a
// }
// //递归方式压缩轨迹
// function compressLine(coordinate, result, start, end, dMax) {
//   if (start < end) {
//     let maxDist = 0
//     let currentIndex = 0
//     let startPoint = coordinate[start]
//     let endPoint = coordinate[end]
//     for (let i = start + 1; i < end; i++) {
//       let currentDist = distToSegment(startPoint, endPoint, coordinate[i])
//       if (currentDist > maxDist) {
//         maxDist = currentDist
//         currentIndex = i
//       }
//     }
//     if (maxDist >= dMax) {
//       //将当前点加入到过滤数组中
//       result.push(coordinate[currentIndex])
//       //将原来的线段以当前点为中心拆成两段，分别进行递归处理
//       compressLine(coordinate, result, start, currentIndex, dMax)
//       compressLine(coordinate, result, currentIndex, end, dMax)
//     }
//   }
//   return result
// }
// /**
//  *
//  *@param coordinate 原始轨迹Array<{latitude,longitude}>
//  *@param dMax 允许最大距离误差
//  *@return douglasResult 抽稀后的轨迹
//  *
//  */
// function douglasPeucker(coordinate, dMax) {
//   if (!coordinate || !(coordinate.length > 2)) {
//     return coordinate
//   }
//   coordinate.forEach((item, index) => {
//     item.key = index
//   })
//   let result = compressLine(coordinate, [], 0, coordinate.length - 1, dMax)
//   result.push(coordinate[0])
//   result.push(coordinate[coordinate.length - 1])
//   let resultLatLng = result.sort((a, b) => {
//     if (a.key < b.key) {
//       return -1
//     } else if (a.key > b.key) return 1
//     return 0
//   })
//   resultLatLng.forEach((item) => {
//     item.key = undefined
//     item.time = undefined
//   })
//   return resultLatLng
// }

export { filteredPoints }
