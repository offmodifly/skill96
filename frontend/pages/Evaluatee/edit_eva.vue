<template>
    <v-container>
        <PageHeader title="แก้ไขข้อมูลส่วนตัว" subtitle="ถ้าไม่ต้องการเปลี่ยนรหัสผ่าน ให้เว้นช่องรหัสผ่านว่างไว้" icon="mdi-account-edit" color="#7d0c14" />

        <v-card rounded="xl" elevation="2" class="pa-4">
            <v-card-text>
                <!-- แสดงประเภทสมาชิก (แก้ไขไม่ได้) -->
                <v-chip color="red-darken-4" prepend-icon="mdi-account-badge" class="mb-6">{{ form.role }}</v-chip>

                <v-form @submit.prevent="saveMember">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field label="ชื่อ" v-model="form.fname" :error-messages="error.fname" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="นามสกุล" v-model="form.lname" :error-messages="error.lname" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="อีเมล" v-model="form.email" :error-messages="error.email" prepend-inner-icon="mdi-email" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="ชื่อผู้ใช้" v-model="form.username" :error-messages="error.username" prepend-inner-icon="mdi-account" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="รหัสผ่านใหม่" v-model="form.password" :error-messages="error.password" prepend-inner-icon="mdi-lock" variant="outlined"
                                :type="showPw ? 'text' : 'password'" :append-inner-icon="showPw ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showPw = !showPw"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="ยืนยันรหัสผ่านใหม่" v-model="conP" :error-messages="error.conP" prepend-inner-icon="mdi-lock-check" variant="outlined"
                                :type="showPw ? 'text' : 'password'"></v-text-field>
                        </v-col>
                    </v-row>
                    <div class="text-center">
                        <v-btn color="primary" type="submit" prepend-icon="mdi-content-save" class="ma-2">บันทึกการแก้ไข</v-btn>
                        <v-btn color="error" variant="tonal" prepend-icon="mdi-refresh" class="ma-2" @click="fetch()">คืนค่าเดิม</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { eva } from '~/API/base'

const error = ref<Record<string, string>>({})
const form = ref<any>({ fname: '', lname: '', email: '', username: '', password: '', role: '' })
const conP = ref('') // ช่องยืนยันรหัสผ่าน
const showPw = ref(false)
const emailRegex = /^[^\s]+@[^\s]+\.[^\s]{2,}$/i

function validate() {
    const f = form.value
    error.value = {}

    if (!f.fname.trim()) error.value.fname = 'กรุณากรอกชื่อ'
    if (!f.lname.trim()) error.value.lname = 'กรุณากรอกนามสกุล'

    if (!f.email.trim()) error.value.email = 'กรุณากรอกอีเมล'
    else if (!emailRegex.test(f.email.trim())) error.value.email = 'กรุณากรอกอีเมลให้ถูกต้อง'

    if (!f.username.trim()) error.value.username = 'กรุณากรอกชื่อผู้ใช้'
    else if (f.username.trim().length < 4) error.value.username = 'ชื่อผู้ใช้ต้องยาวอย่างน้อย 4 ตัวอักษร'

    // ตรวจรหัสผ่านเฉพาะเมื่อกรอกรหัสผ่านใหม่
    if (f.password) {
        if (f.password.trim().length < 6) error.value.password = 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร'
        if (!conP.value.trim()) error.value.conP = 'กรุณายืนยันรหัสผ่าน'
        else if (conP.value.trim() !== f.password.trim()) error.value.conP = 'รหัสผ่านไม่ตรงกัน'
    }

    return Object.keys(error.value).length === 0
}

const saveMember = async () => {
    if (!validate()) return
    try {
        await axios.put(`${eva}/edit_eva/`, form.value, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        alert('แก้ไขสำเร็จ')
        window.location.reload()
    } catch (error) {
        console.error('Error save', error)
    }
}

const fetch = async () => {
    try {
        const res = await axios.get(`${eva}/edit_eva/`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        form.value = { ...res.data, password: '' } // API ไม่ส่งรหัสผ่านมา จึงให้ช่องรหัสผ่านว่าง
        conP.value = ''
        error.value = {}
    } catch (error) {
        console.error('Error get', error)
    }
}

onMounted(fetch)
</script>
