const express =require('express')
const bc = require('bcrypt')
const crypto = require('crypto')
const db = require('../../db')
const {verifyToken,requireRole} = require('../../middleware/authmiddleware')
const router = express.Router()

router.post('/save',verifyToken,requireRole('ฝ่ายบุคลากร'),async (req,res) => {
    try {
        const {fname,lname,email,username,password,role} = req.body
        const hash = await bc.hash(password,10)
        const [rows] = await db.query(`insert into tb_member(fname,lname,email,username,password,role) values(?,?,?,?,?,?)`,[fname,lname,email,username,hash,role]) 
        res.json({rows,message:"save success"})
    } catch (error) {
        console.error("error save",error);
        res.status(500).json({message:"Error save"})
    }
})

router.put('/update/:id_member',verifyToken,requireRole('ฝ่ายบุคลากร'),async (req,res) => {
    try {
        const {id_member} = req.params
        const {fname,lname,email,username,password,role} = req.body
        if(password && password.trim()){
            const hash = await bc.hash(password,10)
            const [rows] = await db.query(`update tb_member set fname=?,lname=?,email=?,username=?,password=?,role=?,must_change_pw=1 where id_member = ?`,[fname,lname,email,username,hash,role,id_member]) 
            res.json({rows,message:"update success"})
        }else{
            const [rows] = await db.query(`update tb_member set fname=?,lname=?,email=?,username=?,role=? where id_member = ?`,[fname,lname,email,username,role,id_member]) 
            res.json({rows,message:"update success"})
        }
        
    } catch (error) {
        console.error("error update",error);
        res.status(500).json({message:"Error update"})
    }
})

router.delete('/delete/:id_member',verifyToken,requireRole('ฝ่ายบุคลากร'),async (req,res) => {
    try {
        const {id_member} = req.params
        const [rows] = await db.query(`delete from tb_member where id_member = ?`,[id_member]) 
        res.json({rows,message:"delete success"})
        
    } catch (error) {
        console.error("error delete",error);
        res.status(500).json({message:"Error delete"})
    }
})

router.get('/showE',verifyToken,requireRole('ฝ่ายบุคลากร'),async (req,res) => {
    try {
        const [rows] = await db.query(`select * from tb_member where role='ผู้รับการประเมินผล' order by id_member desc`) 
        res.json(rows)
        
    } catch (error) {
        console.error("error get",error);
        res.status(500).json({message:"Error get"})
    }
})

router.get('/showC',verifyToken,requireRole('ฝ่ายบุคลากร'),async (req,res) => {
    try {
        const [rows] = await db.query(`select * from tb_member where role='กรรมการประเมิน' order by id_member desc`) 
        res.json(rows)
        
    } catch (error) {
        console.error("error get",error);
        res.status(500).json({message:"Error get"})
    }
})

// รีเซ็ตรหัสผ่าน: สุ่มรหัสผ่านชั่วคราวให้ แล้วส่งกลับไปให้ฝ่ายบุคลากรแจ้งผู้ใช้
// (ผู้รับการประเมินผลจะถูกบังคับเปลี่ยนรหัสผ่านตอนเข้าระบบครั้งถัดไป)
router.put('/reset-password/:id_member',verifyToken,requireRole('ฝ่ายบุคลากร'),async (req,res) => {
    try {
        const {id_member} = req.params
        const [rows] = await db.query(`select role from tb_member where id_member = ?`,[id_member])
        // รีเซ็ตได้เฉพาะผู้รับการประเมินผลและกรรมการประเมิน
        if(!rows[0] || rows[0].role === 'ฝ่ายบุคลากร'){
            return res.status(400).json({message:"ไม่สามารถรีเซ็ตรหัสผ่านของผู้ใช้นี้ได้"})
        }
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789' // ไม่ใช้ตัวที่สับสนง่าย เช่น O 0 l 1
        let tempPassword = ''
        for(let i = 0; i < 8; i++) tempPassword += chars[crypto.randomInt(chars.length)]
        const hash = await bc.hash(tempPassword,10)
        await db.query(`update tb_member set password = ?, must_change_pw = 1 where id_member = ?`,[hash,id_member])
        res.json({tempPassword,message:"reset success"})
    } catch (error) {
        console.error("error reset password",error);
        res.status(500).json({message:"Error reset password"})
    }
})

module.exports = router