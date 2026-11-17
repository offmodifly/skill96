<template>
    <v-container>
        <PageHeader title="หน้าหลักผู้รับการประเมินผล" subtitle="ภาพรวมแบบประเมินของคุณ" icon="mdi-view-dashboard" color="#7d0c14" />

        <!-- การ์ดสรุปตัวเลข -->
        <v-row>
            <v-col cols="12" md="4" v-for="(b, i) in box" :key="b.title">
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

        <!-- ตารางรอบการประเมิน -->
        <v-card rounded="xl" elevation="2" class="mt-6">
            <v-card-title class="pa-4">
                <v-icon icon="mdi-calendar-check" color="red-darken-4" class="me-2"></v-icon>
                รอบการประเมินทั้งหมด
            </v-card-title>
            <v-table hover>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th class="text-center">รอบการประเมิน</th>
                        <th class="text-center">ปีการประเมิน</th>
                        <th class="text-center">สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in rounds" :key="item.id_eva">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ item.fname }} {{ item.lname }}</td>
                        <td class="text-center">{{ item.round_sys }}</td>
                        <td class="text-center">{{ item.year_sys }}</td>
                        <td class="text-center">
                            <v-chip :color="status[item.status_eva]?.color" variant="flat" size="small">{{ status[item.status_eva]?.text }}</v-chip>
                        </td>
                    </tr>
                    <tr v-if="rounds.length === 0">
                        <td colspan="5" class="text-center text-medium-emphasis py-6">ยังไม่มีรอบการประเมิน</td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { api, eva } from '~/API/base'

const box = ref<any[]>([])
const rounds = ref<any[]>([])

// สีและไอคอนของการ์ดแต่ละใบ (เรียงตามลำดับการ์ด)
const cards = [
    { color: 'blue', icon: 'mdi-file-document-multiple' },
    { color: 'success', icon: 'mdi-check-circle' },
    { color: 'error', icon: 'mdi-clock-alert' },
]

// สถานะการประเมิน 1, 2, 3
const status: any = {
    1: { text: 'รอการประเมินตนเอง', color: 'error' },
    2: { text: 'รอกรรมการประเมิน', color: 'warning' },
    3: { text: 'ประเมินสำเร็จ', color: 'success' },
}

const fetch = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    try {
        const res = await axios.get(`${api}/dash/eva`, { headers })
        box.value = res.data.box
        const res2 = await axios.get(`${eva}/table`, { headers })
        rounds.value = res2.data
    } catch (error) {
        console.error('error get', error)
    }
}

onMounted(fetch)
</script>
