const express =require('express')
const path = require('path')
const uploadDir = path.join(__dirname,'../uploads/pic_user')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET
const bc = require('bcrypt')
const db = require('../db')
const router = express.Router()
const {verifyToken} = require('../middleware/authmiddleware')

router.post('/regis',async (req,res) => {
    try {
        const pic_user = req.files?.pic_user
        const form = JSON.parse(req.body.form)
        let filename = null
        if(pic_user){
            filename = Date.now() + path.extname(pic_user.name)
            await pic_user.mv(path.join(uploadDir,filename))
        }
        const hash = await bc.hash(form.password,10)
        const [rows] = await db.query(`insert into tb_member(fname,lname,email,username,password,role,pic_user,must_change_pw) values(?,?,?,?,?,?,?,0)`,[form.fname,form.lname,form.email,form.username,hash,form.role,filename]) 
        res.json({rows,message:"regis success"})
    } catch (error) {
        console.error("error regis",error);
        res.status(500).json({message:"Error regis"})
    }
})

router.post('/login',async (req,res) => {
    try {
        const {username,password,role} = req.body
        const [rows] = await db.query(`select * from tb_member where username = ? and role = ?`,[username,role]) 
        const m = rows[0]
        if(!m || !password || !(await bc.compare(password,m.password))){
            return res.status(400).json({message:"รหัสผ่านไม่ถูกต้อง"})
        }
        const token = jwt.sign(
            {id_member:m.id_member,username:m.username,role:m.role},JWT_SECRET,{expiresIn:'24h'}
        )
        // ผู้รับการประเมินผลที่ยังไม่เคยเปลี่ยนรหัสผ่าน (must_change_pw = 1) ต้องไปหน้าเปลี่ยนรหัสผ่านก่อน
        const must_change_pw = m.role === 'ผู้รับการประเมินผล' && m.must_change_pw === 1
        res.json({token,role:m.role,must_change_pw})
    } catch (error) {
        console.error("error login",error);
        res.status(500).json({message:"Error login"})
    }
})

// เปลี่ยนรหัสผ่าน (ใช้ตอนเข้าระบบครั้งแรก) ต้องส่งรหัสผ่านเดิม + รหัสผ่านใหม่
router.put('/change-password',verifyToken,async (req,res) => {
    try {
        const {old_password,new_password} = req.body
        if(!new_password || new_password.trim().length < 6){
            return res.status(400).json({message:"รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร"})
        }
        const [rows] = await db.query(`select password from tb_member where id_member = ?`,[req.user.id_member])
        const m = rows[0]
        if(!m || !old_password || !(await bc.compare(old_password,m.password))){
            return res.status(400).json({message:"รหัสผ่านเดิมไม่ถูกต้อง"})
        }
        if(old_password === new_password){
            return res.status(400).json({message:"รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม"})
        }
        const hash = await bc.hash(new_password,10)
        await db.query(`update tb_member set password = ?, must_change_pw = 0 where id_member = ?`,[hash,req.user.id_member])
        res.json({message:"change password success"})
    } catch (error) {
        console.error("error change password",error);
        res.status(500).json({message:"Error change password"})
    }
})

module.exports = router