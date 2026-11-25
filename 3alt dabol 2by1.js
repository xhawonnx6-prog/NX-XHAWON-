// ==UserScript==
// @name         𝗡𝗫 𝗫𝗛𝗔𝗪𝗢𝗡 – AUTO TRADEX (3-Zigzag + Dabol + 2by1)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  NX XHAWON | 3-Alternating Zigzag + Dabol Market + 2 by 1 Market
// @author       𝗡𝗫 𝗫𝗛𝗔𝗪𝗢𝗡
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    ['nxUltimateWrapper', 'nxFloatBadge', 'nxScannerOverlay', 'nxMultiScanner', 'nxResultPopup', 'nxExternalScript'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.remove();
    });

    var style = document.createElement('style');
    style.innerHTML = `
        @keyframes auraUltraGlow {
            0%   { border-color: #00ffcc; box-shadow: 0 0 35px rgba(0,255,204,0.8), inset 0 0 18px rgba(0,255,204,0.4); }
            50%  { border-color: #ffaa00; box-shadow: 0 0 35px rgba(255,170,0,0.8), inset 0 0 18px rgba(255,170,0,0.4); }
            100% { border-color: #00ffcc; box-shadow: 0 0 35px rgba(0,255,204,0.8), inset 0 0 18px rgba(0,255,204,0.4); }
        }
        @keyframes auraBadgePulse {
            0%, 100% { transform: translateX(-50%) scale(1); box-shadow: 0 0 25px rgba(0,255,204,0.9); }
            50%      { transform: translateX(-50%) scale(1.05); box-shadow: 0 0 40px rgba(255,170,0,1); }
        }
        @keyframes scanVAnim {
            0%   { top: -5%; opacity: 1; }
            100% { top: 105%; opacity: 0.2; }
        }
        @keyframes scanHAnim {
            0%   { left: -5%; opacity: 1; }
            100% { left: 105%; opacity: 0.2; }
        }
        @keyframes popupZoom {
            0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0; filter: blur(10px); }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; filter: blur(0); }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
        }
        #nxResultPopup {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2147483647;
            font-family: 'Orbitron', monospace; font-size: 45px; font-weight: 900; text-align: center;
            pointer-events: none; display: none; text-shadow: 0 0 30px currentColor, 0 0 60px currentColor;
        }
        #nxMultiScanner {
            position: fixed; inset: 0; z-index: 2147483645; pointer-events: none; display: none; overflow: hidden;
            background: radial-gradient(circle at center, rgba(5, 10, 15, 0.1), rgba(0,0,0,0.5));
        }
        .nx-scan-line { position: absolute; pointer-events: none; }
        .nx-scan-v {
            width: 100%; height: 3px;
            background: linear-gradient(90deg, transparent, #00ffcc, #ffaa00, transparent);
            box-shadow: 0 0 20px #00ffcc, 0 0 30px #ffaa00;
        }
        .nx-scan-h {
            height: 100%; width: 3px;
            background: linear-gradient(180deg, transparent, #00ffcc, #ffaa00, transparent);
            box-shadow: 0 0 20px #00ffcc, 0 0 30px #ffaa00;
        }
        .scan-down  { animation: scanVAnim 0.6s linear infinite; }
        .scan-up    { animation: scanVAnim 0.6s linear infinite; animation-direction: reverse; animation-delay: 0.1s; }
        .scan-right { animation: scanHAnim 0.6s linear infinite; animation-delay: 0.2s; }
        .scan-left  { animation: scanHAnim 0.6s linear infinite; animation-direction: reverse; animation-delay: 0.3s; }
        #nxUltimateWrapper {
            position: fixed; top: 40px; left: 50%; transform: translateX(-50%);
            z-index: 2147483646; display: flex; align-items: flex-start; gap: 8px;
            font-family: 'Rajdhani', 'Orbitron', sans-serif;
        }
        #nxMainPanel {
            width: 260px; background: transparent !important;
            border: 2px solid #00ffcc; border-radius: 20px; padding: 12px; text-align: center; color: #fff;
            animation: auraUltraGlow 4s infinite; position: relative; overflow: hidden; box-sizing: border-box;
            box-shadow: 0 15px 35px rgba(0,0,0,0.3);
        }
        .nx-bg-video {
            position: absolute !important; inset: 0; width: 100%; height: 100%;
            object-fit: cover; opacity: 1; z-index: 1 !important; pointer-events: none; border-radius: 18px;
        }
        #nxMainPanel > *:not(.nx-bg-video) {
            position: relative; z-index: 5; background: transparent !important;
        }
        .nx-header {
            background: rgba(0, 0, 0, 0.25) !important; border: 1px solid #ffaa00; color: #ffaa00;
            font-size: 11px; font-weight: 900; padding: 8px 10px; border-radius: 12px; margin-bottom: 8px;
            display: flex; justify-content: space-between; align-items: center; cursor: grab;
            box-shadow: 0 4px 15px rgba(255,170,0,0.2); font-family: 'Orbitron', monospace;
        }
        .nx-sub-title {
            background: rgba(0, 0, 0, 0.25); border: 1px solid #00ffcc; color: #00ffcc;
            font-size: 9.5px; font-weight: 800; padding: 4px; border-radius: 8px; margin-bottom: 8px;
            font-family: 'Orbitron', monospace; letter-spacing: 2px; text-shadow: 0 0 10px rgba(0,255,204,0.8);
        }
        .nx-start-btn {
            width: 100%; background: linear-gradient(90deg, #ff3366, #cc0033); color: #fff; border: none;
            padding: 10px; border-radius: 10px; font-weight: 900; font-size: 10.5px; cursor: pointer;
            letter-spacing: 1px; font-family: 'Orbitron', monospace; box-shadow: 0 0 20px rgba(255,51,102,0.8);
        }
        #nxSideHideBtn {
            background: linear-gradient(135deg, #00ffcc, #ffaa00); border: 1.5px solid #00ffcc; color: #000;
            font-family: 'Orbitron', monospace; font-size: 9px; font-weight: 900; padding: 12px 6px;
            border-radius: 12px; cursor: pointer; writing-mode: vertical-rl; text-orientation: mixed;
        }
        #nxFloatBadge {
            position: fixed; top: 12px; left: 50%; z-index: 2147483647;
            background: rgba(10, 15, 22, 0.85); border: 2px solid #00ffcc; border-radius: 14px;
            padding: 8px 18px; color: #00ffcc; font-family: 'Orbitron', monospace; font-size: 10px;
            font-weight: 900; cursor: pointer; display: none; text-align: center; animation: auraBadgePulse 2s infinite;
        }
    `;
    document.head.appendChild(style);

    var multiScanner = document.createElement('div');
    multiScanner.id = 'nxMultiScanner';
    multiScanner.innerHTML = `
        <div class="nx-scan-line nx-scan-v scan-down"></div>
        <div class="nx-scan-line nx-scan-v scan-up" style="bottom:0; top:auto;"></div>
        <div class="nx-scan-line nx-scan-h scan-right"></div>
        <div class="nx-scan-line nx-scan-h scan-left" style="right:0; left:auto;"></div>
    `;
    document.body.appendChild(multiScanner);

    var popupDiv = document.createElement('div');
    popupDiv.id = 'nxResultPopup';
    document.body.appendChild(popupDiv);

    var floatBadge = document.createElement('div');
    floatBadge.id = 'nxFloatBadge';
    floatBadge.onclick = function() { window.nxRestorePanel(); };
    floatBadge.innerText = "👑 NX XHAWON 👑";
    document.body.appendChild(floatBadge);

    var wrapper = document.createElement('div');
    wrapper.id = 'nxUltimateWrapper';
    wrapper.innerHTML = `
        <div id="nxMainPanel">
            <video class="nx-bg-video" autoplay muted loop playsinline src="https://files.catbox.moe/ldwqyg.mp4"></video>
            <div class="nx-header" id="nxDragHeader">
                <span>👑 NX XHAWON 👑</span>
                <span style="cursor:pointer; font-weight:900;" onclick="document.getElementById('nxUltimateWrapper').remove();document.getElementById('nxFloatBadge').remove();document.getElementById('nxMultiScanner').remove();document.getElementById('nxResultPopup').remove();">✕</span>
            </div>
            <div class="nx-sub-title">🤖 NX SMART ENGINE 🤖</div>
            <div style="border:1px solid #ffaa00; color:#ffaa00; font-family:'Orbitron',monospace; font-size:10.5px; font-weight:800; padding:6px; border-radius:10px; margin-bottom:8px; background:rgba(0,0,0,0.2);">🔥 WINGO 30 SEC 🔥</div>
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.2); padding:7px 10px; border-radius:10px; border:1px solid #00ffcc; margin-bottom:8px;">
                <span style="font-size:9.5px; color:#00ffcc; font-weight:700; font-family:Orbitron,monospace;">BASE AMT:</span>
                <input type="number" id="nxCustomBetInput" value="100" style="width:65px; background:rgba(0,0,0,0.4); border:1px solid #00ffcc; color:#00ffcc; text-align:center; border-radius:6px; padding:4px; font-weight:700; font-family:Orbitron,monospace; font-size:10.5px;">
            </div>
            <button id="nxStartBtn" class="nx-start-btn" onclick="window.nxToggleEngine()">START_AI_ENGINE()</button>
            
            <div id="nxDetailStats" style="display:none; margin-top:8px; font-size:9.5px; text-align:left; background:rgba(0,0,0,0.3); padding:8px; border-radius:10px; border:1px dashed #00ffcc; color:#fff; line-height:1.5;">
                <div>PERIOD: <span id="nxPeriodView" style="color:#ffaa00; font-weight:bold;">...</span></div>
                <div>CLOCK: <span id="nxTimerView" style="color:#00ffcc; font-weight:bold;">00:30</span></div>
                <div>AI SIGNAL: <span id="nxSignalView" style="color:#ffaa00; font-weight:bold;">WAITING</span></div>
                <div>LUCKY NO: <span id="nxLuckyView" style="color:#00ffcc; font-weight:bold;">-</span></div>
                <div>STEP: <span id="nxStepView" style="color:#ff3366; font-weight:bold;">0</span></div>
                
                <div style="margin-top:6px; padding-top:6px; border-top:1px solid rgba(0,255,204,0.3);">
                    <div>TOTAL SIG: <span id="nxTotalSigView" style="color:#fff; font-weight:bold;">0</span></div>
                    <div>TOTAL WIN: <span id="nxWinView" style="color:#00ffcc; font-weight:bold;">0</span></div>
                    <div>MAX WIN: <span id="nxMaxWinView" style="color:#00ffcc; font-weight:bold;">0</span></div>
                    <div>MAX LOS: <span id="nxMaxLosView" style="color:#ff3366; font-weight:bold;">0</span></div>
                </div>

                <div style="margin-top:6px; text-align:center; background:rgba(0,0,0,0.3); padding:5px; border-radius:6px; border:1px solid #ffaa00;">STATUS: <span id="nxStatText" style="color:#ffaa00; font-weight:bold;">STOP</span></div>
            </div>
        </div>
        <button id="nxSideHideBtn" onclick="window.nxHidePanel()">HIDE</button>
    `;
    document.body.appendChild(wrapper);

    var wrapperEl = document.getElementById('nxUltimateWrapper');
    var fBadge = document.getElementById('nxFloatBadge');
    var header = document.getElementById('nxDragHeader');
    var isDragging = false, startX, startY, initialX, initialY;

    header.onmousedown = header.ontouchstart = function(e) {
        isDragging = true;
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX; startY = clientY;
        initialX = wrapperEl.offsetLeft; initialY = wrapperEl.offsetTop;
        e.preventDefault();
    };
    document.onmousemove = document.ontouchmove = function(e) {
        if (!isDragging) return;
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        requestAnimationFrame(function() {
            wrapperEl.style.left = (initialX + (clientX - startX)) + 'px';
            wrapperEl.style.top = (initialY + (clientY - startY)) + 'px';
            wrapperEl.style.transform = 'translateX(0)';
        });
    };
    document.onmouseup = document.ontouchend = function() { isDragging = false; };

    window.nxHidePanel = function() { wrapperEl.style.display = 'none'; fBadge.style.display = 'block'; };
    window.nxRestorePanel = function() { fBadge.style.display = 'none'; wrapperEl.style.display = 'flex'; };

    function triggerAuraScan(duration) {
        var scanner = document.getElementById('nxMultiScanner');
        if (!scanner) return;
        scanner.style.display = 'block';
        setTimeout(function() { scanner.style.display = 'none'; }, duration || 2000);
    }

    function showAuraResultPopup(type) {
        var popup = document.getElementById('nxResultPopup');
        if (!popup) return;
        if (type === 'WIN') {
            popup.innerText = "👑 WIN 🎯"; popup.style.color = "#00ffcc";
        } else {
            popup.innerText = "❌ LOSS 👑"; popup.style.color = "#ff3366";
        }
        popup.style.display = 'block';
        popup.style.animation = 'none';
        popup.offsetHeight;
        popup.style.animation = 'popupZoom 1.2s ease-in-out forwards';
        setTimeout(function() { popup.style.display = 'none'; }, 1200);
    }

    var isEngineRunning = false;
    var activePeriod = null;
    var activePick = "BIG";
    var luckyNumber = 5;
    var betExecutedForPeriod = null;
    
    // ✅ স্ট্যাটাস ভেরিয়েবল
    var totalSignals = 0;
    var totalWins = 0;
    var currentStep = 0;
    var currentWinStreak = 0;
    var currentLossStreak = 0;
    var maxWinStreak = 0;
    var maxLossStreak = 0;
    
    // ✅ ডাবল মার্কেট এবং 2 by 1 ট্র্যাকিং ভেরিয়েবল
    var dbState = "NONE";
    var dbCount = 0;

    window.nxToggleEngine = function() {
        isEngineRunning = !isEngineRunning;
        var btn = document.getElementById('nxStartBtn');
        var details = document.getElementById('nxDetailStats');
        var statText = document.getElementById('nxStatText');
        var bgVideo = wrapperEl.querySelector('.nx-bg-video');

        if (bgVideo) {
            bgVideo.muted = true;
        }

        if (isEngineRunning) {
            btn.innerText = "STOP_AI_ENGINE()";
            details.style.display = "block";
            statText.innerText = "RUNNING (ACTIVE)";
            statText.style.color = "#00ffcc";
            triggerAuraScan(2000);
        } else {
            btn.innerText = "START_AI_ENGINE()";
            details.style.display = "none";
            statText.innerText = "STOP";
            statText.style.color = "#ffaa00";
            var scanner = document.getElementById('nxMultiScanner');
            if (scanner) scanner.style.display = 'none';
        }
    };

    // ✅ নতুন লজিক (3-Zigzag + Dabol Market + 2by1 Market)
    function calculateAdvancedPrediction(list, nextIssStr) {
        var history = list.slice(0, 50).map(function(item) {
            var num = parseInt(item.number);
            return { number: num, type: num >= 5 ? "BIG" : "SMALL" };
        });

        if (history.length < 5) return { pick: "BIG", lucky: 5 };

        var types = history.map(function(h) { return h.type; });
        var t0 = types[0]; // Latest
        var t1 = types[1];
        var t2 = types[2];
        var t3 = types[3];
        var t4 = types[4];

        var predicted = null;

        // ১. যদি সিরিজ চলে, তবে অন্য কিছু চেক না করে সিরিজের ট্রেড দেবে
        if (dbState !== "NONE") {
            if (dbState === "DB_BIG_START") {
                dbCount++;
                if (dbCount === 2) predicted = "BIG";
                else if (dbCount === 3) predicted = "SMALL";
                else if (dbCount === 4) predicted = "SMALL";
                else if (dbCount > 4) { dbState = "NONE"; dbCount = 0; }
            } else if (dbState === "DB_SMALL_START") {
                dbCount++;
                if (dbCount === 2) predicted = "SMALL";
                else if (dbCount === 3) predicted = "BIG";
                else if (dbCount === 4) predicted = "BIG";
                else if (dbCount > 4) { dbState = "NONE"; dbCount = 0; }
            } else if (dbState === "21_BIG_START") {
                dbCount++;
                if (dbCount === 2) predicted = "BIG";
                else if (dbCount === 3) predicted = "SMALL";
                else if (dbCount > 3) { dbState = "NONE"; dbCount = 0; }
            } else if (dbState === "21_SMALL_START") {
                dbCount++;
                if (dbCount === 2) predicted = "SMALL";
                else if (dbCount === 3) predicted = "BIG";
                else if (dbCount > 3) { dbState = "NONE"; dbCount = 0; }
            }
            
            // সিরিজ চলাকালীন জিগজ্যাগ বা অন্য কিছু চেক হবে না
            if (!predicted) return { pick: "WAIT", lucky: "-" };
        }

        // ২. নতুন প্যাটার্ন চেক (যদি সিরিজ না থাকে)
        if (!predicted && dbState === "NONE") {
            // Dabol Market 1
            if (t4 === "SMALL" && t3 === "BIG" && t2 === "BIG" && t1 === "SMALL" && t0 === "SMALL") {
                dbState = "DB_BIG_START"; dbCount = 1; predicted = "BIG";
            }
            // Dabol Market 2
            else if (t4 === "BIG" && t3 === "SMALL" && t2 === "SMALL" && t1 === "BIG" && t0 === "BIG") {
                dbState = "DB_SMALL_START"; dbCount = 1; predicted = "SMALL";
            }
            // 2 by 1 Market 1
            else if (t4 === "BIG" && t3 === "SMALL" && t2 === "BIG" && t1 === "BIG" && t0 === "SMALL") {
                dbState = "21_BIG_START"; dbCount = 1; predicted = "BIG";
            }
            // 2 by 1 Market 2
            else if (t4 === "SMALL" && t3 === "BIG" && t2 === "SMALL" && t1 === "SMALL" && t0 === "BIG") {
                dbState = "21_SMALL_START"; dbCount = 1; predicted = "SMALL";
            }
        }

        // ৩. জিগজ্যাগ ভাঙা (BIG-BIG বা SMALL-SMALL)
        if (!predicted && t0 === t1) {
            predicted = t0;
        }

        // ৪. জিগজ্যাগ রিভার্স (৩টা অল্টারনেটিং)
        if (!predicted && t0 !== t1 && t1 !== t2) {
            predicted = (t0 === "SMALL") ? "BIG" : "SMALL";
        }

        // ৫. মার্কেট ফ্লো
        if (!predicted) {
            predicted = t0;
        }

        // লাকি নাম্বার জেনারেট করা
        var eligibleNums = predicted === "BIG" ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4];
        var seedNum = Number(BigInt(nextIssStr) % 1000n);
        var sinVal = Math.abs(Math.sin(seedNum));
        var index = Math.floor(sinVal * eligibleNums.length);
        var chosenLucky = eligibleNums[index];

        return { pick: predicted, lucky: chosenLucky };
    }

    async function fetchApiData() {
        if (!isEngineRunning) return;
        try {
            var apiUrl = "https://draw.ar-lottery01.com/WinGo/WinGo_30S/GetHistoryIssuePage.json?pageNo=1&pageSize=50&t=" + Date.now();
            var res = await fetch(apiUrl, { cache: "no-store" });
            var json = await res.json();

            if (json && json.data && json.data.list && json.data.list.length > 0) {
                var list = json.data.list;
                var latestResult = list[0].number;
                var nextIss = (BigInt(list[0].issueNumber) + 1n).toString();

                if (activePeriod && activePeriod !== nextIss) {
                    var numVal = parseInt(latestResult);
                    var actualType = (numVal >= 5) ? "BIG" : "SMALL";

                    totalSignals++;
                    
                    if (activePick === actualType) {
                        totalWins++;
                        currentStep = 0;
                        currentWinStreak++;
                        currentLossStreak = 0;
                        if (currentWinStreak > maxWinStreak) maxWinStreak = currentWinStreak;
                        
                        showAuraResultPopup("WIN");
                    } else {
                        currentStep++;
                        currentLossStreak++;
                        currentWinStreak = 0;
                        if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
                        
                        // LOSS হলে ডাবল মার্কেট বা 2by1 মার্কেট ব্রেক হবে
                        if (dbState !== "NONE") { 
                            dbState = "NONE"; 
                            dbCount = 0; 
                        }
                        showAuraResultPopup("LOSS");
                    }

                    // UI আপডেট
                    var tsEl = document.getElementById("nxTotalSigView"); if (tsEl) tsEl.innerText = totalSignals;
                    var wEl = document.getElementById("nxWinView"); if (wEl) wEl.innerText = totalWins;
                    var mwEl = document.getElementById("nxMaxWinView"); if (mwEl) mwEl.innerText = maxWinStreak;
                    var mlEl = document.getElementById("nxMaxLosView"); if (mlEl) mlEl.innerText = maxLossStreak;
                    var stEl = document.getElementById("nxStepView"); if (stEl) stEl.innerText = currentStep;
                }

                if (activePeriod !== nextIss) {
                    activePeriod = nextIss;
                    betExecutedForPeriod = null;
                    var resultObj = calculateAdvancedPrediction(list, activePeriod);
                    activePick = resultObj.pick;
                    luckyNumber = resultObj.lucky;
                }
            }
        } catch (e) {
            console.warn("NX Engine Fetch Error:", e);
        }
    }

    function runEngineTicks() {
        if (!isEngineRunning) return;
        var now = new Date();
        var secLeft = 30 - (Math.floor(now.getTime() / 1000) % 30);

        var tmrEl = document.getElementById("nxTimerView");
        if (tmrEl) tmrEl.innerText = "00:" + (secLeft < 10 ? "0" : "") + secLeft;

        if (activePeriod) {
            var pEl = document.getElementById("nxPeriodView"); if (pEl) pEl.innerText = activePeriod;
            var sEl = document.getElementById("nxSignalView"); if (sEl) sEl.innerText = activePick;
            var lkEl = document.getElementById("nxLuckyView"); if (lkEl) lkEl.innerText = luckyNumber;

            if (secLeft === 28 && betExecutedForPeriod !== activePeriod) {
                triggerAuraScan(1000);
            }

            if (secLeft === 27 && betExecutedForPeriod !== activePeriod) {
                betExecutedForPeriod = activePeriod;

                // যদি WAIT থাকে, ট্রেড নেবে না
                if (activePick === "WAIT") {
                    return;
                }

                var baseInput = document.getElementById("nxCustomBetInput");
                var baseAmt = parseFloat(baseInput ? baseInput.value : "100");
                var finalAmt = baseAmt * Math.pow(2, currentStep);
                var tText = activePick === "BIG" ? "Big" : "Small";

                var targetElements = document.querySelectorAll("div, button, span");
                targetElements.forEach(function(el) {
                    if (el.innerText && el.innerText.trim().toUpperCase() === tText.toUpperCase() && el.offsetHeight > 0) {
                        el.click();
                    }
                });

                setTimeout(function() {
                    targetElements.forEach(function(el) {
                        if (el.innerText && el.innerText.trim() === String(luckyNumber) && el.offsetHeight > 0) {
                            el.click();
                        }
                    });
                }, 150);

                setTimeout(function() {
                    document.querySelectorAll("input").forEach(function(inp) {
                        if (inp.type === "number" && inp.id !== "nxCustomBetInput") {
                            inp.value = finalAmt;
                            inp.dispatchEvent(new Event("input", { bubbles: true }));
                            inp.dispatchEvent(new Event("change", { bubbles: true }));
                        }
                    });
                    setTimeout(function() {
                        document.querySelectorAll("button, div").forEach(function(b) {
                            var txt = b.innerText ? b.innerText.toUpperCase() : "";
                            if (txt.includes("CONFIRM") || txt.includes("BUY") || txt.includes("TOTAL") || txt.includes("PRESSET")) {
                                b.click();
                            }
                        });
                    }, 250);
                }, 250);
            }
        }
    }

    setInterval(fetchApiData, 1000);
    setInterval(runEngineTicks, 1000);
})();