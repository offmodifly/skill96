<template>
    <v-container>
        <PageHeader title="จัดการรอบการประเมิน" subtitle="กำหนดวันเปิด-ปิด รอบ และปีการประเมิน" icon="mdi-calendar-range" />

        <!-- ฟอร์มเพิ่ม / แก้ไข -->
        <v-card rounded="xl" elevation="2" class="pa-4 mb-6">
            <v-card-title>
                <v-icon :icon="form.id_sys ? 'mdi-pencil' : 'mdi-plus-circle'" color="blue-grey" class="me-2"></v-icon>
                {{ form.id_sys ? 'แก้ไขรอบการประเมิน' : 'เพิ่มรอบการประเมิน' }}
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="saveMember">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field label="วันที่เปิดรอบการประเมิน" v-model="form.day_open" :error-messages="error.day_open" type="date" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="วันที่ปิดรอบการประเมิน" v-model="form.day_out" :error-messages="error.day_out" type="date" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="รอบการประเมิน" v-model="form.round_sys" :error-messages="error.round_sys" type="number" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="ปีการประเมิน" v-model="form.year_sys" :error-messages="error.year_sys" type="number" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-select label="สถานะการประเมิน" v-model="form.status_sys" :items="statusItems" variant="outlined"></v-select>
                        </v-col>
                    </v-row>
                    <div class="text-center">
                        <v-btn color="primary" type="submit" prepend-icon="mdi-content-save" class="ma-2">{{ form.id_sys ? 'อัปเดต' : 'บันทึก' }}</v-btn>
                        <v-btn color="error" variant="tonal" prepend-icon="mdi-close" class="ma-2" @click="reset()">ยกเลิก</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- ตารางข้อมูล -->
        <v-card rounded="xl" elevation="2">
            <v-card-title class="pa-4">
                <v-icon icon="mdi-format-list-bulleted" color="blue-grey" class="me-2"></v-icon>
                รายการรอบการประเมิน
            </v-card-title>
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th class="text-center">วันที่เปิด</th>
                        <th class="text-center">วันที่ปิด</th>
                        <th class="text-center">รอบ</th>
                        <th class="text-center">ปี</th>
                        <th class="text-center">สถานะ</th>
                        <th class="text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_sys">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td class="text-center">{{ formatDate(items.day_open) }}</td>
                        <td class="text-center">{{ formatDate(items.day_out) }}</td>
                        <td class="text-center">{{ items.round_sys }}</td>
                        <td class="text-center">{{ items.year_sys }}</td>
                        <td class="text-center">
                            <v-chip :color="items.status_sys === 'y' ? 'success' : 'error'" size="small" variant="flat">
                                {{ items.status_sys === 'y' ? 'เปิด' : 'ปิด' }}
                            </v-chip>
                        </td>
                        <td class="text-center">
                            <v-btn icon="mdi-pencil" color="warning" variant="tonal" size="small" class="ma-1" @click="edit(items)"></v-btn>
                            <v-btn icon="mdi-delete" color="error" variant="tonal" size="small" class="ma-1" @click="del(items.id_sys)"></v-btn>
                        </td>
                    </tr>
                    <tr v-if="result.length === 0">
                        <td colspan="7" class="text-center text-medium-emphasis py-6">ไม่พบข้อมูล</td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { staff } from '~/API/base'

const error = ref<Record<string, string>>({})
const result = ref<any[]>([])
const statusItems = [
    { title: 'เปิด', value: 'y' },
    { title: 'ปิด', value: 'n' },
]

const emptyForm = () => ({
    id_sys: null,
    day_open: '',
    day_out: '',
    round_sys: '',
    year_sys: '',
    status_sys: '',
})
const form = ref<any>(emptyForm())

const reset = () => {
    form.value = emptyForm()
    error.value = {}
}

function validate() {
    const f = form.value
    error.value = {}
    if (!f.day_open) error.value.day_open = 'กรุณากรอกวันที่เปิดรอบการประเมิน'
    if (!f.day_out) error.value.day_out = 'กรุณากรอกวันที่ปิดรอบการประเมิน'
    if (!f.round_sys) error.value.round_sys = 'กรุณากรอกรอบการประเมิน'
    if (!f.year_sys) error.value.year_sys = 'กรุณากรอกปีการประเมิน'
    return Object.keys(error.value).length === 0
}

const token = import.meta.client ? localStorage.getItem('token') : null
const headers = { Authorization: `Bearer ${token}` }

const saveMember = async () => {
    if (!validate()) return
    const f = form.value
    try {
        f.id_sys
            ? await axios.put(`${staff}/system/update/${f.id_sys}`, f, { headers })
            : await axios.post(`${staff}/system/save`, f, { headers })
        alert('ดำเนินการสำเร็จ')
        reset()
        await fetch()
    } catch (error) {
        console.error('Error save', error)
    }
}

const fetch = async () => {
    try {
        const res = await axios.get(`${staff}/system/show`, { headers })
        result.value = res.data
    } catch (error) {
        console.error('error get', error)
    }
}

// ช่อง type="date" ต้องการรูปแบบ yyyy-mm-dd จึงตัดเอา 10 ตัวแรก
const edit = (items: any) => {
    form.value = {
        ...items,
        day_open: items.day_open?.slice(0, 10),
        day_out: items.day_out?.slice(0, 10),
    }
}

const del = async (id_sys: number) => {
    if (!confirm('ต้องการลบข้อมูลชุดนี้ใช่หรือไม่')) return
    try {
        await axios.delete(`${staff}/system/delete/${id_sys}`, { headers })
        await fetch()
        reset()
    } catch (error) {
        console.error('error delete', error)
    }
}

const formatDate = (dateStr: string) => (dateStr ? new Date(dateStr).toLocaleDateString('th-TH') : '-')

onMounted(fetch)
</script>
