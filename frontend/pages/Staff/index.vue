<template>
    <v-container>
        <PageHeader title="หน้าหลักฝ่ายบุคลากร" subtitle="ภาพรวมระบบประเมินบุคลากร" icon="mdi-view-dashboard" />

        <!-- การ์ดสรุปตัวเลข -->
        <v-row>
            <v-col cols="12" sm="6" md="4" v-for="(b, i) in [...box, ...box2]" :key="b.title">
                <v-card :color="cards[i].color" variant="tonal" rounded="xl" class="pa-4">
                    <div class="d-flex align-center">
                        <v-avatar :color="cards[i].color" size="56" class="me-4">
                            <v-icon :icon="cards[i].icon" color="white" size="28"></v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-body-medium">{{ b.title }}</div>
                            <div class="text-headline-large font-weight-bold">{{ b.value }}</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- ตารางผู้รับการประเมินผล -->
        <v-card rounded="xl" class="mt-6" elevation="4">
            <v-card-title class="d-flex align-center pa-4">
                <v-icon icon="mdi-account-group" color="blue-grey" class="me-2"></v-icon>
                ผู้รับการประเมินผล
            </v-card-title>
            <v-divider></v-divider>

            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ผู้รับการประเมินผล</th>
                        <th class="text-center">รอบการประเมิน</th>
                        <th class="text-center">วันที่ออกแบบประเมิน</th>
                        <th class="text-center">สถานะการประเมิน</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_eva">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.fname }} {{ items.lname }}</td>
                        <td class="text-center">รอบที่ {{ items.round_sys }} / ปี {{ items.year_sys }}</td>
                        <td class="text-center">{{ formatDate(items.day_eva) }}</td>
                        <td class="text-center">
                            <v-chip :color="status[items.status_eva].color" variant="flat" size="small">
                                {{ status[items.status_eva].text }}
                            </v-chip>
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

const result = ref<any[]>([])
const box = ref<any[]>([])
const box2 = ref<any[]>([])

// สีและไอคอนของการ์ดแต่ละใบ (เรียงตามลำดับการ์ด)
const cards = [
    { color: 'blue-grey', icon: 'mdi-account-tie' },
    { color: 'indigo', icon: 'mdi-account-school' },
    { color: 'blue', icon: 'mdi-account-star' },
    { color: 'teal', icon: 'mdi-file-document-multiple' },
    { color: 'success', icon: 'mdi-check-circle' },
    { color: 'error', icon: 'mdi-clock-alert' },
]

// สถานะการประเมิน 1, 2, 3
const status: any = {
    1: { text: 'รอการประเมินตนเอง', color: 'error' },
    2: { text: 'รอกรรมการประเมิน', color: 'warning' },
    3: { text: 'ประเมินสำเร็จ', color: 'success' },
}

const token = import.meta.client ? localStorage.getItem('token') : null

const fetch = async () => {
    try {
        const headers = { Authorization: `Bearer ${token}` }
        const res = await axios.get(`${staff}/eva/show`, { headers })
        result.value = res.data
        const res2 = await axios.get(`${api}/dash/staff`, { headers })
        box.value = res2.data.box
        box2.value = res2.data.box2
    } catch (error) {
        console.error('error get', error)
    }
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('th-TH')
}

onMounted(fetch)
</script>
