<template>
    <v-app class="login-page">
        <v-main class="d-flex align-center">
            <v-container>
                <v-row align="center" justify="center">

                    <!-- ===== ฝั่งซ้าย : โลโก้ ชื่อวิทยาลัย นาฬิกา คำแนะนำ ===== -->
                    <v-col cols="12" md="6">
                        <!-- v-slide-x-transition appear = เลื่อนเข้ามาจากด้านข้างตอนเปิดหน้า -->
                        <v-slide-x-transition appear>
                            <!-- text-center = มือถือจัดกลาง , text-md-start = จอใหญ่ (md ขึ้นไป) ชิดซ้าย -->
                            <div class="text-center text-md-start">
                                <!-- โลโก้ + วงแหวนหมุน (mx-auto = กลาง , mx-md-0 = จอใหญ่ชิดซ้าย) -->
                                <div class="logo-box mb-6 mx-auto mx-md-0">
                                    <div class="logo-ring"></div>
                                    <!-- v-sheet วงกลมสีขาว แล้ววางรูปไว้ตรงกลาง (รูปจะไม่ถูกตัด) -->
                                    <v-sheet width="150" height="150" rounded="circle" elevation="8" class="logo-float d-flex align-center justify-center">
                                        <v-img src="/img/logo2.png" width="100" height="100"></v-img>
                                    </v-sheet>
                                </div>

                                <div class="text-display-small font-weight-bold mb-1">
                                    <span class="text-blue-grey-darken-4">วิทยาลัยเทคนิค</span><span class="text-blue-darken-2">น่าน</span>
                                </div>
                                <div class="text-title-medium text-medium-emphasis mb-6">NTC Evaluation System · ระบบประเมินบุคลากร</div>

                                <!-- นาฬิกา (ClientOnly = แสดงเฉพาะฝั่ง browser เพราะเวลาเปลี่ยนทุกวินาที) -->
                                <ClientOnly>
                                    <v-chip size="x-large" variant="elevated" color="white" class="mb-6">
                                        <v-icon icon="mdi-circle" color="success" size="10" class="me-3 blink"></v-icon>
                                        <span class="text-title-large font-weight-bold me-3">{{ time }}</span>
                                        <span class="text-body-medium text-medium-emphasis">{{ date }}</span>
                                    </v-chip>
                                </ClientOnly>

                                <!-- คำแนะนำการใช้งาน (ซ่อนบนมือถือด้วย d-none d-md-block) -->
                                <v-card rounded="xl" variant="outlined" color="grey-lighten-1" class="bg-white pa-4 d-none d-md-block">
                                    <div class="text-title-medium font-weight-bold text-black mb-2">การเข้าใช้งานระบบ</div>
                                    <v-list density="compact" bg-color="transparent">
                                        <v-list-item v-for="r in roles" :key="r.title" :prepend-icon="r.icon" :title="r.title" :subtitle="r.detail" class="px-0 text-black"></v-list-item>
                                    </v-list>
                                </v-card>
                            </div>
                        </v-slide-x-transition>
                    </v-col>

                    <!-- ===== ฝั่งขวา : ฟอร์มเข้าสู่ระบบ ===== -->
                    <v-col cols="12" sm="8" md="5" offset-md="1">
                        <!-- v-slide-y-transition appear = เลื่อนขึ้นมาตอนเปิดหน้า -->
                        <v-slide-y-transition appear>
                            <v-card rounded="xl" elevation="12" class="pa-8">
                                <v-chip color="blue" variant="tonal" size="small" prepend-icon="mdi-white-balance-sunny" class="mb-4">{{ greeting }}</v-chip>

                                <div class="d-flex align-center mb-1">
                                    <v-img src="/img/logo2.png" max-width="36" height="36" class="me-3"></v-img>
                                    <div class="text-headline-large font-weight-bold">เข้าสู่ระบบ</div>
                                </div>
                                <div class="text-body-medium text-medium-emphasis mb-6">กรุณาลงชื่อเข้าใช้งานเพื่อดำเนินการต่อ</div>

                                <!-- แจ้งเตือนเมื่อเข้าสู่ระบบไม่สำเร็จ (สั่นนิดหน่อย) -->
                                <v-alert v-if="error" type="error" variant="tonal" density="compact" rounded="lg" class="mb-4 shake">{{ error }}</v-alert>

                                <v-form @submit.prevent="login">
                                    <v-text-field v-model="username" placeholder="ชื่อผู้ใช้งาน" prepend-inner-icon="mdi-account-outline"
                                        variant="solo-filled" flat rounded="lg"></v-text-field>

                                    <v-text-field v-model="password" placeholder="รหัสผ่าน" prepend-inner-icon="mdi-lock-outline"
                                        variant="solo-filled" flat rounded="lg"
                                        :type="showPw ? 'text' : 'password'" :append-inner-icon="showPw ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showPw = !showPw"></v-text-field>

                                    <v-select v-model="role" :items="typeR" label="ประเภทสมาชิก" prepend-inner-icon="mdi-account-group-outline"
                                        variant="solo-filled" flat rounded="lg"></v-select>

                                    <v-checkbox v-model="remember" label="จดจำชื่อผู้ใช้" density="compact" hide-details class="mb-4"></v-checkbox>

                                    <v-btn type="submit" size="x-large" block rounded="lg" append-icon="mdi-arrow-right" class="btn-login text-white">เข้าสู่ระบบ</v-btn>
                                </v-form>

                                <div class="text-center mt-6 text-body-medium">
                                    ยังไม่มีบัญชี?
                                    <nuxt-link to="/regis" class="text-red-darken-3 font-weight-bold">สมัครสมาชิก</nuxt-link>
                                </div>
                            </v-card>
                        </v-slide-y-transition>
                    </v-col>

                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script setup lang="ts">
