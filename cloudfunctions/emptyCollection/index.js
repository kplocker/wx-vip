// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  let { OPENID, APPID, UNIONID } = cloud.getWXContext()
  try {
    return await db.collection('collection').where({
      _openid: OPENID
    }).remove()
  } catch (e) {
    console.error(e)
  }
  
}