<template>
    <v-container>
        <PageHeader title="เอกสารและคู่มือการประเมิน" subtitle="อัปโหลดไฟล์ PDF ให้ผู้ใช้ทุกคนดาวน์โหลดได้" icon="mdi-file-pdf-box" />

        <!-- ฟอร์มอัปโหลด -->
        <v-card rounded="xl" elevation="2" class="pa-4 mb-6">
            <v-card-title>
                <v-icon icon="mdi-upload" color="blue-grey" class="me-2"></v-icon>
                อัปโหลดเอกสาร
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="saveMember">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field label="ชื่อเอกสาร" v-model="name_doc" :error-messages="error.name_doc" prepend-inner-icon="mdi-file-edit" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-file-input label="เลือกไฟล์ PDF" v-model="file" :error-messages="error.file" accept=".pdf" hint="รองรับเฉพาะไฟล์ PDF ขนาดไม่เกิน 10MB" persistent-hint variant="outlined" prepend-icon="" prepend-inner-icon="mdi-paperclip"></v-file-input>
                        </v-col>
                    </v-row>
                    <div class="text-center">
                        <v-btn color="primary" type="submit" prepend-icon="mdi-content-save" class="ma-2">บันทึก</v-btn>
                        <v-btn color="error" variant="tonal" prepend-icon="mdi-close" class="ma-2" @click="reset()">ยกเลิก</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- ตารางข้อมูล -->
        <v-card rounded="xl" elevation="2">
            <v-card-text>
                <v-text-field v-model="search" label="ค้นหาชื่อเอกสาร" prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details></v-text-field>
            </v-card-text>
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ชื่อเอกสาร</th>
                        <th class="text-center">วันที่ออกเอกสาร</th>
                        <th class="text-center">เอกสาร</th>
                        <th class="text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_doc">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>
                            <v-icon icon="mdi-file-pdf-box" color="red" class="me-1"></v-icon>
                            {{ items.name_doc }}
                        </td>
                        <td class="text-center">{{ formatDate(items.day_doc) }}</td>
                        <td class="text-center">
                            <v-btn color="info" variant="tonal" size="small" prepend-icon="mdi-eye" @click="view(items.file)">เปิดดู</v-btn>
                        </td>
                        <td class="text-center">
                            <v-btn icon="mdi-delete" color="error" variant="tonal" size="small" @click="del(items.id_doc)"></v-btn>
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
import { api, staff } from '~/API/base'

const error = ref<Record<string, string>>({})
const dataResult = ref<any[]>([])
const search = ref('')
const name_doc = ref('')
const file = ref<File | null>(null)

const reset = () => {
    name_doc.value = ''
    file.value = null
    error.value = {}
}

function validate() {
    error.value = {}
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (!name_doc.value.trim()) error.value.name_doc = 'กรุณากรอกชื่อเอกสาร'
    if (!file.value) error.value.file = 'กรุณาเลือกไฟล์เอกสาร'
    else if (file.value.size > maxSize) error.value.file = 'ไฟล์มีขนาดเกิน 10MB'
    return Object.keys(error.value).length === 0
}

const token = import.meta.client ? localStorage.getItem('token') : null
const headers = { Authorization: `Bearer ${token}` }

const saveMember = async () => {
    if (!validate()) return
    const formdata = new FormData()
    formdata.append('name_doc', name_doc.value)
    formdata.append('file', file.value!)
    try {
        await axios.post(`${staff}/doc/save`, formdata, { headers })
        alert('ดำเนินการสำเร็จ')
        reset()
        await fetch()
    } catch (error) {
        console.error('Error save', error)
    }
}

const fetch = async () => {
    try {
        const res = await axios.get(`${staff}/doc/show`, { headers })
        dataResult.value = res.data
    } catch (error) {
        console.error('error get', error)
    }
}

const del = async (id_doc: number) => {
    if (!confirm('ต้องการลบข้อมูลชุดนี้ใช่หรือไม่')) return
    try {
        await axios.delete(`${staff}/doc/delete/${id_doc}`, { headers })
        await fetch()
    } catch (error) {
        console.error('error delete', error)
    }
}

const formatDate = (dateStr: string) => (dateStr ? new Date(dateStr).toLocaleDateString('th-TH') : '-')

const result = computed(() => {
    const s = search.value.toLowerCase()
    return dataResult.value.filter((item) => item.name_doc.toLowerCase().includes(s))
})

// เปิดไฟล์ PDF ในแท็บใหม่
const view = (file: string) => {
    window.open(new URL(`/uploads/document/${file}`, api).href, '_blank')
}

onMounted(fetch)
</script>
