<template>
    <v-container>
        <PageHeader title="จัดการหัวข้อการประเมิน" subtitle="เพิ่ม แก้ไข และลบหัวข้อการประเมิน" icon="mdi-format-list-bulleted" />

        <!-- ฟอร์มเพิ่ม / แก้ไข -->
        <v-card rounded="xl" elevation="2" class="pa-4 mb-6">
            <v-card-title>
                <v-icon :icon="form.id_topic ? 'mdi-pencil' : 'mdi-plus-circle'" color="blue-grey" class="me-2"></v-icon>
                {{ form.id_topic ? 'แก้ไขหัวข้อการประเมิน' : 'เพิ่มหัวข้อการประเมิน' }}
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="saveMember">
                    <v-text-field label="ชื่อหัวข้อการประเมิน" v-model="form.name_topic" :error-messages="error.name_topic" variant="outlined" prepend-inner-icon="mdi-text"></v-text-field>
                    <div class="text-center">
                        <v-btn color="primary" type="submit" prepend-icon="mdi-content-save" class="ma-2">{{ form.id_topic ? 'อัปเดต' : 'บันทึก' }}</v-btn>
                        <v-btn color="error" variant="tonal" prepend-icon="mdi-close" class="ma-2" @click="reset()">ยกเลิก</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- ตารางข้อมูล -->
        <v-card rounded="xl" elevation="2">
            <v-card-text>
                <v-text-field v-model="search" label="ค้นหาหัวข้อ" prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details></v-text-field>
            </v-card-text>
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ชื่อหัวข้อการประเมิน</th>
                        <th class="text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_topic">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.name_topic }}</td>
                        <td class="text-center">
                            <v-btn icon="mdi-pencil" color="warning" variant="tonal" size="small" class="ma-1" @click="edit(items)"></v-btn>
                            <v-btn icon="mdi-delete" color="error" variant="tonal" size="small" class="ma-1" @click="del(items.id_topic)"></v-btn>
                        </td>
                    </tr>
                    <tr v-if="result.length === 0">
                        <td colspan="3" class="text-center text-medium-emphasis py-6">ไม่พบข้อมูล</td>
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
const search = ref('')
const form = ref<any>({ id_topic: null, name_topic: '' })

const reset = () => {
    form.value = { id_topic: null, name_topic: '' }
    error.value = {}
}

function validate() {
    error.value = {}
    if (!form.value.name_topic.trim()) error.value.name_topic = 'กรุณากรอกชื่อหัวข้อการประเมิน'
    return Object.keys(error.value).length === 0
}

const token = import.meta.client ? localStorage.getItem('token') : null
const headers = { Authorization: `Bearer ${token}` }

const saveMember = async () => {
    if (!validate()) return
    const f = form.value
    try {
        f.id_topic
            ? await axios.put(`${staff}/topic/update/${f.id_topic}`, f, { headers })
            : await axios.post(`${staff}/topic/save`, f, { headers })
        alert('ดำเนินการสำเร็จ')
        reset()
        await fetch()
    } catch (error) {
        console.error('Error save', error)
    }
}

const fetch = async () => {
    try {
        const res = await axios.get(`${staff}/topic/show`, { headers })
        dataResult.value = res.data
    } catch (error) {
        console.error('error get', error)
    }
}

const edit = (items: any) => {
    form.value = { ...items }
}

const del = async (id_topic: number) => {
    if (!confirm('ต้องการลบข้อมูลชุดนี้ใช่หรือไม่')) return
    try {
        await axios.delete(`${staff}/topic/delete/${id_topic}`, { headers })
        await fetch()
        reset()
    } catch (error) {
        console.error('error delete', error)
    }
}

// กรองข้อมูลตามคำค้นหา
const result = computed(() => {
    const s = search.value.toLowerCase()
    return dataResult.value.filter((item) => item.name_topic.toLowerCase().includes(s))
})

onMounted(fetch)
</script>
