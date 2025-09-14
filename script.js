// Application State
let currentUser = null
let currentTab = "home"
let currentContent = "welcome"
const pdfDoc = null
const pageNum = 1
const pageRendering = false
const pageNumPending = null
const scale = 1.2

// Content Structure
const contentStructure = {
  home: {
    title: "首页",
    items: []   // 首页不放内容项，单独显示 homePage
  },
  application: {
    title: "申报书",
    items: [
      { id: "app-form", title: "申报表格", type: "pdf", file: "pdfs/application-form.pdf" },
      { id: "app-summary", title: "申报摘要", type: "pdf", file: "pdfs/application-summary.pdf" },
    ],
  },
  summary: {
    title: "成果总结",
    items: [
      { id: "summary-report", title: "总结报告", type: "pdf", file: "pdfs/summary-report.pdf" },
      { id: "summary-analysis", title: "成果分析", type: "pdf", file: "pdfs/summary-analysis.pdf" },
    ],
  },
  awards: {
    title: "成果获奖证明",
    items: [
      { id: "award-1", title: "广东省教学成果一等奖证书", type: "pdf", file: "pdfs/award-certificate-1.pdf" },
      { id: "award-2", title: "广东省教学成果二等奖证书", type: "pdf", file: "pdfs/award-certificate-2.pdf" },
      { id: "award-3", title: "产教融合优秀案例证书", type: "pdf", file: "pdfs/award-certificate-3.pdf" },
      { id: "award-4", title: "学生全国技能大赛一等奖证书", type: "pdf", file: "pdfs/student-award-1.pdf" },
      { id: "award-5", title: "教师省教学能力大赛二等奖证书", type: "pdf", file: "pdfs/teacher-award-1.pdf" },
    ],
  },
  certificates: {
    title: "成果证明材料",
    items: [
      { id: "cert-1", title: "专业建设方案", type: "pdf", file: "pdfs/program-plan.pdf" },
      { id: "cert-2", title: "课程体系文件", type: "pdf", file: "pdfs/curriculum-system.pdf" },
      { id: "cert-3", title: "实训基地建设", type: "pdf", file: "pdfs/training-base.pdf" },
    ],
  },
  support: {
    title: "成果支撑材料",
    items: [
      { id: "support-1", title: "教学改革文件", type: "pdf", file: "pdfs/teaching-reform.pdf" },
      { id: "support-2", title: "校企合作协议", type: "pdf", file: "pdfs/cooperation-agreement.pdf" },
      { id: "support-3", title: "师资培训记录", type: "pdf", file: "pdfs/teacher-training.pdf" },
    ],
  },
  promotion: {
    title: "成果推广材料",
    items: [
      { id: "promo-1", title: "推广应用报告", type: "pdf", file: "pdfs/promotion-report.pdf" },
      { id: "promo-2", title: "媒体报道材料", type: "pdf", file: "pdfs/media-coverage.pdf" },
      { id: "promo-3", title: "学术论文发表", type: "pdf", file: "pdfs/academic-papers.pdf" },
    ],
  }
  // cases, videos 保留注释
}

// 用户账号
const validCredentials = {
  admin: "admin123",
  teacher: "teacher123",
  guest: "guest123",
}

// DOM
const loginPage = document.getElementById("loginPage")
const mainApp = document.getElementById("mainApp")
const loginForm = document.getElementById("loginForm")
const loginError = document.getElementById("loginError")
const logoutBtn = document.getElementById("logoutBtn")
const navItems = document.querySelectorAll(".nav-item")
const sidebarTitle = document.getElementById("sidebarTitle")
const sidebarMenu = document.getElementById("sidebarMenu")
const breadcrumbPath = document.getElementById("breadcrumbPath")
const welcomeContent = document.getElementById("welcomeContent")
const pdfContainer = document.getElementById("pdfContainer")
const pdfTitle = document.getElementById("pdfTitle")
const pdfFrame = document.getElementById("pdfFrame")
const refreshPdfBtn = document.getElementById("refreshPdf")
const fullscreenPdfBtn = document.getElementById("fullscreenPdf")

