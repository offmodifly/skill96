<template>
    <v-container>
        <PageHeader title="จัดการกรรมการประเมิน" subtitle="เพิ่ม แก้ไข และลบบัญชีกรรมการประเมิน" icon="mdi-account-star" />

        <!-- ฟอร์มเพิ่ม / แก้ไข -->
        <v-card rounded="xl" elevation="2" class="pa-4 mb-6">
            <v-card-title>
                <v-icon :icon="form.id_member ? 'mdi-pencil' : 'mdi-account-plus'" color="blue-grey" class="me-2"></v-icon>
                {{ form.id_member ? 'แก้ไขข้อมูลกรรมการประเมิน' : 'เพิ่มกรรมการประเมิน' }}
            </v-card-title>
            <v-card-text>
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
                            <v-text-field label="รหัสผ่าน" v-model="form.password" :error-messages="error.password" prepend-inner-icon="mdi-lock" variant="outlined"
                                :type="showPw ? 'text' : 'password'" :append-inner-icon="showPw ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showPw = !showPw"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select label="ประเภทสมาชิก" v-model="form.role" :error-messages="error.role" prepend-inner-icon="mdi-account-group" :items="typeR" variant="outlined"></v-select>
                        </v-col>
                    </v-row>
                    <div class="text-center">
                        <v-btn color="primary" type="submit" prepend-icon="mdi-content-save" class="ma-2">{{ form.id_member ? 'อัปเดต' : 'บันทึก' }}</v-btn>
                        <v-btn color="error" variant="tonal" prepend-icon="mdi-close" class="ma-2" @click="reset()">ยกเลิก</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- ตารางข้อมูล -->
        <v-card rounded="xl" elevation="2">
            <v-card-text>
                <v-text-field v-model="search" label="ค้นหาชื่อผู้ใช้" prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details></v-text-field>
            </v-card-text>
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ชื่อ-สกุล</th>
                        <th>อีเมล</th>
                        <th>ชื่อผู้ใช้</th>
                        <th class="text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_member">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.fname }} {{ items.lname }}</td>
                        <td>{{ items.email }}</td>
                        <td>{{ items.username }}</td>
                        <td class="text-center">
                            <v-btn icon="mdi-lock-reset" color="info" variant="tonal" size="small" class="ma-1" title="รีเซ็ตรหัสผ่าน" @click="resetPw(items)"></v-btn>
                            <v-btn icon="mdi-pencil" color="warning" variant="tonal" size="small" class="ma-1" @click="edit(items)"></v-btn>
                            <v-btn icon="mdi-delete" color="error" variant="tonal" size="small" class="ma-1" @click="del(items.id_member)"></v-btn>
                        </td>
                    </tr>
                    <tr v-if="result.length === 0">
                        <td colspan="5" class="text-center text-medium-emphasis py-6">ไม่พบข้อมูล</td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { staff } from '~/API/base'

const typeR = ['กรรมการประเมิน']
const error = ref<Record<string, string>>({})
const dataResult = ref<any[]>([])
const search = ref('')
const showPw = ref(false)
const emailRegex = /^[^\s]+@[^\s]+\.[^\s]{2,}$/i

const emptyForm = () => ({
    id_member: null,
    fname: '',
    lname: '',
    email: '',
    username: '',
    password: '',
    role: '',
})
const form = ref<any>(emptyForm())

const reset = () => {
    form.value = emptyForm()
    error.value = {}
}

function validate() {
    const f = form.value
    error.value = {}

    if (!f.fname.trim()) error.value.fname = 'กรุณากรอกชื่อ'
    if (!f.lname.trim()) error.value.lname = 'กรุณากรอกนามสกุล'

    if (!f.email.trim()) error.value.email = 'กรุณากรอกอีเมล'
    else if (!emailRegex.test(f.email.trim())) error.value.email = 'กรุณากรอกอีเมลให้ถูกต้อง'

    if (!f.username.trim()) error.value.username = 'กรุณากรอกชื่อผู้ใช้'
    else if (f.username.trim().length < 4) error.value.username = 'ชื่อผู้ใช้ต้องยาวอย่างน้อย 4 ตัวอักษร'

    if (!f.password.trim()) error.value.password = 'กรุณากรอกรหัสผ่าน'
    else if (f.password.trim().length < 6) error.value.password = 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัวอักษร'

    if (!f.role) error.value.role = 'กรุณาเลือกประเภทสมาชิก'

    return Object.keys(error.value).length === 0
}

const token = import.meta.client ? localStorage.getItem('token') : null
const headers = { Authorization: `Bearer ${token}` }

const saveMember = async () => {
    if (!validate()) return
    const f = form.value
    const payload = {
        fname: f.fname,
        lname: f.lname,
        email: f.email,
        username: f.username,
        password: f.password,
        role: f.role,
    }
    try {
        f.id_member
            ? await axios.put(`${staff}/member/update/${f.id_member}`, payload, { headers })
            : await axios.post(`${staff}/member/save`, payload, { headers })
        alert('ดำเนินการสำเร็จ')
        reset()
        await fetch()
    } catch (error) {
        console.error('Error save', error)
    }
}

const fetch = async () => {
    try {
        const res = await axios.get(`${staff}/member/showC`, { headers })
        dataResult.value = res.data
    } catch (error) {
        console.error('error get', error)
    }
}

const edit = (items: any) => {
    form.value = { ...items }
}

// รีเซ็ตรหัสผ่าน: ระบบสุ่มรหัสผ่านชั่วคราวให้ แล้วแสดงให้ฝ่ายบุคลากรแจ้งผู้ใช้
const resetPw = async (items: any) => {
    if (!confirm(`ต้องการรีเซ็ตรหัสผ่านของ ${items.fname} ${items.lname} ใช่หรือไม่`)) return
    try {
        const res = await axios.put(`${staff}/member/reset-password/${items.id_member}`, {}, { headers })
        alert(`รีเซ็ตรหัสผ่านสำเร็จ
ชื่อผู้ใช้: ${items.username}
รหัสผ่านชั่วคราว: ${res.data.tempPassword}
(กรุณาแจ้งผู้ใช้ ระบบจะให้เปลี่ยนรหัสผ่านเมื่อเข้าระบบ)`)
        await fetch()
    } catch (error) {
        console.error('error reset password', error)
        alert('รีเซ็ตรหัสผ่านไม่สำเร็จ')
    }
}

const del = async (id_member: number) => {
    if (!confirm('ต้องการลบข้อมูลชุดนี้ใช่หรือไม่')) return
    try {
        await axios.delete(`${staff}/member/delete/${id_member}`, { headers })
        await fetch()
        reset()
    } catch (error) {
        console.error('error delete', error)
    }
}

const result = computed(() => {
    const s = search.value.toLowerCase()
    return dataResult.value.filter((item) => item.username.toLowerCase().includes(s))
})

onMounted(fetch)
</script>
