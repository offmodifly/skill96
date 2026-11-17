const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

exports.verifyToken = (req,res,next)=>{
    const authHeader = req.header("Authorization")
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message:'Invalid Token no or more'})
    }
    const token = authHeader.split(" ")[1]
    try {
        req.user = jwt.verify(token,JWT_SECRET)
        next()
    } catch (error) {
        console.error('Invalid Token no or more',error)
        res.status(403).json({message:'Invalid Token no or more'})
    }
}

exports.requireRole = (role)=>(req,res,next)=>{
    try {
        if(req.user && req.user.role === role){
            return next()
        }
        res.status(403).json({message:'Invalid Role no or more'})
    } catch (error) {
        console.error('Invalid Role no or more',error)
        res.status(403).json({message:'Invalid Role no or more'})
    }
}

// กันผู้รับการประเมินผลที่ยังไม่เปลี่ยนรหัสผ่านครั้งแรก ไม่ให้เรียก API ฝั่ง Eva (ใช้ต่อจาก verifyToken)
const db = require('../db')
exports.requirePasswordChanged = async (req,res,next)=>{
    try {
        if(req.user.role !== 'ผู้รับการประเมินผล')return next()
        const [rows] = await db.query(`select must_change_pw from tb_member where id_member = ?`,[req.user.id_member])
        if(rows[0]?.must_change_pw === 1){
            return res.status(403).json({message:'กรุณาเปลี่ยนรหัสผ่านก่อนใช้งาน',must_change_pw:true})
        }
        next()
    } catch (error) {
        console.error('Error check password',error)
        res.status(500).json({message:'Error check password'})
    }
}
