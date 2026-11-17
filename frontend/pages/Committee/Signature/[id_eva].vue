<template>
    <v-container>
        <PageHeader title="ยืนยันการประเมิน" subtitle="แนบไฟล์ลายเซ็นเพื่อยืนยันผลการประเมิน" icon="mdi-draw-pen" color="#007fff" />

        <!-- ฟอร์มอัปโหลดลายเซ็น (แสดงเมื่อยังไม่เคยอัปโหลด) -->
        <v-card v-if="!result.signature" rounded="xl" elevation="2" class="pa-6">
            <v-form @submit.prevent="saveMember">
                <v-file-input label="ไฟล์ลายเซ็น" v-model="file" :error-messages="error.file" variant="outlined" prepend-icon="" prepend-inner-icon="mdi-file-image"
                    accept=".png,.jpg" hint="รองรับเฉพาะไฟล์ png jpg ขนาดไม่เกิน 10MB" persistent-hint></v-file-input>
                <div class="mt-6">
                    <v-btn color="primary" type="submit" prepend-icon="mdi-content-save" class="me-2">บันทึก</v-btn>
                    <v-btn color="error" variant="tonal" prepend-icon="mdi-close" @click="reset()">ยกเลิก</v-btn>
                </div>
            </v-form>
        </v-card>

        <!-- ตารางลายเซ็นที่อัปโหลดแล้ว -->
        <v-card v-else rounded="xl" elevation="2">
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>เอกสาร</th>
                        <th class="text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-center">1</td>
                        <td>
                            <v-icon icon="mdi-file-image" color="primary" class="me-1"></v-icon>
                            {{ result.signature }}
                        </td>
                        <td class="text-center">
                            <v-btn color="info" variant="tonal" size="small" prepend-icon="mdi-eye" class="me-2" @click="view(result.signature)">เปิดดู</v-btn>
                            <v-btn icon="mdi-delete" color="error" variant="tonal" size="small" @click="del()"></v-btn>
                        </td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>

        <div class="text-center mt-4">
            <v-btn color="blue-grey" variant="outlined" prepend-icon="mdi-arrow-left" to="/Committee/check_confirm">ย้อนกลับ</v-btn>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { api, commit } from '~/API/base'

const error = ref<Record<string, string>>({})
const file = ref<File | null>(null)
const result = ref<any>({})
const id_eva = useRoute().params.id_eva

const headers = { Authorization: `Bearer ${import.meta.client ? localStorage.getItem('token') : ''}` }

const reset = () => {
    file.value = null
}

// ตรวจสอบไฟล์ก่อนอัปโหลด
function validate() {
    error.value = {}
    const maxSize = 10 * 1024 * 1024
    if (!file.value) error.value.file = 'กรุณาเลือกไฟล์เอกสาร'
    else if (file.value.size > maxSize) error.value.file = 'ไฟล์มีขนาดเกิน 10MB'
    return Object.keys(error.value).length === 0
}

const saveMember = async () => {
    if (!validate()) return
    const formdata = new FormData()
    formdata.append('file', file.value!)
    try {
        await axios.post(`${commit}/signature/${id_eva}`, formdata, { headers })
        alert('ดำเนินการสำเร็จ')
        reset()
        await fetch()
    } catch (error) {
        console.error('Error save', error)
    }
}

const fetch = async () => {
    try {
        const res = await axios.get(`${commit}/signature/show/${id_eva}`, { headers })
        result.value = res.data
    } catch (error) {
        console.error('error get', error)
    }
}

const del = async () => {
    if (!confirm('ต้องการลบข้อมูลชุดนี้ใช่หรือไม่')) return
    try {
        await axios.delete(`${commit}/signature/delete/${id_eva}`, { headers })
        await fetch()
        reset()
    } catch (error) {
        console.error('error delete', error)
        alert(axios.isAxiosError(error) ? error.response?.data?.message ?? 'ลบเอกสารไม่สำเร็จ' : 'ลบเอกสารไม่สำเร็จ')
    }
}

// เปิดไฟล์ลายเซ็นในแท็บใหม่
const view = (file: string) => {
    window.open(new URL(`/uploads/signature/${file}`, api).href, '_blank')
}

onMounted(fetch)
</script>
