<template>
    <v-container>
        <PageHeader title="ผลการประเมินของผู้รับการประเมินผล" subtitle="คะแนนที่ผู้รับการประเมินประเมินตนเอง แยกตามหัวข้อ" icon="mdi-account-check" color="#007fff" />

        <!-- แสดงผลเมื่อประเมินตนเองแล้ว (สถานะ 2 หรือ 3) -->
        <div v-if="user.status_eva === 2 || user.status_eva === 3">
            <v-card rounded="xl" elevation="2" class="mb-6">
                <v-list-item prepend-icon="mdi-account-circle" :title="`${user.fname} ${user.lname}`" :subtitle="`รอบที่ ${user.round_sys} / ปี ${user.year_sys}`" class="pa-4"></v-list-item>
            </v-card>

            <!-- หัวข้อละ 1 การ์ด -->
            <v-card v-for="(topic, t) in topics" :key="topic.id_topic" rounded="xl" elevation="2" class="mb-6">
                <v-card-title class="pa-4 bg-blue-lighten-5">{{ t + 1 }}. {{ topic.name_topic }}</v-card-title>
                <v-table hover>
                    <thead>
                        <tr>
                            <th>ตัวชี้วัด</th>
                            <th>รายละเอียดตัวชี้วัด</th>
                            <th class="text-center">น้ำหนัก</th>
                            <th class="text-center">คะแนนเต็ม</th>
                            <th>รายละเอียด</th>
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
                                <v-btn v-if="indicate.file_eva" color="info" variant="tonal" size="small" prepend-icon="mdi-eye" @click="viweFile(indicate.file_eva)">เปิดดู</v-btn>
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
        <v-alert v-else type="error" variant="tonal" rounded="xl">ยังไม่มีแบบประเมิน</v-alert>

        <div class="text-center mt-4">
            <v-btn color="blue-grey" variant="outlined" prepend-icon="mdi-arrow-left" to="/Committee">ย้อนกลับ</v-btn>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { commit } from '../../API/base'

const user = ref<any>({})
const topics = ref<any[]>([])
const id_eva = useRoute().params.id_eva

// เปิดไฟล์หลักฐานในแท็บใหม่
const viweFile = (filename: string) => {
    window.open(`http://localhost:3001/uploads/file_eva/${filename}`, '_blank')
}

const fetchUser = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    try {
        const res = await axios.get(`${commit}/score_member/user/${id_eva}`, { headers })
        user.value = res.data
    } catch (error) {
        console.error('Error Get Profile!', error)
    }
}
const fetchTopics = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    try {
        const res = await axios.get(`${commit}/score_member/topic/${id_eva}`, { headers })
        topics.value = res.data
    } catch (error) {
        console.error('Error Get Profile!', error)
    }
}

onMounted(async () => {
    await Promise.all([fetchUser(), fetchTopics()])
})
</script>
