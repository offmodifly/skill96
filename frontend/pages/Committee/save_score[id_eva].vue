<template>
    <v-container>
        <PageHeader title="ดำเนินการประเมิน" subtitle="ให้คะแนน 1-4 ในแต่ละตัวชี้วัด" icon="mdi-clipboard-edit" color="#007fff" />

        <!-- แสดงแบบประเมินเมื่อกรรมการยังไม่ได้ประเมิน -->
        <v-form v-if="user.status_commit === 'n'" @submit.prevent="saveScore">
            <v-card rounded="xl" elevation="2" class="mb-6">
                <v-list-item prepend-icon="mdi-account-circle" :title="`${user.fname} ${user.lname}`" :subtitle="`รอบที่ ${user.round_sys} / ปี ${user.year_sys}`" class="pa-4"></v-list-item>
            </v-card>

            <!-- หัวข้อละ 1 การ์ด -->
            <v-card v-for="(topic, t) in topics" :key="topic.id_topic" rounded="xl" elevation="2" class="mb-6">
                <v-card-title class="pa-4 bg-blue-lighten-5">{{ t + 1 }}. {{ topic.name_topic }}</v-card-title>

                <!-- ตัวชี้วัดในหัวข้อนี้ -->
                <v-card-text v-for="(indicate, i) in topic.indicates" :key="indicate.id_indicate" class="pa-4">
                    <div class="text-title-medium font-weight-bold">{{ t + 1 }}.{{ i + 1 }} {{ indicate.name_indicate }}</div>
                    <div class="text-medium-emphasis mb-2">{{ indicate.detail_indicate }}</div>
                    <v-chip size="small" class="me-2 mb-4">น้ำหนัก {{ indicate.point_indicate }}</v-chip>
                    <v-chip size="small" color="primary" class="mb-4">คะแนนเต็ม {{ indicate.point_indicate * 4 }}</v-chip>

                    <!-- สิ่งที่ผู้รับการประเมินกรอกไว้ -->
                    <v-alert variant="tonal" density="compact" rounded="lg" icon="mdi-account-edit" class="mb-4">
                        <div>รายละเอียดจากผู้รับการประเมิน: {{ indicate.detail_eva || '-' }}</div>
                        <div class="mt-1">
                            ไฟล์หลักฐาน:
                            <v-btn v-if="indicate.file_eva" color="info" variant="tonal" size="small" prepend-icon="mdi-eye" @click="viweFile(indicate.file_eva)">เปิดดู</v-btn>
                            <span v-else>ไม่มี</span>
                        </div>
                    </v-alert>

                    <!-- ถ้า check_indicate = 'y' ให้เลือกคะแนนจากรายการ ถ้าไม่ใช่ให้พิมพ์ตัวเลข -->
                    <v-row>
                        <v-col cols="12" md="4">
                            <v-select v-if="indicate.check_indicate === 'y'" label="คะแนน (1-4)" :items="[1, 2, 3, 4]" v-model="indicate.score" variant="outlined"></v-select>
                            <v-text-field v-else label="คะแนน (1-4)" v-model="indicate.score" type="number" min="1" max="4" variant="outlined" @input="indicate.score > 4 ? (indicate.score = 4) : null"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-divider v-if="i < topic.indicates.length - 1"></v-divider>
                </v-card-text>
            </v-card>

            <v-card rounded="xl" elevation="2" class="mb-6 pa-4">
                <v-textarea label="คำอธิบายเพิ่มเติม (ถ้ามี)" v-model="detail_commit" rows="2" auto-grow variant="outlined" hide-details></v-textarea>
            </v-card>

            <div class="text-center">
                <v-btn color="primary" size="large" type="submit" prepend-icon="mdi-content-save-check">บันทึกคะแนน</v-btn>
            </div>
        </v-form>

        <v-alert v-else-if="user.status_commit === 'y'" type="success" variant="tonal" rounded="xl">ประเมินสำเร็จ</v-alert>
        <v-alert v-else type="error" variant="tonal" rounded="xl">ยังไม่มีแบบประเมิน</v-alert>

        <div class="text-center mt-4">
            <v-btn color="blue-grey" variant="outlined" prepend-icon="mdi-arrow-left" to="/Committee/show_eva">ย้อนกลับ</v-btn>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { commit } from '../../API/base'

// เปิดไฟล์หลักฐานในแท็บใหม่
const viweFile = (filename: string) => {
    window.open(`http://localhost:3001/uploads/file_eva/${filename}`, '_blank')
}

const user = ref<any>({})
const topics = ref<any[]>([])
const detail_commit = ref('')
const id_eva = useRoute().params.id_eva

const fetch = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    try {
        const res = await axios.get(`${commit}/save_score/user/${id_eva}`, { headers })
        user.value = res.data
    } catch (error) {
        console.error('ERROR GET PROFILE', error)
    }
}
const fetchTopic = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    try {
        const res = await axios.get(`${commit}/save_score/topic/${id_eva}`, { headers })
        topics.value = res.data
    } catch (error) {
        console.error('ERROR GET PROFILE', error)
    }
}

onMounted(async () => {
    await Promise.all([fetch(), fetchTopic()])
})

const saveScore = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    const formData = new FormData()

    // รวมคะแนนทุกตัวชี้วัดเป็นอาร์เรย์เดียว
    const allScore = topics.value.flatMap((t: any) =>
        t.indicates.map((i: any) => ({
            id_topic: t.id_topic,
            id_indicate: i.id_indicate,
            score: i.score,
            detail_eva: i.detail_eva,
        }))
    )
    if (allScore.some((s: any) => !s.score)) {
        alert('กรุณากรอกคะแนนให้สมบูรณ์')
        return
    }
    formData.append('scores', JSON.stringify(allScore))

    // ถ้าไม่ได้พิมพ์คำอธิบาย ให้ส่งค่าว่างเหมือนเดิม
    const detail_commitTo = detail_commit.value && detail_commit.value.trim() ? detail_commit.value : ''
    formData.append('detail_commit', detail_commitTo)

    try {
        await axios.post(`${commit}/save_score/save/${id_eva}`, formData, { headers })
        alert('ประเมินสำเร็จ')
        await Promise.all([fetch(), fetchTopic()])
    } catch (error) {
        console.error('Error post Score', error)
    }
}
</script>
