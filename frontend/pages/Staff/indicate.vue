<template>
    <v-container>
        <PageHeader title="จัดการตัวชี้วัด" subtitle="กำหนดตัวชี้วัดและน้ำหนักคะแนนของแต่ละหัวข้อ" icon="mdi-chart-box-outline" />

        <!-- ฟอร์มเพิ่ม / แก้ไข -->
        <v-card rounded="xl" elevation="2" class="pa-4 mb-6">
            <v-card-title>
                <v-icon :icon="form.id_indicate ? 'mdi-pencil' : 'mdi-plus-circle'" color="blue-grey" class="me-2"></v-icon>
                {{ form.id_indicate ? 'แก้ไขตัวชี้วัด' : 'เพิ่มตัวชี้วัด' }}
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="saveMember">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select label="หัวข้อการประเมิน" v-model="form.id_topic" :error-messages="error.id_topic" :items="topics" item-title="name_topic" item-value="id_topic" variant="outlined"></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field label="ชื่อตัวชี้วัด" v-model="form.name_indicate" :error-messages="error.name_indicate" variant="outlined"></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-textarea label="รายละเอียดตัวชี้วัด" v-model="form.detail_indicate" rows="3" variant="outlined"></v-textarea>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select label="น้ำหนักคะแนน" v-model="form.point_indicate" :error-messages="error.point_indicate" :items="[1, 2, 3, 4, 5]" variant="outlined"></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select label="ประเภทสมาชิก" v-model="form.check_indicate" :error-messages="error.check_indicate" :items="checkItems" variant="outlined"></v-select>
                        </v-col>
                    </v-row>
                    <div class="text-center">
                        <v-btn color="primary" type="submit" prepend-icon="mdi-content-save" class="ma-2">{{ form.id_indicate ? 'อัปเดต' : 'บันทึก' }}</v-btn>
                        <v-btn color="error" variant="tonal" prepend-icon="mdi-close" class="ma-2" @click="reset()">ยกเลิก</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- ตารางข้อมูล -->
        <v-card rounded="xl" elevation="2">
            <v-card-text>
                <v-text-field v-model="search" label="ค้นหาตัวชี้วัด" prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details></v-text-field>
            </v-card-text>
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>หัวข้อการประเมิน</th>
                        <th>ชื่อตัวชี้วัด</th>
                        <th>รายละเอียด</th>
                        <th class="text-center">น้ำหนัก</th>
                        <th class="text-center">ประเภทสมาชิก</th>
                        <th class="text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_indicate">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.name_topic }}</td>
                        <td>{{ items.name_indicate }}</td>
                        <td>{{ items.detail_indicate || '-' }}</td>
                        <td class="text-center">
                            <v-chip color="blue-grey" size="small">{{ items.point_indicate }}</v-chip>
                        </td>
                        <td class="text-center">
                            <v-chip :color="items.check_indicate === 'y' ? 'success' : 'grey'" size="small">
                                {{ items.check_indicate === 'y' ? 'มี' : 'ไม่มี' }}
                            </v-chip>
                        </td>
                        <td class="text-center">
                            <v-btn icon="mdi-pencil" color="warning" variant="tonal" size="small" class="ma-1" @click="edit(items)"></v-btn>
                            <v-btn icon="mdi-delete" color="error" variant="tonal" size="small" class="ma-1" @click="del(items.id_indicate)"></v-btn>
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
const dataResult = ref<any[]>([])
const topics = ref<any[]>([])
const search = ref('')
const checkItems = [
    { title: 'มี', value: 'y' },
    { title: 'ไม่มี', value: 'n' },
]

const emptyForm = () => ({
    id_indicate: null,
    id_topic: '',
    name_indicate: '',
    detail_indicate: '',
    point_indicate: '',
    check_indicate: '',
})
const form = ref<any>(emptyForm())

const reset = () => {
    form.value = emptyForm()
    error.value = {}
}

function validate() {
    const f = form.value
    error.value = {}
    if (!f.id_topic) error.value.id_topic = 'กรุณาเลือกหัวข้อการประเมิน'
    if (!f.name_indicate.trim()) error.value.name_indicate = 'กรุณากรอกชื่อตัวชี้วัด'
    if (!f.point_indicate) error.value.point_indicate = 'กรุณาเลือกน้ำหนักคะแนน'
    if (!f.check_indicate) error.value.check_indicate = 'กรุณาเลือกประเภทตัวเลือก'
    return Object.keys(error.value).length === 0
}

const token = import.meta.client ? localStorage.getItem('token') : null
const headers = { Authorization: `Bearer ${token}` }

const saveMember = async () => {
    if (!validate()) return
    const f = form.value
    try {
        f.id_indicate
            ? await axios.put(`${staff}/indicate/update/${f.id_indicate}`, f, { headers })
            : await axios.post(`${staff}/indicate/save`, f, { headers })
        alert('ดำเนินการสำเร็จ')
        reset()
        await fetch()
    } catch (error) {
        console.error('Error save', error)
    }
}

const fetch = async () => {
    try {
        const res = await axios.get(`${staff}/indicate/show`, { headers })
        dataResult.value = res.data
        const res2 = await axios.get(`${staff}/topic/show`, { headers })
        topics.value = res2.data
    } catch (error) {
        console.error('error get', error)
    }
}

const edit = (items: any) => {
    form.value = { ...items }
}

const del = async (id_indicate: number) => {
    if (!confirm('ต้องการลบข้อมูลชุดนี้ใช่หรือไม่')) return
    try {
        await axios.delete(`${staff}/indicate/delete/${id_indicate}`, { headers })
        await fetch()
        reset()
    } catch (error) {
        console.error('error delete', error)
    }
}

const result = computed(() => {
    const s = search.value.toLowerCase()
    return dataResult.value.filter((item) => item.name_indicate.toLowerCase().includes(s))
})

onMounted(fetch)
</script>