import auth from '~/API/auth'

// หน้านี้ไม่ใช้ layout (ไม่มีแถบเมนูด้านบน)
definePageMeta({ layout: false })

const typeR = ['ฝ่ายบุคลากร', 'ผู้รับการประเมินผล', 'กรรมการประเมิน']

// ข้อความในกล่อง "การเข้าใช้งานระบบ"
const roles = [
    { title: 'ฝ่ายบุคลากร', detail: 'จัดการผู้ใช้ หัวข้อ ตัวชี้วัด รอบการประเมิน และรายงาน', icon: 'mdi-account-tie' },
    { title: 'ผู้รับการประเมินผล', detail: 'ประเมินตนเอง แนบหลักฐาน และตรวจสอบคะแนน', icon: 'mdi-account-school' },
    { title: 'กรรมการประเมิน', detail: 'ให้คะแนนและข้อเสนอแนะแก่ผู้รับการประเมินผล', icon: 'mdi-account-star' },
]

const username = ref('')
const password = ref('')
const role = ref('')
const showPw = ref(false)
const remember = ref(false)
const error = ref('')

// ---------- นาฬิกา: อัปเดตเวลาทุก 1 วินาที ----------
const now = ref(new Date())
let timer: any
onMounted(() => {
    timer = setInterval(() => (now.value = new Date()), 1000)

    // ถ้าเคยติ๊ก "จดจำชื่อผู้ใช้" ให้ดึงชื่อเดิมมาใส่
    const saved = localStorage.getItem('remember_username')
    if (saved) {
        username.value = saved
        remember.value = true
    }
})
onUnmounted(() => clearInterval(timer))

const time = computed(() => now.value.toLocaleTimeString('th-TH'))
const date = computed(() => now.value.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

// ---------- คำทักทายตามช่วงเวลา ----------
const greeting = computed(() => {
    const h = now.value.getHours()
    if (h < 12) return 'สวัสดีตอนเช้า'
    if (h < 17) return 'สวัสดีตอนบ่าย'
    return 'สวัสดีตอนเย็น'
})

// ---------- เข้าสู่ระบบ ----------
const login = async () => {
    error.value = ''
    try {
        const res = await auth.login({
            username: username.value,
            password: password.value,
            role: role.value,
        })
        localStorage.setItem('token', res.data.token)

        // จดจำชื่อผู้ใช้
        if (remember.value) localStorage.setItem('remember_username', username.value)
        else localStorage.removeItem('remember_username')

        // ผู้รับการประเมินที่เข้าระบบครั้งแรก ต้องเปลี่ยนรหัสผ่านก่อน
        if (res.data.must_change_pw) localStorage.setItem('must_change_pw', '1')
        else localStorage.removeItem('must_change_pw')

        alert('ดำเนินการสำเร็จ')
        if (res.data.must_change_pw) return navigateTo('/Evaluatee/change_password')

        // ไปหน้าแรกตามประเภทสมาชิก
        const useRole = res.data.role
        if (useRole === 'ฝ่ายบุคลากร') return navigateTo('/Staff')
        if (useRole === 'ผู้รับการประเมินผล') return navigateTo('/Evaluatee')
        if (useRole === 'กรรมการประเมิน') return navigateTo('/Committee')
    } catch (err: any) {
        console.error('Error login', err)
        error.value = err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ'
    }
}
</script>

<style scoped>
/* พื้นหลังไล่สีฟ้าอ่อน */
.login-page {
    background: linear-gradient(135deg, #dbe6ff 0%, #f5f8ff 50%, #fde8ee 100%) !important;
}

/* ---------- โลโก้ ---------- */
.logo-box {
    position: relative;
    width: 190px;
    height: 190px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* วงแหวนครึ่งฟ้าครึ่งแดง หมุนรอบโลโก้ */
.logo-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: #1e88e5;
    border-bottom-color: #e53950;
    animation: spin 6s linear infinite;
}

/* โลโก้ลอยขึ้นลงเบาๆ */
.logo-float {
    animation: float 3s ease-in-out infinite;
}

/* จุดสีเขียวหน้านาฬิกากะพริบ */
.blink {
    animation: blink 1s infinite;
}

/* ---------- ปุ่มเข้าสู่ระบบ: ไล่สีแดง + ยกขึ้นเมื่อเอาเมาส์ชี้ ---------- */
.btn-login {
    background: linear-gradient(90deg, #ff4d6d, #b5172f) !important;
    transition: transform 0.2s, box-shadow 0.2s;
}
.btn-login:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(229, 57, 80, 0.4);
}

/* กล่องแจ้งเตือนสั่นเมื่อรหัสผิด */
.shake {
    animation: shake 0.4s;
}

/* ---------- ท่าทาง animation (keyframes) ---------- */
@keyframes spin {
    to { transform: rotate(360deg); }
}
@keyframes float {
    50% { transform: translateY(-8px); }
}
@keyframes blink {
    50% { opacity: 0.2; }
}
@keyframes shake {
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
}
</style>