// Event Listeners
function setupEventListeners() {
  loginForm.addEventListener("submit", handleLogin)
  logoutBtn.addEventListener("click", handleLogout)
  navItems.forEach((item) => {
    item.addEventListener("click", () => switchTab(item.dataset.tab))
  })
  refreshPdfBtn.addEventListener("click", refreshPDF)
  fullscreenPdfBtn.addEventListener("click", toggleFullscreen)
}

// 登录
function handleLogin(e) {
  e.preventDefault()
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value
  if (validCredentials[username] && validCredentials[username] === password) {
    currentUser = username
    localStorage.setItem("currentUser", username)
    showMainApp()
    hideLoginError()
  } else {
    showLoginError("用户名或密码错误")
  }
}
function handleLogout() {
  currentUser = null
  localStorage.removeItem("currentUser")
  showLoginPage()
  resetApp()
}
function showLoginPage() {
  loginPage.style.display = "flex"
  mainApp.style.display = "none"
}
function showMainApp() {
  loginPage.style.display = "none"
  mainApp.style.display = "block"
  initializeMainApp()
}
function showLoginError(message) {
  loginError.textContent = message
  loginError.style.display = "block"
}
function hideLoginError() {
  loginError.style.display = "none"
}
function resetApp() {
  currentTab = "home"
  currentContent = "welcome"
  loginForm.reset()
}

// 主应用
function initializeMainApp() {
  switchTab("home") // 默认进入首页
}
function switchTab(tab) {
  currentTab = tab
  navItems.forEach((item) => {
    item.classList.remove("active")
    if (item.dataset.tab === tab) item.classList.add("active")
  })
  updateSidebar()

  if (tab === "home") {
    showContent("homePage")
  } else {
    const structure = contentStructure[tab]
    if (structure && structure.items.length > 0) {
      switchContent(structure.items[0].id)
    } else {
      switchContent("welcome")
    }
  }
}
function updateSidebar() {
  const structure = contentStructure[currentTab]
  if (!structure) {
    sidebarTitle.textContent = "导航"
    sidebarMenu.innerHTML = "<li><button onclick=\"switchContent('welcome')\">欢迎页面</button></li>"
    return
  }
  sidebarTitle.textContent = structure.title
  sidebarMenu.innerHTML = structure.items
    .map((item) => `<li><button onclick="switchContent('${item.id}')" data-content="${item.id}">${item.title}</button></li>`)
    .join("")
}
function switchContent(contentId) {
  currentContent = contentId
  const sidebarButtons = sidebarMenu.querySelectorAll("button")
  sidebarButtons.forEach((btn) => {
    btn.classList.remove("active")
    if (btn.dataset.content === contentId) btn.classList.add("active")
  })
  updateBreadcrumb()
  showContent(contentId)
}
function updateBreadcrumb() {
  const structure = contentStructure[currentTab]
  let path = "首页"
  if (structure) {
    path += ` > ${structure.title}`
    const currentItem = structure.items.find((item) => item.id === currentContent)
    if (currentItem) path += ` > ${currentItem.title}`
  }
  breadcrumbPath.textContent = path
}
function showContent(contentId) {
  // 隐藏所有
  document.getElementById("homePage").style.display = "none"
  welcomeContent.style.display = "none"
  pdfContainer.style.display = "none"

  if (contentId === "homePage") {
    document.getElementById("homePage").style.display = "block"
    return
  }

  if (contentId === "welcome") {
    welcomeContent.style.display = "block"
    return
  }

  const structure = contentStructure[currentTab]
  if (!structure) return
  const item = structure.items.find((i) => i.id === contentId)
  if (!item) return

  if (item.type === "pdf") {
    showPDF(item)
  } else if (item.type === "video") {
    showVideo(item)
  }
}

