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
  home: { title: "首页", items: [] },
  application: {
    title: "申报书",
    items: [
      { id: "app-form", title: "申报表格", type: "pdf", file: "pdfs/application-form.pdf" },
      { id: "app-summary", title: "申报摘要", type: "pdf", file: "pdfs/application-summary.pdf" }
    ]
  },
  summary: {
    title: "成果总结",
    items: [
      { id: "summary-report", title: "总结报告", type: "pdf", file: "pdfs/summary-report.pdf" },
      { id: "summary-analysis", title: "成果分析", type: "pdf", file: "pdfs/summary-analysis.pdf" }
    ]
  },
  awards: {
    title: "成果获奖证明",
    items: [
      { id: "award-1", title: "广东省教学成果一等奖证书", type: "pdf", file: "pdfs/award-certificate-1.pdf" },
      { id: "award-2", title: "广东省教学成果二等奖证书", type: "pdf", file: "pdfs/award-certificate-2.pdf" }
    ]
  },
  certificates: {
    title: "成果证明材料",
    items: [
      { id: "cert-1", title: "专业建设方案", type: "pdf", file: "pdfs/program-plan.pdf" },
      { id: "cert-2", title: "课程体系文件", type: "pdf", file: "pdfs/curriculum-system.pdf" }
    ]
  },
  support: {
    title: "成果支撑材料",
    items: [
      { id: "support-1", title: "教学改革文件", type: "pdf", file: "pdfs/teaching-reform.pdf" }
    ]
  },
  promotion: {
    title: "成果推广材料",
    items: [
      { id: "promo-1", title: "推广应用报告", type: "pdf", file: "pdfs/promotion-report.pdf" }
    ]
  }
}

// 用户账号
const validCredentials = { admin: "admin123", teacher: "teacher123", guest: "guest123" }

// DOM
const loginPage = document.getElementById("loginPage")
const mainApp = document.getElementById("mainApp")
const loginForm = document.getElementById("loginForm")
const loginError = document.getElementById("loginError")
const logoutBtn = document.getElementById("logoutBtn")
const sidebarTitle = document.getElementById("sidebarTitle")
const sidebarMenu = document.getElementById("sidebarMenu")
const breadcrumbPath = document.getElementById("breadcrumbPath")
const welcomeContent = document.getElementById("welcomeContent")
const pdfContainer = document.getElementById("pdfContainer")
const pdfTitle = document.getElementById("pdfTitle")
const pdfFrame = document.getElementById("pdfFrame")
const refreshPdfBtn = document.getElementById("refreshPdf")
const fullscreenPdfBtn = document.getElementById("fullscreenPdf")

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
function showLoginError(message) { loginError.textContent = message; loginError.style.display = "block" }
function hideLoginError() { loginError.style.display = "none" }
function initializeMainApp() {
  renderNavEvents()
  updateSidebar()
  // 默认进入申报书页面
  currentTab = "application"
  const structure = contentStructure[currentTab]
  if (structure && structure.items.length > 0) {
    switchContent(structure.items[0].id)
  } else {
    showContent("welcome")
  }
}

function resetApp() {
  currentTab = "application"       // 登出或重置也回到申报书
  const structure = contentStructure[currentTab]
  if (structure && structure.items.length > 0) {
    currentContent = structure.items[0].id
  } else {
    currentContent = "welcome"
  }
  loginForm.reset()
}
function renderNavEvents() {
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach(item => {
    item.addEventListener("click", () => switchTab(item.dataset.tab))
  })
}
function switchTab(tab) {
  currentTab = tab
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach(item => { item.classList.toggle("active", item.dataset.tab === tab) })
  updateSidebar()
  if (tab === "home") showContent("homePage")
  else {
    const structure = contentStructure[tab]
    if (structure && structure.items.length > 0) switchContent(structure.items[0].id)
    else switchContent("welcome")
  }
}
function updateSidebar() {
  const structure = contentStructure[currentTab]
  if (!structure) {
    sidebarTitle.textContent = "导航"
    sidebarMenu.innerHTML = `<li><button onclick="switchContent('welcome')">欢迎页面</button></li>`
    return
  }
  sidebarTitle.textContent = structure.title
  sidebarMenu.innerHTML = structure.items.map(item =>
    `<li><button onclick="switchContent('${item.id}')" data-content="${item.id}">${item.title}</button></li>`
  ).join("")
}
function switchContent(contentId) {
  currentContent = contentId
  const sidebarButtons = sidebarMenu.querySelectorAll("button")
  sidebarButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.content === contentId))
  updateBreadcrumb()
  showContent(contentId)
}
function updateBreadcrumb() {
  const structure = contentStructure[currentTab]
  let path = "首页"
  if (structure) {
    path += ` > ${structure.title}`
    const currentItem = structure.items.find(i => i.id === currentContent)
    if (currentItem) path += ` > ${currentItem.title}`
  }
  breadcrumbPath.textContent = path
}
function showContent(contentId) {
  document.getElementById("homePage").style.display = "none"
  welcomeContent.style.display = "none"
  pdfContainer.style.display = "none"

  if (contentId === "homePage") { document.getElementById("homePage").style.display = "block"; return }
  if (contentId === "welcome") { welcomeContent.style.display = "block"; return }

  const structure = contentStructure[currentTab]
  if (!structure) return
  const item = structure.items.find(i => i.id === contentId)
  if (!item) return

  if (item.type === "pdf") showPDF(item)
  else if (item.type === "video") showVideo(item)
}

// PDF & Video
function showPDF(item) {
  pdfContainer.style.display = "block"
  pdfTitle.textContent = item.title
  pdfFrame.src = item.file
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
    encodeURIComponent(`<html><body style="margin:0;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;"><h2>视频播放器</h2><p>${item.file}</p></body></html>`)
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
  if (savedUser) {
    currentUser = savedUser
    showMainApp()
    currentTab = "application"          // 默认申报书
    const structure = contentStructure[currentTab]
    currentContent = structure.items[0].id
    updateSidebar()
    switchContent(currentContent)
  } else {
    showLoginPage()
  }

  setupEventListeners()
  initCarousel("facultyCarousel")
  initCarousel("cultureCarousel")
  initCarousel("campusGallery")
  setupSecurityMeasures()
})



function setupEventListeners() {
  loginForm.addEventListener("submit", handleLogin)
  logoutBtn.addEventListener("click", handleLogout)
  refreshPdfBtn.addEventListener("click", refreshPDF)
  fullscreenPdfBtn.addEventListener("click", toggleFullscreen)
}

// 全局暴露
window.switchContent = switchContent
