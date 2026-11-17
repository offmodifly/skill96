<template>
    <v-container>
        <PageHeader title="รายงานผลการประเมิน" subtitle="กดปุ่มพิมพ์เพื่อพิมพ์หรือบันทึกเป็น PDF" icon="mdi-file-chart" color="#7d0c14" class="d-print-none" />

        <!-- แสดงผลเมื่อประเมินตนเองแล้ว (สถานะ 2 หรือ 3) -->
        <div v-if="user.status_eva === 2 || user.status_eva === 3">
            <!-- หัวรายงาน -->
            <div class="text-center mb-6">
                <div class="text-headline-small font-weight-bold">รายงานผลการประเมิน</div>
                <div>{{ user.fname }} {{ user.lname }} · รอบที่ {{ user.round_sys }} / ปี {{ user.year_sys }}</div>
            </div>

            <!-- หัวข้อละ 1 ตาราง -->
            <v-card v-for="(topic, t) in topics" :key="topic.id_topic" rounded="xl" elevation="2" class="mb-6">
                <v-card-title class="pa-4 bg-red-lighten-5">{{ t + 1 }}. {{ topic.name_topic }}</v-card-title>
                <v-table>
                    <thead>
                        <tr>
                            <th>ตัวชี้วัด</th>
                            <th>รายละเอียดตัวชี้วัด</th>
                            <th class="text-center">น้ำหนัก</th>
                            <th class="text-center">คะแนนเต็ม</th>
                            <th class="text-center">คะแนนที่ได้</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="indicate in topic.indicates" :key="indicate.id_indicate">
                            <td>{{ indicate.name_indicate }}</td>
                            <td>{{ indicate.detail_indicate }}</td>
                            <td class="text-center">{{ indicate.point_indicate }}</td>
                            <td class="text-center">{{ indicate.point_indicate * 4 }}</td>
                            <td class="text-center">{{ average(indicate.id_indicate) }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card>

            <div class="text-end mb-6">
                <v-chip color="success" variant="flat" size="x-large" prepend-icon="mdi-trophy">คะแนนรวม : {{ (user.total_commit / 3).toFixed(2) }} คะแนน</v-chip>
            </div>

            <!-- ลายเซ็นกรรมการ -->
            <v-card rounded="xl" elevation="2" class="pa-4">
                <div class="text-title-medium font-weight-bold mb-4">ลงชื่อกรรมการประเมิน</div>
                <v-row>
                    <v-col cols="12" md="4" v-for="commit in commits" :key="commit.id_commit" class="text-center">
                        <v-img v-if="commit.signature" :src="signUrl(commit.signature)" height="80" class="mb-2"></v-img>
                        <div v-else class="text-medium-emphasis py-6">รอ{{ commit.level_commit }}ประเมิน</div>
                        <v-divider class="mb-2"></v-divider>
                        <div>{{ commit.fname }} {{ commit.lname }}</div>
                        <div class="text-medium-emphasis">{{ commit.level_commit }}</div>
                    </v-col>
                </v-row>
            </v-card>

            <!-- d-print-none = ซ่อนตอนพิมพ์ -->
            <div class="text-center mt-6 d-print-none">
                <v-btn color="primary" size="large" prepend-icon="mdi-printer" @click="print()">พิมพ์</v-btn>
            </div>
        </div>

        <v-alert v-else-if="user.status_eva === 1" type="warning" variant="tonal" rounded="xl">ยังไม่ได้ประเมินตนเอง</v-alert>
        <v-alert v-else type="error" variant="tonal" rounded="xl">ไม่มีแบบประเมิน</v-alert>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { api, eva } from '~/API/base'

const user = ref<any>({})
const topics = ref<any[]>([])
const scores = ref<any>({})
const commits = ref<any[]>([])

const print = () => window.print()

// ที่อยู่รูปลายเซ็น
const signUrl = (file: string) => new URL(`/uploads/signature/${file}`, api).href

// คะแนนเฉลี่ยของกรรมการ 3 คน (a = ประธาน, b = กรรมการ, c = เลขา)
const average = (id: number) => {
    const s = scores.value[id] ?? {}
    return (((s.a ?? 0) + (s.b ?? 0) + (s.c ?? 0)) / 3).toFixed(2)
}

const fetch = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    try {
        const res = await axios.get(`${eva}/selfeva/user`, { headers })
        user.value = res.data
        const res2 = await axios.get(`${eva}/selfeva/topic`, { headers })
        topics.value = res2.data
        const res3 = await axios.get(`${eva}/score_commit/scores`, { headers })
        scores.value = res3.data
        const res4 = await axios.get(`${eva}/score_commit/commit`, { headers })
        commits.value = res4.data
    } catch (error) {
        console.error('error get', error)
    }
}

onMounted(fetch)
</script>

<style scoped>
/* ตอนพิมพ์ ให้ตารางมีเส้นขอบสีดำ */
@media print {
    td, th {
        border: 1px solid black !important;
        color: black !important;
    }
}
</style>
