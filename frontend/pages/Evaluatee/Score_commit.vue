<template>
    <v-container>
        <PageHeader title="ผลการประเมินของกรรมการ" subtitle="คะแนนจากประธาน กรรมการ และเลขา แยกตามหัวข้อ" icon="mdi-account-group" color="#7d0c14" />

        <!-- แสดงผลเมื่อประเมินตนเองแล้ว (สถานะ 2 หรือ 3) -->
        <div v-if="user.status_eva === 2 || user.status_eva === 3">
            <v-card rounded="xl" elevation="2" class="mb-6">
                <v-list-item prepend-icon="mdi-account-circle" :title="`${user.fname} ${user.lname}`" :subtitle="`รอบที่ ${user.round_sys} / ปี ${user.year_sys}`" class="pa-4"></v-list-item>
            </v-card>

            <!-- หัวข้อละ 1 การ์ด -->
            <v-card v-for="(topic, t) in topics" :key="topic.id_topic" rounded="xl" elevation="2" class="mb-6">
                <v-card-title class="pa-4 bg-red-lighten-5">{{ t + 1 }}. {{ topic.name_topic }}</v-card-title>
                <v-table hover>
                    <thead>
                        <tr>
                            <th>ตัวชี้วัด</th>
                            <th>รายละเอียดตัวชี้วัด</th>
                            <th class="text-center">น้ำหนัก</th>
                            <th class="text-center">คะแนนเต็ม</th>
                            <th class="text-center">ประธาน</th>
                            <th class="text-center">กรรมการ</th>
                            <th class="text-center">เลขา</th>
                            <th class="text-center">คะแนนเฉลี่ย</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="indicate in topic.indicates" :key="indicate.id_indicate">
                            <td>{{ indicate.name_indicate }}</td>
                            <td>{{ indicate.detail_indicate }}</td>
                            <td class="text-center">{{ indicate.point_indicate }}</td>
                            <td class="text-center">{{ indicate.point_indicate * 4 }}</td>
                            <td class="text-center">{{ scores[indicate.id_indicate]?.a ?? 'รอประเมิน' }}</td>
                            <td class="text-center">{{ scores[indicate.id_indicate]?.b ?? 'รอประเมิน' }}</td>
                            <td class="text-center">{{ scores[indicate.id_indicate]?.c ?? 'รอประเมิน' }}</td>
                            <td class="text-center">
                                <v-chip color="primary" variant="flat" size="small">{{ average(indicate.id_indicate) }}</v-chip>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card>

            <div class="text-end mb-6">
                <v-chip color="success" variant="flat" size="x-large" prepend-icon="mdi-trophy">คะแนนรวม : {{ (user.total_commit / 3).toFixed(2) }} คะแนน</v-chip>
            </div>

            <!-- ข้อเสนอแนะ -->
            <v-card rounded="xl" elevation="2">
                <v-card-title class="pa-4">
                    <v-icon icon="mdi-comment-text-multiple" color="red-darken-4" class="me-2"></v-icon>
                    ข้อเสนอแนะของกรรมการ
                </v-card-title>
                <v-list>
                    <v-list-item v-for="commit in commits" :key="commit.id_commit" :title="commit.level_commit" :subtitle="commit.detail_commit || 'รอการประเมิน'" prepend-icon="mdi-account-tie"></v-list-item>
                </v-list>
            </v-card>
        </div>

        <v-alert v-else-if="user.status_eva === 1" type="warning" variant="tonal" rounded="xl">ยังไม่ได้ประเมินตนเอง</v-alert>
        <v-alert v-else type="error" variant="tonal" rounded="xl">ไม่มีแบบประเมิน</v-alert>

        <div class="text-center mt-4">
            <v-btn color="blue-grey" variant="outlined" prepend-icon="mdi-arrow-left" to="/Evaluatee/check_score">ย้อนกลับ</v-btn>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { eva } from '~/API/base'

const user = ref<any>({})
const topics = ref<any[]>([])
const scores = ref<any>({})
const commits = ref<any[]>([])

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
