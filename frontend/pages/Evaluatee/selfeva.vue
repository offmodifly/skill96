<template>
    <v-container>
        <PageHeader title="แบบประเมินตนเอง" subtitle="ให้คะแนน 1-4 ในแต่ละตัวชี้วัด และแนบไฟล์หลักฐาน (ถ้ามี)" icon="mdi-clipboard-edit" color="#7d0c14" />

        <!-- แสดงแบบประเมินเมื่อยังไม่ได้ประเมิน (สถานะ 1) -->
        <v-form v-if="user.status_eva === 1" @submit.prevent="saveScore">
            <v-card rounded="xl" elevation="2" class="mb-6">
                <v-list-item prepend-icon="mdi-account-circle" :title="`${user.fname} ${user.lname}`" :subtitle="`รอบที่ ${user.round_sys} / ปี ${user.year_sys}`" class="pa-4"></v-list-item>
            </v-card>

            <!-- หัวข้อละ 1 การ์ด -->
            <v-card v-for="(topic, t) in topics" :key="topic.id_topic" rounded="xl" elevation="2" class="mb-6">
                <v-card-title class="pa-4 bg-red-lighten-5">{{ t + 1 }}. {{ topic.name_topic }}</v-card-title>

                <!-- ตัวชี้วัดในหัวข้อนี้ -->
                <v-card-text v-for="(indicate, i) in topic.indicates" :key="indicate.id_indicate" class="pa-4">
                    <div class="text-title-medium font-weight-bold">{{ t + 1 }}.{{ i + 1 }} {{ indicate.name_indicate }}</div>
                    <div class="text-medium-emphasis mb-2">{{ indicate.detail_indicate }}</div>
                    <v-chip size="small" class="me-2 mb-4">น้ำหนัก {{ indicate.point_indicate }}</v-chip>
                    <v-chip size="small" color="primary" class="mb-4">คะแนนเต็ม {{ indicate.point_indicate * 4 }}</v-chip>

                    <v-row>
                        <v-col cols="12" md="3">
                            <!-- ถ้า check_indicate = 'y' ให้เลือกคะแนนจากรายการ ถ้าไม่ใช่ให้พิมพ์ตัวเลข -->
                            <v-select v-if="indicate.check_indicate === 'y'" label="คะแนน (1-4)" :items="[1, 2, 3, 4]" v-model="indicate.score" variant="outlined"></v-select>
                            <v-text-field v-else label="คะแนน (1-4)" v-model="indicate.score" type="number" min="1" max="4" variant="outlined" @input="indicate.score > 4 ? (indicate.score = 4) : null"></v-text-field>
                        </v-col>
                        <v-col cols="12" md="5">
                            <v-textarea label="คำอธิบายเพิ่มเติม (ถ้ามี)" v-model="indicate.detail_eva" rows="1" auto-grow variant="outlined"></v-textarea>
                        </v-col>
                        <v-col cols="12" md="4">
                            <v-file-input label="ไฟล์หลักฐาน (.png .jpg .pdf)" v-model="indicate.file_eva" accept=".png,.jpg,.pdf" variant="outlined"
                                prepend-icon="" prepend-inner-icon="mdi-paperclip" @change="onFilechange($event, topic.id_topic, indicate.id_indicate)"></v-file-input>
                        </v-col>
                    </v-row>
                    <v-divider v-if="i < topic.indicates.length - 1"></v-divider>
                </v-card-text>
            </v-card>

            <div class="text-center">
                <v-btn color="#7d0c14" size="large" type="submit" prepend-icon="mdi-content-save-check">บันทึกคะแนน</v-btn>
            </div>
        </v-form>

        <v-alert v-else-if="user.status_eva === 2 || user.status_eva === 3" type="success" variant="tonal" rounded="xl">ประเมินตนเองเรียบร้อยแล้ว</v-alert>
        <v-alert v-else type="error" variant="tonal" rounded="xl">ไม่มีแบบประเมิน</v-alert>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { eva } from '~/API/base'

const user = ref<any>({})
const topics = ref<any[]>([])

const fetch = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` }
    try {
        const res = await axios.get(`${eva}/selfeva/user`, { headers })
        user.value = res.data
        const res2 = await axios.get(`${eva}/selfeva/topic`, { headers })
        topics.value = res2.data
    } catch (error) {
        console.error('error get', error)
    }
}

onMounted(fetch)

// เก็บไฟล์ที่เลือกไว้ โดยใช้ key = "id_topic-id_indicate"
const fileMap = ref<Record<string, File>>({})
const onFilechange = (event: Event, id_topic: number, id_indicate: number) => {
    const file = (event.target as HTMLInputElement)?.files?.[0]
    if (!file) return
    fileMap.value[`${id_topic}-${id_indicate}`] = file
}

const saveScore = async () => {
    const formData = new FormData()

    // รวมคะแนนทุกตัวชี้วัดเป็นอาร์เรย์เดียว และแนบไฟล์ลง formData
    const allScore = topics.value.flatMap((t: any) =>
        t.indicates.map((i: any) => {
            const key = `${t.id_topic}-${i.id_indicate}`
            const file = fileMap.value[key]
            if (file) formData.append(`file_${key}`, file)
            return {
                id_topic: t.id_topic,
                id_indicate: i.id_indicate,
                score: i.score,
                detail_eva: i.detail_eva,
                file_key: file ? `file_${key}` : null,
            }
        })
    )

    if (allScore.some((s: any) => !s.score)) {
        alert('กรุณากรอกคะแนนให้สมบูรณ์')
        return
    }

    formData.append('scores', JSON.stringify(allScore))
    try {
        await axios.post(`${eva}/selfeva/save`, formData, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        alert('ประเมินสำเร็จ')
        await fetch()
    } catch (error) {
        console.error('Error post score', error)
    }
}
</script>
