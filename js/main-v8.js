/* 上海精智官网交互脚本（含数字人「蓝沃小智」） */
(function () {
  "use strict";

  var topbar = document.getElementById("topbar");
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var sections = navLinks
    .map(function (a) {
      var id = a.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  /* ---------- 移动端菜单 ---------- */
  navToggle.addEventListener("click", function () {
    var open = topbar.classList.toggle("nav-open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
  });

  /* 点击导航链接后收起菜单 */
  navLinks.forEach(function (a) {
    a.addEventListener("click", function () {
      topbar.classList.remove("nav-open");
      navToggle.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- 顶栏阴影 ---------- */
  function onScroll() {
    topbar.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 滚动显现动画 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealIO.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 滚动高亮当前区块 ---------- */
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = "#" + entry.target.id;
          navLinks.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 页脚年份 ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ============================================================
     数字人「蓝沃小智」
     ============================================================ */
  var launcher = document.getElementById("dhLauncher");
  var panel = document.getElementById("dhPanel");
  var figure = document.getElementById("dhFigure");
  var chat = document.getElementById("dhChat");
  var quick = document.getElementById("dhQuick");
  var form = document.getElementById("dhForm");
  var input = document.getElementById("dhInput");
  var voiceBtn = document.getElementById("dhVoiceBtn");
  var introBtn = document.getElementById("dhIntroBtn");
  var closeBtn = document.getElementById("dhCloseBtn");
  var heroDhBtn = document.getElementById("heroDhBtn");
  if (!launcher || !panel) return; // 数字人组件缺失时跳过

  var greeted = false;
  var voiceOn = true;

  /* ---------- 语音合成 ---------- */
  var synth = window.speechSynthesis || null;
  var zhVoice = null;
  function pickVoice() {
    if (!synth) return;
    var voices = synth.getVoices();
    if (!voices.length) return;
    var prefer = ["Xiaoxiao", "Huihui", "Yaoyao", "Kangkang"];
    var zh = voices.filter(function (v) { return /^zh/i.test(v.lang); });
    for (var i = 0; i < prefer.length; i++) {
      var hit = zh.find(function (v) { return v.name.indexOf(prefer[i]) > -1; });
      if (hit) { zhVoice = hit; return; }
    }
    zhVoice = zh[0] || null;
  }
  if (synth) {
    pickVoice();
    synth.addEventListener("voiceschanged", pickVoice);
  }

  function speak(text, onend) {
    if (!synth || !voiceOn) { if (onend) onend(); return; }
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = zhVoice ? zhVoice.lang : "zh-CN";
      if (zhVoice) u.voice = zhVoice;
      u.rate = 1.02;
      u.onstart = function () { figure.classList.add("speaking"); };
      u.onend = function () { figure.classList.remove("speaking"); if (onend) onend(); };
      u.onerror = function () { figure.classList.remove("speaking"); if (onend) onend(); };
      synth.speak(u);
    } catch (e) {
      figure.classList.remove("speaking");
      if (onend) onend();
    }
  }

  function stopSpeak() {
    if (synth) synth.cancel();
    figure.classList.remove("speaking");
  }

  /* ---------- 公司语音介绍 ---------- */
  var INTRO_TEXT =
    "您好，欢迎来到上海精智，我是数字人蓝沃小智。下面由我为您介绍公司。" +
    "上海精智实业股份有限公司成立于2006年，总部位于上海，2023年在全国中小企业股份转让系统挂牌，证券简称精智实业，证券代码873842。" +
    "公司以制造业工程服务为基础，面向汽车、通讯、新能源及机器人相关制造需求，提供先进装备、精密零部件、热管理产品与工业AI服务。" +
    "围绕生产计划、工艺资料与现场执行信息，公司自主研发的蓝沃工业AI，提供产能调度、工艺优化与执行监控等智能体应用。" +
    "公司的使命是：汇聚全球工人的智慧，让中国智造无限可能。" +
    "欢迎浏览官网了解业务板块、资质荣誉与工程能力，也可以随时向我提问。";

  function setIntroPlaying(playing) {
    introBtn.classList.toggle("playing", playing);
    introBtn.querySelector(".dh-intro-icon").textContent = playing ? "⏸" : "▶";
    introBtn.querySelector(".dh-intro-text").textContent = playing ? "正在介绍 · 点击停止" : "收听公司语音介绍";
  }

  introBtn.addEventListener("click", function () {
    if (introBtn.classList.contains("playing")) {
      stopSpeak();
      setIntroPlaying(false);
      return;
    }
    if (!synth) { pushMsg("bot", "当前浏览器不支持语音合成，您可以继续文字互动。"); return; }
    setIntroPlaying(true);
    speak(INTRO_TEXT, function () { setIntroPlaying(false); });
  });

  /* ---------- 语音开关 ---------- */
  function renderVoiceBtn() {
    voiceBtn.classList.toggle("off", !voiceOn);
    voiceBtn.setAttribute("aria-label", voiceOn ? "关闭语音播报" : "开启语音播报");
  }
  renderVoiceBtn();
  voiceBtn.addEventListener("click", function () {
    voiceOn = !voiceOn;
    renderVoiceBtn();
    if (!voiceOn) stopSpeak();
  });

  /* 眨眼节奏随机化（每次打开更自然，节奏更快、更易察觉） */
  var lids = document.querySelectorAll(".dh-lid");
  if (lids.length) {
    var blinkBase = 2.0 + Math.random() * 0.9;
    lids[0].style.animationDuration = blinkBase.toFixed(2) + "s";
    lids[1].style.animationDuration = blinkBase.toFixed(2) + "s";
    lids[1].style.animationDelay = (blinkBase / 2).toFixed(2) + "s";
  }

  /* ---------- 知识库（基于官网公开资料） ---------- */
  var KB = [
    {
      keys: ["介绍", "公司", "做什么", "干什么", "主营业务", "企业概况", "是谁", "什么公司", "主营"],
      answer: "上海精智实业股份有限公司成立于2006年，总部位于上海，2023年在新三板挂牌（证券代码873842）。公司以制造业工程服务为基础，面向汽车、通讯、新能源及机器人相关制造需求，提供先进装备、精密零部件、热管理产品与工业AI服务。"
    },
    {
      keys: ["业务板块", "业务", "板块", "产品", "六大", "板块有哪些", "产品线", "有哪些业务"],
      answer: "公司业务分为六大板块：工艺装备、智能信息装备、智能底盘、精密金属量产、塑胶科技、通讯热管理，以及蓝沃工业AI（产能调度、工艺优化、执行监控）。交付形态涵盖模具工装、装配检测产线、精密零部件、散热产品与软件应用。"
    },
    {
      keys: ["工业ai", "ai", "人工智能", "蓝沃", "智能体", "排产", "调度", "工艺优化", "执行监控", "算法", "数字化"],
      answer: "蓝沃工业AI围绕生产计划、工艺资料与现场执行信息提供三类应用：① 产能调度——基于人员、设备、物料、工艺和交期约束排产，支持插单模拟；② 工艺优化——图纸解析、相似工艺检索与工艺路线辅助生成；③ 执行监控——用视觉识别辅助现场作业记录与分析。可与 ERP、MES、PLM、WMS 及设备系统衔接。"
    },
    {
      keys: ["先进装备", "装备", "装配", "检测", "产线", "自动化", "差速器", "线控", "底盘", "关节模组", "机器人"],
      answer: "先进装备业务覆盖精密模具、量具、夹具与自动装配检测线，面向汽车差速器、线控底盘（转向/制动/悬架）及机器人关节模组等场景，提供装配、检测、追溯与产线集成方案。2026年半年报披露，机器人关节模组智能装备已实现销售并进入批量交付阶段。"
    },
    {
      keys: ["零部件", "塑胶", "金属", "齿轮", "注塑", "模具"],
      answer: "精密零部件业务包括金属量产件与精密注塑件：齿轮、蜗轮、壳体、阀芯与传动组件，应用于汽车执行器（天窗、进气格栅、空调出风口、换挡、驻车等）及充电口盖、门把手传动等场景，并向线控制动、悬架等系统总成拓展。"
    },
    {
      keys: ["热管理", "散热", "通讯", "储能", "液冷"],
      answer: "通讯热管理业务面向通讯、新能源及消费电子场景，提供结构件、各类散热器及新能源汽车、光伏逆变器散热产品，并向数字能源与储能方向延伸。热设计结合仿真与散热性能数据，工艺衔接压铸、机加工、装配及测试。"
    },
    {
      keys: ["资质", "认证", "荣誉", "证书", "体系", "小巨人", "单项冠军", "高新", "16949", "iso"],
      answer: "公司资质荣誉包括：专精特新“小巨人”企业（2024年通过复核）、2025年度上海市制造业单项冠军（汽车传动轴装备模具）、国家知识产权示范企业创建对象（2025—2027）、高新技术企业等。体系认证覆盖 IATF 16949、ISO 9001、ISO 14001、ISO 45001 及知识产权管理体系，涉及川沙、康桥、亿泊、东莞、武汉联航等多个主体。"
    },
    {
      keys: ["成立", "什么时候", "年份", "历史", "发展", "2006", "时间"],
      answer: "公司成立于2006年，从工装、模具、量检具、夹具及感应器等工艺装备起步，逐步拓展自动化装备与精密注塑，延伸至通讯散热、汽车零部件量产与供应链数字化，近年发展工业AI应用。"
    },
    {
      keys: ["上市", "挂牌", "股票", "证券", "代码", "873842"],
      answer: "2023年，公司在全国中小企业股份转让系统（新三板）挂牌，证券简称“精智实业”，证券代码 873842。"
    },
    {
      keys: ["地址", "位置", "总部", "在哪", "哪里", "基地", "工厂", "联系", "电话", "邮箱"],
      answer: "公司总部位于上海市杨浦区滨江，制造基地覆盖上海、广东、湖北、安徽、江苏、浙江等地（东莞、秀浦、嘉定、川沙、六安、武汉、淮安、湖州、芜湖等）。联系电话与商务邮箱请见页面底部“联系我们”板块，也可直接拨打页面展示的号码。"
    },
    {
      keys: ["客户", "案例", "行业", "汽车", "通讯", "新能源"],
      answer: "客户行业主要包括汽车及零部件、通讯、新能源和相关先进制造领域。官网案例区展示了模具加工排产、汽车零部件量产协同、装配检测、机器人关节模组装配、视觉监控等匿名应用场景。"
    },
    {
      keys: ["团队", "领导", "董事长", "总经理", "管理层", "魏杰", "汪伟"],
      answer: "公司主要管理层：魏杰任董事长；汪伟任董事、总经理；郑亮任董事、副总经理；LI YANG任董事会秘书、职工董事；潘酉海任董事、财务总监。技术方向覆盖制造工程、自动化与信息化、工业AI，并与上海理工大学开展校企合作。"
    },
    {
      keys: ["使命", "文化", "价值观", "愿景"],
      answer: "公司使命是“汇聚全球工人的智慧，让中国智造无限可能”。价值观包括：客户为本、担当实干、阳光谦逊、共同创造。"
    },
    {
      keys: ["合作", "理工", "大学", "产学研"],
      answer: "2025年5月，公司与上海理工大学签署战略合作协议，合作交流涉及智能装备、工业软件、人工智能、人才培养与平台建设等方向。"
    },
    {
      keys: ["你好", "您好", "hi", "hello", "在吗", "嗨"],
      answer: "您好！我是数字人蓝沃小智，很高兴为您服务。您可以问我公司介绍、业务板块、工业AI产品、资质荣誉、联系方式等问题，也可以点击上方按钮收听公司语音介绍。"
    },
    {
      keys: ["你是谁", "数字人", "小智", "谁在", "真人吗"],
      answer: "我是数字人蓝沃小智，上海精智的AI数字员工，形象取自公司董事、总经理汪伟。我可以为您语音介绍公司，也可以回答关于公司业务、产品、资质等方面的问题。正式商务沟通请通过“联系我们”板块与业务团队联系。"
    }
  ];

  function matchAnswer(q) {
    var s = q.toLowerCase().replace(/\s+/g, "");
    var best = null, bestScore = 0;
    for (var i = 0; i < KB.length; i++) {
      var score = 0;
      for (var j = 0; j < KB[i].keys.length; j++) {
        var k = KB[i].keys[j].toLowerCase();
        if (k && s.indexOf(k) > -1) score += k.length; // 更长关键词 = 更具体匹配
      }
      if (score > bestScore) { bestScore = score; best = KB[i].answer; }
    }
    return best || "这个问题我暂时没有掌握。您可以问我：公司介绍、业务板块、工业AI产品、资质荣誉、联系方式等，或浏览官网对应板块获取更详细的信息。如需进一步交流，欢迎通过“联系我们”板块与业务团队沟通。";
  }

  /* ---------- 聊天界面 ---------- */
  function pushMsg(who, text) {
    var div = document.createElement("div");
    div.className = "dh-msg " + (who === "user" ? "dh-msg-user" : "dh-msg-bot");
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
  }

  function showTyping() {
    var div = document.createElement("div");
    div.className = "dh-typing";
    div.innerHTML = "<i></i><i></i><i></i>";
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
  }

  function botReply(question) {
    var typing = showTyping();
    var answer = matchAnswer(question);
    setTimeout(function () {
      typing.remove();
      pushMsg("bot", answer);
      speak(answer);
    }, 650 + Math.random() * 450);
  }

  function sendQuestion(q) {
    q = (q || "").trim();
    if (!q) return;
    pushMsg("user", q);
    figure.classList.add("listening");
    setTimeout(function () { figure.classList.remove("listening"); }, 700);
    botReply(q);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    sendQuestion(input.value);
    input.value = "";
  });

  quick.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (!btn) return;
    sendQuestion(btn.textContent);
  });

  /* 消息中点击跳转（预留：如回答含链接可定位到页面区块） */
  chat.addEventListener("click", function (e) {
    var link = e.target.closest(".dh-msg-link");
    if (link) {
      closePanel();
      var target = document.querySelector(link.getAttribute("data-target"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }
  });

  /* ---------- 状态自检（面板标题栏显示） ---------- */
  var diagEl = document.getElementById("dhDiag");
  function runDiag() {
    if (!diagEl) return;
    var ok = [], warn = [];
    var lid = document.querySelector(".dh-lid");
    if (lid) {
      var cs = getComputedStyle(lid);
      if (cs.animationName === "dhBlink" && parseFloat(cs.animationDuration) > 0) ok.push("眨眼✓");
      else warn.push("眨眼✗");
    } else warn.push("眨眼✗");
    var p = document.querySelector(".dh-portrait");
    if (p && getComputedStyle(p).animationName.indexOf("dhAlive") > -1) ok.push("摆动✓");
    else warn.push("摆动✗");
    var img = p && p.querySelector("img");
    if (img && img.complete && img.naturalWidth > 0) ok.push("形象✓");
    else warn.push("形象✗");
    if (typeof speechSynthesis !== "undefined") ok.push("语音✓");
    else warn.push("语音✗");
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) warn.push("系统减少动画");
    if (window.__dhErrors && window.__dhErrors.length) warn.push("JS错误×" + window.__dhErrors.length);
    ok.push("页面v8");
    diagEl.textContent = ok.join(" ") + (warn.length ? " " + warn.join(" ") : "");
    diagEl.className = "dh-diag" + (warn.length ? " warn" : " ok");
  }
  window.__dhErrors = [];
  window.addEventListener("error", function (e) {
    window.__dhErrors.push(e.message);
    runDiag();
  });

  /* ---------- 开关面板 ---------- */
  function openPanel() {
    panel.classList.add("open");
    launcher.setAttribute("aria-expanded", "true");
    figure.classList.add("dh-greet");
    setTimeout(function () { figure.classList.remove("dh-greet"); }, 2000);
    runDiag();
    if (!greeted) {
      greeted = true;
      pushMsg("bot", "您好，我是数字人蓝沃小智 👋 可以问我公司介绍、业务板块、工业AI产品等问题，或点击上方按钮收听语音介绍。");
      speak("您好，我是数字人蓝沃小智，很高兴为您介绍上海精智。您可以向我提问，或点击按钮收听公司语音介绍。");
    }
    input.focus();
  }
  function closePanel() {
    panel.classList.remove("open");
    launcher.setAttribute("aria-expanded", "false");
    stopSpeak();
    setIntroPlaying(false);
  }

  launcher.addEventListener("click", function () {
    panel.classList.contains("open") ? closePanel() : openPanel();
  });
  closeBtn.addEventListener("click", closePanel);
  if (heroDhBtn) heroDhBtn.addEventListener("click", openPanel);

  /* 点击面板外关闭（桌面） */
  document.addEventListener("click", function (e) {
    if (!panel.classList.contains("open")) return;
    if (panel.contains(e.target) || launcher.contains(e.target)) return;
    closePanel();
  });

  /* Esc 关闭 */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
  });
})();
