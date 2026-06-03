<template>
  <div class="landing">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <BookOpen class="w-16 h-16 text-emerald-400 mx-auto mb-6" />
        <h1>按你的节奏，<br /><em>读完一整本圣经</em></h1>
        <p>不受每日读经计划的束缚。自由选择你今天读的章节，逐章逐节记录，实时追踪你距离读完一整本圣经还有多少。</p>
        <div class="hero-actions">
          <button @click="goApp" class="btn-primary">
            <span>开始打卡</span>
            <ArrowRight class="w-4 h-4" />
          </button>
          <a href="#features" class="btn-secondary">了解详情</a>
        </div>
      </div>
      <div class="scroll-indicator">
        <span>向下滚动</span>
        <div class="scroll-dot"></div>
      </div>
    </section>

    <!-- Features -->
    <section class="features" id="features">
      <div class="container">
        <div class="features-header">
          <h2>为什么选择圣经打卡</h2>
          <p>我们解决了一个真实存在的痛点：现有的圣经软件都只有固定的读经计划</p>
        </div>
        <div class="features-grid">
          <div v-for="f in features" :key="f.title" class="feature-card animate-in">
            <div class="feature-icon" :class="f.color">
              <component :is="f.icon" class="w-6 h-6" :style="{ color: f.iconColor }" />
            </div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="stats">
      <div class="container">
        <div class="stats-grid">
          <div v-for="s in stats" :key="s.label" class="stats-item animate-in">
            <div class="num" v-html="s.num"></div>
            <div class="label">{{ s.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container">
        <h2>今天就开始记录</h2>
        <p>不设定计划，不追赶进度。按你的节奏，读完一整本圣经。</p>
        <button @click="goApp" class="btn-primary">
          <span>立即开始</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </section>

    <!-- FAQ -->
    <section class="faq">
      <div class="container">
        <h2>常见问题</h2>
        <div class="faq-list">
          <details v-for="(q, i) in faqs" :key="i" class="faq-item animate-in">
            <summary>{{ q.q }}</summary>
            <p>{{ q.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <div class="links">
        <NuxtLink to="/login">登录</NuxtLink>
        <NuxtLink to="/register">注册</NuxtLink>
        <a href="mailto:coyoteshkw@proton.me">联系我们</a>
      </div>
      <p>© 2026 圣经打卡 · 一款自由的读经记录工具</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { BookOpen, ArrowRight, Target, BarChart3, Calendar as CalendarIcon, Pencil, MessageSquare, Smartphone } from 'lucide-vue-next'

useSeoMeta({
  title: '圣经打卡 — 自由记录每日读经进度',
  description: '圣经打卡是一款自由的读经进度记录工具。不受每日计划限制，按自己的节奏逐章逐节记录，实时查看整本圣经阅读进度。',
  keywords: '圣经打卡,读经进度,圣经阅读,每日读经,圣经记录,圣经计划',
  ogTitle: '圣经打卡 — 自由记录每日读经进度',
  ogDescription: '不受每日计划限制，按自己的节奏逐章逐节记录读经进度。',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: '圣经打卡 — 自由记录每日读经进度',
  twitterDescription: '不受每日计划限制，按自己的节奏逐章逐节记录读经进度。'
})

const { user, loading } = useAuth()

// 已登录则跳转到应用
watchEffect(() => {
  if (!loading.value && user.value) {
    navigateTo('/')
  }
})

const router = useRouter()
function goApp() {
  if (user.value) {
    router.push('/')
  } else {
    router.push('/login')
  }
}

const features = [
  { title: '自由选择进度', desc: '不受每日计划限制。今天想读创世记1-5章？还是只想读诗篇23篇？完全由你决定。', icon: Target, color: 'green', iconColor: '#059669' },
  { title: '实时阅读进度', desc: '每卷书已读的百分比，整本圣经的总进度条，一目了然看到自己距离读完还有多远。', icon: BarChart3, color: 'amber', iconColor: '#d97706' },
  { title: '日历打卡记录', desc: '哪天读了、哪天没读，日历上清清楚楚。点击任意日期查看当天的详细读经记录。', icon: CalendarIcon, color: 'stone', iconColor: '#78716c' },
  { title: '逐节精确记录', desc: '支持同章内、跨章节的记录。从创世记1:5到2:3，精确到每一节。', icon: Pencil, color: 'sky', iconColor: '#0284c7' },
  { title: '默想笔记', desc: '每条打卡可以记录你的感动和思考。生成精美的打卡卡片，方便分享给朋友。', icon: MessageSquare, color: 'rose', iconColor: '#e11d48' },
  { title: '全平台使用', desc: '手机、平板、电脑都可以用。注册账号后数据自动跟随，随时随地记录。', icon: Smartphone, color: 'purple', iconColor: '#9333ea' }
]

const stats = [
  { num: '66', label: '书卷总数' },
  { num: '1,<em>189</em>', label: '总章数' },
  { num: '<em>0</em> 元', label: '完全免费' },
  { num: '你<em>决定</em>', label: '阅读计划' }
]

// 滚动动画
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible') })
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' })
  document.querySelectorAll('.animate-in').forEach(el => observer.observe(el))
})

const faqs = [
  { q: '这个应用和现有的圣经软件有什么区别？', a: '大多数圣经软件提供的是固定的每日读经计划，你必须按照计划每天读固定章节。而这个应用让你自由选择今天读什么，逐章逐节记录，不受任何计划束缚。' },
  { q: '可以多人使用吗？需要付费吗？', a: '完全免费。你可以注册账号使用，数据跟随你的账号。目前是个人使用的工具，没有团队功能。' },
  { q: '是否支持所有圣经译本？', a: '目前支持中文和合本。你只需要记录书卷和章节，不需要输入经文原文，所以理论上任何译本都适用。' },
  { q: '我的数据安全吗？', a: '密码使用 bcrypt 加密存储，登录使用 session cookie。你的打卡数据只属于你自己，不会被公开或分享。' }
]
</script>

<style scoped>
/* 只在此页面生效的样式 */
.landing { background:#fafaf9; color:#292524; overflow-x:hidden; }
.landing :deep(h1), .landing :deep(h2), .landing :deep(h3) { font-family:'Noto Serif SC',serif; line-height:1.3; }
.container { max-width:72rem; margin:0 auto; }
section { padding:5rem 1.5rem; }

/* Hero */
.hero {
  min-height:100vh; display:flex; align-items:center; justify-content:center;
  background:linear-gradient(135deg,#064e3b 0%,#022c22 50%,#065f46 100%);
  position:relative; overflow:hidden;
}
.hero::before {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse at 20% 50%,rgba(52,211,153,.15) 0%,transparent 60%),
             radial-gradient(ellipse at 80% 20%,rgba(251,191,36,.08) 0%,transparent 50%);
  pointer-events:none;
}
.hero-glow {
  position:absolute; width:600px; height:600px; border-radius:50%;
  background:radial-gradient(circle,rgba(16,185,129,.12) 0%,transparent 70%);
  top:-200px; right:-200px; pointer-events:none;
}
.hero-content { position:relative; z-index:1; text-align:center; max-width:48rem; padding:1.5rem; }
.hero h1 { font-size:clamp(2.5rem,6vw,4rem); font-weight:900; color:white; letter-spacing:-.02em; margin-bottom:1rem; }
.hero h1 em { font-style:normal; background:linear-gradient(135deg,#34d399,#fbbf24); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.hero p { font-size:clamp(1rem,2vw,1.2rem); color:rgba(255,255,255,.7); max-width:36rem; margin:0 auto 2.5rem; font-weight:300; line-height:1.8; }
.hero-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
.btn-primary {
  display:inline-flex; align-items:center; gap:.5rem; padding:.85rem 2.2rem;
  border-radius:999px; font-size:1.05rem; font-weight:600; cursor:pointer; border:none;
  background:linear-gradient(135deg,#34d399,#10b981); color:#064e3b;
  box-shadow:0 4px 20px rgba(16,185,129,.3); transition:all .3s; text-decoration:none;
}
.btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(16,185,129,.4); }
.btn-secondary {
  display:inline-flex; align-items:center; gap:.5rem; padding:.85rem 2.2rem;
  border-radius:999px; font-size:1.05rem; font-weight:500; cursor:pointer;
  border:1.5px solid rgba(255,255,255,.2); color:rgba(255,255,255,.8);
  transition:all .3s; text-decoration:none; background:transparent;
}
.btn-secondary:hover { border-color:#34d399; color:#34d399; transform:translateY(-2px); }

/* Scroll indicator */
.scroll-indicator {
  position:absolute; bottom:2rem; left:50%; transform:translateX(-50%);
  display:flex; flex-direction:column; align-items:center; gap:.5rem;
  color:rgba(255,255,255,.3); font-size:.75rem; letter-spacing:.1em;
  animation:fadeInUp 1s .5s both;
}
.scroll-dot { width:1.5px; height:2rem; background:linear-gradient(to bottom,#34d399,transparent); animation:scrollPulse 2s ease-in-out infinite; }
@keyframes scrollPulse { 0%,100% { opacity:.3; transform:scaleY(1); } 50% { opacity:1; transform:scaleY(1.3); } }
@keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }

/* Features */
.features { background:white; }
.features-header { text-align:center; margin-bottom:4rem; }
.features-header h2 { font-size:clamp(1.8rem,3.5vw,2.5rem); color:#292524; margin-bottom:.75rem; }
.features-header p { color:#78716c; max-width:32rem; margin:0 auto; }
.features-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:1.5rem; }
.feature-card {
  background:#fafaf9; border-radius:1.25rem; padding:2rem;
  border:1px solid #f5f5f4; transition:all .3s; position:relative; overflow:hidden;
}
.feature-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#34d399,#10b981); opacity:0; transition:opacity .3s; }
.feature-card:hover::after { opacity:1; }
.feature-card:hover { border-color:#a7f3d0; transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,.06); }
.feature-icon { width:3rem; height:3rem; border-radius:1rem; display:flex; align-items:center; justify-content:center; margin-bottom:1.25rem; }
.feature-icon.green { background:#d1fae5; }
.feature-icon.amber { background:#fef3c7; }
.feature-icon.stone { background:#e7e5e4; }
.feature-icon.rose { background:#ffe4e6; }
.feature-icon.sky { background:#e0f2fe; }
.feature-icon.purple { background:#f3e8ff; }
.feature-card h3 { font-size:1.1rem; color:#292524; margin-bottom:.5rem; }
.feature-card p { font-size:.9rem; color:#78716c; line-height:1.7; }

/* Stats */
.stats { background:#065f46; position:relative; overflow:hidden; }
.stats::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 80% 50%,rgba(16,185,129,.1) 0%,transparent 60%); }
.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:2rem; text-align:center; position:relative; z-index:1; }
.stats-item .num { font-size:clamp(2rem,4vw,3rem); font-weight:900; font-family:'Noto Serif SC',serif; color:white; }
.stats-item .num :deep(em) { font-style:normal; color:#34d399; }
.stats-item .label { color:rgba(255,255,255,.5); font-size:.9rem; margin-top:.25rem; }

/* CTA */
.cta { background:white; text-align:center; }
.cta h2 { font-size:clamp(1.8rem,3.5vw,2.5rem); color:#292524; margin-bottom:.75rem; }
.cta p { color:#78716c; max-width:28rem; margin:0 auto 2rem; }

/* FAQ */
.faq { background:#fafaf9; }
.faq h2 { text-align:center; font-size:clamp(1.5rem,3vw,2rem); color:#292524; margin-bottom:3rem; }
.faq-list { max-width:40rem; margin:0 auto; display:flex; flex-direction:column; gap:.75rem; }
.faq-item { background:white; border-radius:1rem; border:1px solid #f5f5f4; padding:1rem 1.5rem; cursor:pointer; transition:border-color .2s; }
.faq-item[open] { border-color:#a7f3d0; }
.faq-item summary { display:flex; justify-content:space-between; align-items:center; font-weight:600; color:#44403c; list-style:none; font-size:.95rem; }
.faq-item summary::after { content:'+'; font-size:1.2rem; color:#a8a29e; transition:transform .2s; }
.faq-item[open] summary::after { transform:rotate(45deg); }
.faq-item p { color:#78716c; font-size:.9rem; line-height:1.7; padding-top:.75rem; border-top:1px solid #f5f5f4; margin-top:.75rem; }
.faq-item summary::-webkit-details-marker { display:none; }

/* Footer */
footer { background:#1c1917; color:rgba(255,255,255,.4); padding:2.5rem 1.5rem; text-align:center; font-size:.85rem; }
footer a { color:rgba(255,255,255,.6); text-decoration:none; transition:color .2s; }
footer a:hover { color:#34d399; }
footer .links { display:flex; gap:1.5rem; justify-content:center; margin-bottom:1rem; flex-wrap:wrap; }

/* Animation */
.animate-in { opacity:0; transform:translateY(24px); transition:all .6s cubic-bezier(.22,1,.36,1); }
.animate-in.visible { opacity:1; transform:translateY(0); }
</style>
