<template>
    <v-container>
        <PageHeader title="รายงาน" subtitle="เลือกรายงานที่ต้องการดูหรือพิมพ์" icon="mdi-file-chart" />

        <v-row>
            <!-- เพิ่มรายงานใหม่ได้ที่อาร์เรย์ reports ด้านล่าง -->
            <v-col cols="12" sm="6" md="4" v-for="r in reports" :key="r.to">
                <v-card :to="r.to" rounded="xl" elevation="2" class="pa-4">
                    <div class="d-flex align-center">
                        <v-avatar color="blue-grey" size="56" class="me-4">
                            <v-icon :icon="r.icon" color="white"></v-icon>
                        </v-avatar>
                        <div>
                            <div class="text-title-medium font-weight-bold">{{ r.title }}</div>
                            <div class="text-body-medium text-medium-emphasis">{{ r.detail }}</div>
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
const reports = [
    { title: 'รายชื่อผู้รับการประเมินผล', detail: 'ชื่อ อีเมล และชื่อผู้ใช้ทั้งหมด', icon: 'mdi-account-school', to: '/Staff/re_eva' },
]
</script>
