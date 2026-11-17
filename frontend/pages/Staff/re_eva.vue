<template>
    <v-container>
        <PageHeader title="รายงานรายชื่อผู้รับการประเมินผล" subtitle="กดปุ่มพิมพ์เพื่อพิมพ์หรือบันทึกเป็น PDF" icon="mdi-file-chart" class="d-print-none" />

        <!-- หัวรายงานที่จะแสดงเฉพาะตอนพิมพ์ -->
        <div class="d-none d-print-block text-headline-small text-center mb-4">รายงานรายชื่อผู้รับการประเมินผล</div>

        <v-card rounded="xl" elevation="2">
            <v-table>
                <thead>
                    <tr>
                        <th class="text-center">ลำดับ</th>
                        <th>ชื่อ-สกุล</th>
                        <th>อีเมล</th>
                        <th>ชื่อผู้ใช้</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(items, index) in result" :key="items.id_member">
                        <td class="text-center">{{ index + 1 }}</td>
                        <td>{{ items.fname }} {{ items.lname }}</td>
                        <td>{{ items.email }}</td>
                        <td>{{ items.username }}</td>
                    </tr>
                    <tr v-if="result.length === 0">
                        <td colspan="4" class="text-center text-medium-emphasis py-6">ไม่พบข้อมูล</td>
                    </tr>
                </tbody>
            </v-table>
        </v-card>

        <!-- d-print-none = ซ่อนตอนพิมพ์ -->
        <div class="text-center mt-4 d-print-none">
            <v-btn color="blue-grey" variant="outlined" prepend-icon="mdi-arrow-left" class="ma-2" to="/Staff/report">ย้อนกลับ</v-btn>
            <v-btn color="primary" prepend-icon="mdi-printer" class="ma-2" @click="print()">พิมพ์</v-btn>
        </div>
    </v-container>
</template>

<script setup lang="ts">
import axios from 'axios'
import { staff } from '~/API/base'

const result = ref<any[]>([])
const token = import.meta.client ? localStorage.getItem('token') : null

const print = () => window.print()

const fetch = async () => {
    try {
        const res = await axios.get(`${staff}/member/showE`, { headers: { Authorization: `Bearer ${token}` } })
        result.value = res.data
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