// PDF
function showPDF(item) {
  pdfContainer.style.display = "block"
  pdfTitle.textContent = item.title
  loadPDF(item.file)
}
function loadPDF(url) {
  pdfFrame.src = url
  pdfFrame.onload = () => {
    try {
      const iframeDoc = pdfFrame.contentDocument || pdfFrame.contentWindow.document
      iframeDoc.addEventListener("contextmenu", (e) => e.preventDefault())
      iframeDoc.addEventListener("keydown", (e) => {
        if (e.ctrlKey && (e.key === "s" || e.key === "u")) e.preventDefault()
      })
    } catch (err) {
      console.warn("无法注入iframe安全控制：", err)
    }
  }
}
function refreshPDF() { if (pdfFrame.src) pdfFrame.src = pdfFrame.src }
function toggleFullscreen() {
  if (pdfFrame.requestFullscreen) pdfFrame.requestFullscreen()
  else if (pdfFrame.webkitRequestFullscreen) pdfFrame.webkitRequestFullscreen()
  else if (pdfFrame.msRequestFullscreen) pdfFrame.msRequestFullscreen()
}
function showVideo(item) {
  pdfContainer.style.display = "block"
  pdfTitle.textContent = item.title
  pdfFrame.src =
    "data:text/html;charset=utf-8," +
    encodeURIComponent(`<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;color:#fff;"><h2>视频播放器</h2><p>${item.file}</p></body></html>`)
}

// 轮播图
function initCarousel(id) {
  const carousel = document.getElementById(id)
  if (!carousel) return
  const slides = carousel.querySelectorAll(".carousel-slide")
  const prevBtn = carousel.querySelector(".carousel-prev")
  const nextBtn = carousel.querySelector(".carousel-next")
  const dotsContainer = carousel.querySelector(".carousel-dots")
  let index = 0
  slides.forEach((_, i) => {
    const dot = document.createElement("button")
    dot.classList.add("carousel-dot")
    if (i === 0) dot.classList.add("active")
    dot.addEventListener("click", () => showSlide(i))
    dotsContainer.appendChild(dot)
  })
  const dots = dotsContainer.querySelectorAll(".carousel-dot")
  function showSlide(i) {
    slides[index].classList.remove("active")
    dots[index].classList.remove("active")
    index = (i + slides.length) % slides.length
    slides[index].classList.add("active")
    dots[index].classList.add("active")
  }
  prevBtn.addEventListener("click", () => showSlide(index - 1))
  nextBtn.addEventListener("click", () => showSlide(index + 1))
}

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) { currentUser = savedUser; showMainApp() }
  else showLoginPage()
  setupEventListeners()
  initCarousel("facultyCarousel")
  initCarousel("cultureCarousel")
  initCarousel("campusGallery")
  setupSecurityMeasures()
})

// 安全措施
function setupSecurityMeasures() {
  document.addEventListener("contextmenu", (e) => {
    if (e.target.closest(".pdf-viewer")) { e.preventDefault(); return false }
  })
  document.addEventListener("keydown", (e) => {
   // if (e.keyCode === 123) { e.preventDefault(); return false } // F12
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) { e.preventDefault(); return false } // Ctrl+Shift+I
    if (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83)) { e.preventDefault(); return false } // Ctrl+U / Ctrl+S
    if (e.ctrlKey && e.keyCode === 65 && e.target.closest(".pdf-viewer")) { e.preventDefault(); return false } // Ctrl+A
  })
  document.addEventListener("dragstart", (e) => {
    if (e.target.closest(".pdf-viewer")) { e.preventDefault(); return false }
  })
  document.addEventListener("selectstart", (e) => {
    if (e.target.closest(".pdf-viewer")) { e.preventDefault(); return false }
  })
}

// 全局暴露
window.switchContent = switchContent
