<template>
    <v-container style="max-width: 560px">
        <PageHeader title="เปลี่ยนรหัสผ่านครั้งแรก" subtitle="เพื่อความปลอดภัย กรุณาตั้งรหัสผ่านใหม่ก่อนเริ่มใช้งาน" icon="mdi-lock-reset" color="#7d0c14" />

        <v-card rounded="xl" elevation="2" class="pa-6">
            <v-form @submit.prevent="save">
                <v-text-field label="รหัสผ่านเดิม" v-model="form.old_password" :error-messages="error.old_password" variant="outlined" prepend-inner-icon="mdi-lock-outline"
                    :type="showPw ? 'text' : 'password'" :append-inner-icon="showPw ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showPw = !showPw"></v-text-field>
                <v-text-field label="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)" v-model="form.new_password" :error-messages="error.new_password" variant="outlined" prepend-inner-icon="mdi-lock"
                    :type="showPw ? 'text' : 'password'"></v-text-field>
                <v-text-field label="ยืนยันรหัสผ่านใหม่" v-model="confirm" :error-messages="error.confirm" variant="outlined" prepend-inner-icon="mdi-lock-check"
                    :type="showPw ? 'text' : 'password'"></v-text-field>

                <v-btn color="#7d0c14" type="submit" size="large" block prepend-icon="mdi-content-save" :loading="loading">เปลี่ยนรหัสผ่าน</v-btn>
            </v-form>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { api } from '~/API/base'

// หน้านี้ไม่ใช้ layout (ไม่มีเมนู) เพื่อไม่ให้ข้ามไปหน้าอื่นก่อนเปลี่ยนรหัสผ่าน
definePageMeta({ layout: false })

const form = ref({ old_password: '', new_password: '' })
const confirm = ref('')
const showPw = ref(false)
const loading = ref(false)
const error = ref<Record<string, string>>({})

// ตรวจข้อมูลก่อนส่ง
function validate() {
    error.value = {}
    if (!form.value.old_password) error.value.old_password = 'กรุณากรอกรหัสผ่านเดิม'
    if (form.value.new_password.trim().length < 6) error.value.new_password = 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร'
    else if (form.value.new_password === form.value.old_password) error.value.new_password = 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม'
    if (confirm.value !== form.value.new_password) error.value.confirm = 'รหัสผ่านไม่ตรงกัน'
    return Object.keys(error.value).length === 0
}

const save = async () => {
    if (!validate()) return
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    loading.value = true
    try {
        await axios.put(`${api}/auth/change-password`, form.value, { headers })
        localStorage.removeItem('must_change_pw') // เปลี่ยนแล้ว ครั้งต่อไปไม่ต้องบังคับอีก
        alert('เปลี่ยนรหัสผ่านสำเร็จ')
        navigateTo('/Evaluatee')
    } catch (err: any) {
        error.value.old_password = err.response?.data?.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ'
    } finally {
        loading.value = false
    }
}
</script>
