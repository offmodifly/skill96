<template>
    <v-container>
        <PageHeader title="ผลการประเมินตนเอง" subtitle="คะแนนที่คุณประเมินตนเอง แยกตามหัวข้อ" icon="mdi-account-check" color="#7d0c14" />

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
                            <th>คำอธิบาย</th>
                            <th class="text-center">ไฟล์</th>
                            <th class="text-center">คะแนนที่ได้</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="indicate in topic.indicates" :key="indicate.id_indicate">
                            <td>{{ indicate.name_indicate }}</td>
                            <td>{{ indicate.detail_indicate }}</td>
                            <td class="text-center">{{ indicate.point_indicate }}</td>
                            <td class="text-center">{{ indicate.point_indicate * 4 }}</td>
                            <td>{{ indicate.detail_eva || '-' }}</td>
                            <td class="text-center">
                                <v-btn v-if="indicate.file_eva" color="info" variant="tonal" size="small" prepend-icon="mdi-eye" @click="view(indicate.file_eva)">เปิดดู</v-btn>
                                <span v-else>-</span>
                            </td>
                            <td class="text-center">
                                <v-chip color="primary" variant="flat" size="small">{{ indicate.point_indicate * indicate.score_member }}</v-chip>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card>

            <div class="text-end">
                <v-chip color="success" variant="flat" size="x-large" prepend-icon="mdi-trophy">คะแนนรวม : {{ user.total_eva }} คะแนน</v-chip>
            </div>
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
import { api, eva } from '~/API/base'

const user = ref<any>({})
const topics = ref<any[]>([])

// เปิดไฟล์หลักฐานในแท็บใหม่
const view = (file: string) => {
    window.open(new URL(`/uploads/file_eva/${file}`, api).href, '_blank')
}

const fetch = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    try {
        const res = await axios.get(`${eva}/selfeva/user`, { headers })
        user.value = res.data
        const res2 = await axios.get(`${eva}/score_member/topic`, { headers })
        topics.value = res2.data
    } catch (error) {
        console.error('error get', error)
    }
}

onMounted(fetch)
</script>
