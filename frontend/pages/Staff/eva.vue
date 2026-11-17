<template>
    <v-container>
        <PageHeader title="จัดการแบบประเมิน" subtitle="สร้างแบบประเมินให้ผู้รับการประเมินผลในแต่ละรอบ" icon="mdi-file-document-edit" />

        <!-- ฟอร์มเพิ่ม / แก้ไข -->
        <v-card rounded="xl" elevation="2" class="pa-4 mb-6">
            <v-card-title>
                <v-icon :icon="form.id_eva ? 'mdi-pencil' : 'mdi-plus-circle'" color="blue-grey" class="me-2"></v-icon>
                {{ form.id_eva ? 'แก้ไขแบบประเมิน' : 'เพิ่มแบบประเมิน' }}
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="saveMember">
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-select label="ผู้รับการประเมินผล" v-model="form.id_member" :error-messages="error.id_member" :items="evaItems" variant="outlined"></v-select>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-select label="รอบการประเมิน" v-model="form.id_sys" :error-messages="error.id_sys" :items="roundItems" variant="outlined"></v-select>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-text-field label="วันที่ออกแบบประเมิน" v-model="form.day_eva" :error-messages="error.day_eva" type="date" variant="outlined"></v-text-field>
                        </v-col>
                    </v-row>
                    <div class="text-center">
                        <v-btn color="primary" type="submit" prepend-icon="mdi-content-save" class="ma-2">{{ form.id_eva ? 'อัปเดต' : 'บันทึก' }}</v-btn>
                        <v-btn color="error" variant="tonal" prepend-icon="mdi-close" class="ma-2" @click="reset()">ยกเลิก</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- ตารางข้อมูล -->
        <v-card rounded="xl" elevation="2">
            <v-card-text>
                <v-text-field v-model="search" label="ค้นหาชื่อผู้รับการประเมินผล" prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details></v-text-field>
            </v-card-text>
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ผู้รับการประเมินผล</th>
                        <th class="text-center">รอบการประเมิน</th>
                        <th class="text-center">วันที่ออกแบบประเมิน</th>
                        <th class="text-center">กรรมการ</th>
                        <th class="text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_eva">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.fname }} {{ items.lname }}</td>
                        <td class="text-center">รอบที่ {{ items.round_sys }} / ปี {{ items.year_sys }}</td>
                        <td class="text-center">{{ formatDate(items.day_eva) }}</td>
                        <td class="text-center">
                            <v-btn color="success" variant="tonal" size="small" prepend-icon="mdi-account-multiple-plus" :to="`/Staff/commit-eva-${items.id_eva}`">เพิ่มกรรมการ</v-btn>
                        </td>
                        <td class="text-center">
                            <v-btn icon="mdi-pencil" color="warning" variant="tonal" size="small" class="ma-1" @click="edit(items)"></v-btn>
                            <v-btn icon="mdi-delete" color="error" variant="tonal" size="small" class="ma-1" @click="del(items.id_eva)"></v-btn>
                        </td>
                    </tr>
                    <tr v-if="result.length === 0">
                        <td colspan="6" class="text-center text-medium-emphasis py-6">ไม่พบข้อมูล</td>
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
const eva = ref<any[]>([])
const round = ref<any[]>([])
const search = ref('')

const emptyForm = () => ({ id_eva: null, id_member: '', id_sys: '', day_eva: '' })
const form = ref<any>(emptyForm())

// แปลงข้อมูลให้อยู่ในรูป { title, value } สำหรับ v-select
const evaItems = computed(() => eva.value.map((t) => ({ title: `${t.fname} ${t.lname}`, value: t.id_member })))
const roundItems = computed(() => round.value.map((t) => ({ title: `รอบที่ ${t.round_sys} / ปี ${t.year_sys}`, value: t.id_sys })))

const reset = () => {
    form.value = emptyForm()
    error.value = {}
}

function validate() {
    const f = form.value
    error.value = {}
    if (!f.id_member) error.value.id_member = 'กรุณาเลือกผู้รับการประเมินผล'
    if (!f.id_sys) error.value.id_sys = 'กรุณาเลือกรอบการประเมิน'
    if (!f.day_eva) error.value.day_eva = 'กรุณากรอกวันที่ออกแบบประเมิน'
    return Object.keys(error.value).length === 0
}

const token = import.meta.client ? localStorage.getItem('token') : null
const headers = { Authorization: `Bearer ${token}` }

const saveMember = async () => {
    if (!validate()) return
    const f = form.value
    try {
        f.id_eva
            ? await axios.put(`${staff}/eva/update/${f.id_eva}`, f, { headers })
            : await axios.post(`${staff}/eva/save`, f, { headers })
        alert('ดำเนินการสำเร็จ')
        reset()
        await fetch()
    } catch (error) {
        console.error('Error save', error)
    }
}

const fetch = async () => {
    try {
        const res = await axios.get(`${staff}/eva/show`, { headers })
        dataResult.value = res.data
        const res2 = await axios.get(`${staff}/member/showE`, { headers })
        eva.value = res2.data
        const res3 = await axios.get(`${staff}/system/showY`, { headers })
        round.value = res3.data
    } catch (error) {
        console.error('error get', error)
    }
}

// ช่อง type="date" ต้องการรูปแบบ yyyy-mm-dd จึงตัดเอา 10 ตัวแรก
const edit = (items: any) => {
    form.value = { ...items, day_eva: items.day_eva?.slice(0, 10) }
}

const del = async (id_eva: number) => {
    if (!confirm('ต้องการลบข้อมูลชุดนี้ใช่หรือไม่')) return
    try {
        await axios.delete(`${staff}/eva/delete/${id_eva}`, { headers })
        await fetch()
        reset()
    } catch (error) {
        console.error('error delete', error)
    }
}

const formatDate = (dateStr: string) => (dateStr ? new Date(dateStr).toLocaleDateString('th-TH') : '-')

const result = computed(() => {
    const s = search.value.toLowerCase()
    return dataResult.value.filter((item) => `${item.fname} ${item.lname}`.toLowerCase().includes(s))
})

onMounted(fetch)
</script>
