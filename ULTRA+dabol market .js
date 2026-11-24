// ==UserScript==
// @name         𝗡𝗫 𝗫𝗛𝗔𝗪𝗢𝗡 – ULTIMATE ZIGZAG (4) + DABOL MARKET
// @namespace    http://tampermonkey.net/
// @version      51.0.0
// @description  NX XHAWON | Auto Trade + Zigzag (4 Alternating) + Double Market Logic
// @author       𝗡𝗫 𝗫𝗛𝗔𝗪𝗢𝗡
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function(){
    if(document.getElementById('sys-core-fin')) return;
    
    // ==========================================
    // 1. FIREBASE CONNECT & ADMIN CONTROL
    // ==========================================
    const firebaseConfig = {
        apiKey: "AIzaSyAqW8zmQPiG3tM-dOMnJCZ4YF75qncF9Uk",
        authDomain: "ff-tournament-c8552.firebaseapp.com",
        databaseURL: "https://ff-tournament-c8552-default-rtdb.firebaseio.com",
        projectId: "ff-tournament-c8552",
        storageBucket: "ff-tournament-c8552.firebasestorage.app",
        messagingSenderId: "579444442534",
        appId: "1:579444442534:web:8272e49d342a6e5ca4bb67",
        measurementId: "G-WPBLWZQ7S1"
    };

    let db;
    let userStatus = "pending";
    let expiresAt = 0;
    let deviceId = localStorage.getItem('drx_device_id');
    if (!deviceId) {
        deviceId = 'DRX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem('drx_device_id', deviceId);
    }
    let userIP = "Fetching...";
    let browserInfo = navigator.userAgent.substring(0, 60);

    function loadFirebase(callback) {
        if (typeof firebase !== 'undefined') { callback(); return; }
        let s1 = document.createElement('script');
        s1.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js";
        document.head.appendChild(s1);
        let s2 = document.createElement('script');
        s2.src = "https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js";
        document.head.appendChild(s2);
        
        let att = 0;
        let chk = setInterval(() => {
            att++;
            if (typeof firebase !== 'undefined' || att > 50) {
                clearInterval(chk);
                if (typeof firebase !== 'undefined') callback();
            }
        }, 200);
    }

    loadFirebase(() => {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();

        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => { 
                userIP = data.ip; 
                db.ref('drx_users/' + deviceId).update({ ip: userIP, browser: browserInfo });
            }).catch(() => { userIP = "Unknown"; });

        db.ref('drx_users/' + deviceId).on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                userStatus = data.status || "pending";
                expiresAt = data.expiresAt || 0;
                
                if (data.command === 'STOP') {
                    if(st.isRun) {
                        st.isRun = false; clearInterval(st.autoInt);
                        let lkOvl = document.getElementById('drx-lck-bg');
                        if(lkOvl) lkOvl.style.display = 'none';
                        document.body.style.overflow = '';
                        let uSts = document.getElementById('ui-sts');
                        if(uSts) { uSts.innerText = 'HALTED (ADMIN)'; uSts.className = 'txt-blk-err'; }
                        alert("ADMIN FORCED STOP YOUR BOT!");
                    }
                    db.ref('drx_users/' + deviceId).update({ command: null });
                }
                _checkAdminStatus();
            } else {
                db.ref('drx_users/' + deviceId).set({
                    deviceId: deviceId, status: 'pending', expiresAt: 0, regTime: Date.now(), ip: userIP, browser: browserInfo
                });
                _checkAdminStatus();
            }
        });

        const showLockScreen = (msg) => {
            let lockDiv = document.getElementById('drx-admin-lock');
            if (!lockDiv) {
                lockDiv = document.createElement('div');
                lockDiv.id = 'drx-admin-lock';
                lockDiv.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:#050505;color:#a020f0;z-index:99999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;text-align:center;text-shadow:0 0 20px #a020f0;";
                document.body.appendChild(lockDiv);
                document.body.style.overflow = 'hidden';
            }
            lockDiv.innerHTML = `
                <div style="font-size:26px;margin-bottom:15px;font-weight:bold;color:#f00;">${msg}</div>
                <div style="font-size:16px;color:#fff;text-shadow:none;background:#111;padding:10px 20px;border-radius:5px;border:1px dashed #a020f0;">
                    YOUR DEVICE ID: <span style="color:#00ffcc;font-weight:bold;">${deviceId}</span>
                </div>
                <div style='font-size:12px;color:#666;margin-top:20px;text-shadow:none;'>Contact Admin to Activate or Renew.</div>
            `;
        };
        const removeLockScreen = () => {
            let lockDiv = document.getElementById('drx-admin-lock');
            if (lockDiv) { lockDiv.remove(); document.body.style.overflow = ''; }
        };

        window._checkAdminStatus = () => {
            if (userStatus === 'blocked') { showLockScreen("ACCESS DENIED: BANNED"); st.isRun = false; clearInterval(st.autoInt); return true; }
            if (userStatus === 'pending') { showLockScreen("SYSTEM LOCKED: PENDING"); st.isRun = false; clearInterval(st.autoInt); return true; }
            if (Date.now() > expiresAt) { showLockScreen("SYSTEM EXPIRED: RENEW"); st.isRun = false; clearInterval(st.autoInt); return true; }
            removeLockScreen(); return false;
        };

        // ==========================================
        // 2. CORE SETUP
        // ==========================================
        const uF = (s) => String(s).toUpperCase().split('').map(c => {
            let n = c.charCodeAt(0);
            if(n>=65&&n<=90) return String.fromCodePoint(n+119743); 
            if(n>=48&&n<=57) return String.fromCodePoint(n+120764); 
            return c;
        }).join('');

        const PLATFORM_ID = 'dkwin';
        const d = {"B1":{"x":118,"y":63,"w":123,"h":37.5}}; 
        const sel = {
            BIG: "div#app > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div",
            SMALL: "div#app > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div:nth-of-type(2)",
            A1: "div#app > div:nth-of-type(2) > div:nth-of-type(5) > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > input",
            DTA: "div#app > div:nth-of-type(2) > div:nth-of-type(5) > div > div:nth-of-type(3) > button:nth-of-type(2)"
        };
        
        const cfg = { fRt: 300, syncDly: 2500, minSf: 10 };
        
        let st = { 
            isRun: false, tgtAmt: 500, curBal: 0, autoInt: null, preScn: null, 
            isTrd: false, stpIdx: 0, dynSeq: [], mode: 'DEF', extVal: 0,
            mlActive: false, timeLimit: 'NO', tradesDone: 0, maxTrades: 0,
            activeAI: 'ZIGZAG+DABOL',
            lossCount: 0, currentStep: 0, baseAmount: 5,
            
            // ✅ ডাবল মার্কেট ট্র্যাকিং ভেরিয়েবল
            db_state: "NONE",
            db_count: 0,
            
            totalSignals: 0, totalWins: 0, totalLosses: 0,
            maxLossStreak: 0, maxWinStreak: 0,
            currentLossStreak: 0, currentWinStreak: 0,
            lastPred: null, lastPeriod: null, lastHist: null, lastNumber: null
        };

        class DataVault {
            static init() {
                if(!localStorage.getItem('drx_data_vault_v8')) {
                    localStorage.setItem('drx_data_vault_v8', JSON.stringify({ 
                        history: [], wins: 0, losses: 0, balance_peak: 0, system_logs: []
                    }));
                }
            }
            static get() { return JSON.parse(localStorage.getItem('drx_data_vault_v8')); }
            static save(d) { localStorage.setItem('drx_data_vault_v8', JSON.stringify(d)); }
            static addRecord(period, result, pred, isWin) {
                let d = this.get();
                if(!d.history.find(x => x.period === period)) {
                    d.history.unshift({ period: period, result: parseInt(result), pred: pred, isWin: isWin });
                    if(d.history.length > 2000) d.history.pop();
                    if(isWin) d.wins++; else d.losses++;
                    this.save(d);
                }
            }
            static getHistoryArray() { return this.get().history.map(x => parseInt(x.result)); }
        }
        DataVault.init();

        // ==========================================
        // 3. 🔥 ZIGZAG (4-Alternating) + DABOL MARKET LOGIC
        // ==========================================
        const UserPatternLogic = (h) => {
            if (!h || h.length < 5) return { pick: "WAIT", pattern: "Not Enough Data" };
            
            // রিভার্স করে নিচ্ছি যাতে index 0 = পুরনো, index 4 = নতুন
            let types = ["BIG" if n >= 5 else "SMALL" for n in h];
            let hist = list(reversed(types));
            
            let t0 = hist[-1]; // Latest
            let t1 = hist[-2];
            let t2 = hist[-3];
            let t3 = hist[-4];
            let t4 = hist[-5];
            
            // ✅ ১. ডাবল মার্কেট কনফার্মেশন চেক
            if (st.db_state === "NONE") {
                // SMALL-BIG-BIG-SMALL-SMALL
                if (t4 === "SMALL" && t3 === "BIG" && t2 === "BIG" && t1 === "SMALL" && t0 === "SMALL") {
                    st.db_state = "DB_BIG_START";
                    st.db_count = 1;
                    return { pick: "BIG", pattern: "DABOL MARKET (1/4)" };
                }
                // BIG-SMALL-SMALL-BIG-BIG
                else if (t4 === "BIG" && t3 === "SMALL" && t2 === "SMALL" && t1 === "BIG" && t0 === "BIG") {
                    st.db_state = "DB_SMALL_START";
                    st.db_count = 1;
                    return { pick: "SMALL", pattern: "DABOL MARKET (1/4)" };
                }
            }
            // ✅ ২. ডাবল মার্কেট সিরিজ চললে
            else if (st.db_state === "DB_BIG_START") {
                st.db_count++;
                if (st.db_count === 2) return { pick: "BIG", pattern: "DABOL MARKET (2/4)" };
                if (st.db_count === 3) return { pick: "SMALL", pattern: "DABOL MARKET (3/4)" };
                if (st.db_count === 4) return { pick: "SMALL", pattern: "DABOL MARKET (4/4)" };
                if (st.db_count > 4) { st.db_state = "NONE"; st.db_count = 0; }
            }
            else if (st.db_state === "DB_SMALL_START") {
                st.db_count++;
                if (st.db_count === 2) return { pick: "SMALL", pattern: "DABOL MARKET (2/4)" };
                if (st.db_count === 3) return { pick: "BIG", pattern: "DABOL MARKET (3/4)" };
                if (st.db_count === 4) return { pick: "BIG", pattern: "DABOL MARKET (4/4)" };
                if (st.db_count > 4) { st.db_state = "NONE"; st.db_count = 0; }
            }

            // ✅ ৩. সাধারণ জিগজ্যাগ ভাঙা (BIG-BIG বা SMALL-SMALL)
            if (t0 === t1) {
                st.db_state = "NONE"; st.db_count = 0;
                return { pick: t0, pattern: "MARKET FLOW (ZIGZAG BROKEN)" };
            }

            // ✅ ৪. জিগজ্যাগ (৪টা অল্টারনেটিং: BIG-SMALL-BIG-SMALL বা SMALL-BIG-SMALL-BIG)
            if (t0 !== t1 && t1 !== t2 && t2 !== t3) {
                st.db_state = "NONE"; st.db_count = 0;
                return { pick: (t0 === "SMALL" ? "BIG" : "SMALL"), pattern: "ZIGZAG (REVERSE)" };
            }

            // ✅ ৫. মার্কেট ফ্লো
            st.db_state = "NONE"; st.db_count = 0;
            return { pick: t0, pattern: "MARKET FLOW" };
        };

        // ==========================================
        // 4. 🔥 MARTINGALE CALCULATOR (Full Balance Feature)
        // ==========================================
        const calcSeq = (cBal, tgtAmt) => {
            let base = st.extVal > 0 ? st.extVal : 5;
            if (st.currentStep === 0) {
                st.baseAmount = base;
            }
            
            let amount = st.baseAmount * Math.pow(2, st.currentStep);
            
            // ✅ যদি ডাবল অ্যামাউন্টের চেয়ে ব্যালেন্স কম থাকে, তবে পুরো ব্যালেন্স বাজি ধরবে
            if (amount > cBal) {
                amount = cBal; 
            }
            
            if (amount < 1) amount = 0;
            
            console.log(`📊 Step ${st.currentStep + 1} → Amount: ${amount}`);
            return [amount];
        };

        // ==========================================
        // 5. UI
        // ==========================================
        let lkOvl = document.createElement('div');
        lkOvl.id = 'drx-lck-bg';
        lkOvl.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.01);z-index:9999997;display:none;';
        lkOvl.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); }, true);
        document.body.appendChild(lkOvl);

        function ext(tgt) {
            let tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
            let n, arr=[];
            while(n=tw.nextNode()){
                let v = n.nodeValue.trim();
                if(!v)continue;
                let r=document.createRange();r.selectNodeContents(n);
                let br=r.getBoundingClientRect();
                let absX = br.left+window.scrollX; let absY = br.top+window.scrollY;
                let m1 = !(absX>tgt.x+tgt.w || absX+br.width<tgt.x || absY>tgt.y+tgt.h || absY+br.height<tgt.y);
                let fixX = br.left; let fixY = br.top;
                let m2 = !(fixX>tgt.x+tgt.w || fixX+br.width<tgt.x || fixY>tgt.y+tgt.h || fixY+br.height<tgt.y);
                if(m1 || m2) arr.push(v);
            }
            return arr;
        }

        function chkBal() {
            let bText = document.body.innerText;
            let bMatch = bText.match(/৳[\s]*([\d,]+\.\d{2})/);
            if (bMatch) {
                let p = parseFloat(bMatch[1].replace(/,/g, ''));
                if (!isNaN(p)) { st.curBal = p; return st.curBal; }
            }
            let tb = ext(d.B1);
            if(tb.length > 0) {
                let p = parseFloat(tb[0].replace(/[^0-9.]/g, ''));
                if(!isNaN(p)) st.curBal = p;
            }
            return st.curBal;
        }

        let p = document.createElement('div');
        p.id = 'sys-core-fin';
        p.style.cssText = 'position:fixed;width:250px;padding:4px;font-family:monospace;font-size:10px;z-index:9999999;color:#fff;user-select:none;border-radius:16px;overflow:visible;background:transparent;'; 
        
        let sL = localStorage.getItem('drx_ui_x');
        let sT = localStorage.getItem('drx_ui_y');
        if(sL && sT) { p.style.left = sL; p.style.top = sT; } 
        else { p.style.top = '20px'; p.style.right = '20px'; }

        let stl = document.createElement('style');
        stl.innerHTML = `
            @keyframes neonPulse { 0% { box-shadow: 0 0 10px #00ffe0, 0 0 20px #4a00e0; } 50% { box-shadow: 0 0 20px #00ffe0, 0 0 40px #8e2de2; } 100% { box-shadow: 0 0 10px #00ffe0, 0 0 20px #4a00e0; } }
            @keyframes titlePulseAnim { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
            .drx-in { background: linear-gradient(145deg, #0a0a1a, #1a1a3e); position:relative; z-index:1; display:flex; flex-direction:column; height:100%; border-radius:16px; border: 2px solid #4a00e0; box-shadow: 0 0 30px rgba(74, 0, 224, 0.3); box-sizing: border-box; animation: neonPulse 3s infinite ease-in-out; }
            .drx-in .header-bg { background: linear-gradient(90deg, #4a00e0, #8e2de2, #4a00e0); padding: 2px; border-radius: 16px 16px 0 0; margin: -2px -2px 0 -2px; }
            .drx-in .header-content { background: #0a0a1a; padding: 8px 12px; border-radius: 14px 14px 0 0; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #00ffe0; }
            .drx-title-anim { display: inline-block; animation: titlePulseAnim 2s infinite ease-in-out; font-weight: 900; letter-spacing: 2px; background: linear-gradient(90deg, #00ffe0, #a020f0); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
            .drx-in .body-content { padding: 10px; display: flex; flex-direction: column; gap: 6px; }
            input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
            .txt-blk { color: #fff; font-weight: 900; }
            .txt-blk-accent { color: #a020f0; text-shadow: 0 0 15px #a020f0; font-weight: 900; }
            .txt-blk-warn { color: #ffcc00; text-shadow: 0 0 15px #ffcc00; font-weight: 900; }
            .txt-blk-err { color: #ff0044; text-shadow: 0 0 15px #ff0044; font-weight: 900; }
            .txt-blk-cyan { color: #00ffe0; text-shadow: 0 0 15px #00ffe0; font-weight: 900; }
            .txt-blk-reverse { color: #ff6b00; text-shadow: 0 0 15px #ff6b00; font-weight: 900; }
            .txt-blk-zero { color: #ffcc00; text-shadow: 0 0 20px #ffcc00, 0 0 40px #ffcc00; font-weight: 900; }
            .txt-blk-step { color: #00ff88; text-shadow: 0 0 20px #00ff88, 0 0 40px #00ff88; font-weight: 900; }
            .drx-in .input-field { width: 100%; padding: 8px; background: rgba(255,255,255,0.05); border: 1px solid #4a00e0; border-radius: 8px; text-align: center; font-size: 12px; outline: none; color: #fff; box-shadow: inset 0 0 15px rgba(74, 0, 224, 0.2); }
            .drx-in .input-field:focus { border-color: #00ffe0; box-shadow: 0 0 20px rgba(0, 255, 224, 0.3); }
            .drx-in .btn-neon { padding: 8px; background: transparent; border: 2px solid #00ffe0; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: 900; color: #00ffe0; text-shadow: 0 0 10px #00ffe0; transition: 0.3s; text-transform: uppercase; }
            .drx-in .btn-neon:hover { background: #00ffe0; color: #0a0a1a; box-shadow: 0 0 30px #00ffe0; }
            .drx-in .btn-neon-stop { border-color: #ff0044; color: #ff0044; text-shadow: 0 0 10px #ff0044; }
            .drx-in .btn-neon-stop:hover { background: #ff0044; color: #fff; }
            .stat-win { color: #00ff88; font-weight: bold; }
            .stat-loss { color: #ff0044; font-weight: bold; }
            .stat-signal { color: #ffcc00; font-weight: bold; }
            .stat-max { color: #ff6b00; font-weight: bold; }
            .stat-super { color: #ffd700; font-weight: bold; }
            .drx-elec-target { border-radius: 8px !important; position: relative; z-index: 9999 !important; background: rgba(0,255,224,0.2) !important; border: 2px solid #00ffe0 !important; box-shadow: 0 0 30px #00ffe0 !important; }
            .custom-badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 8px; margin-left: 5px; background: #00ff88; color: #000; font-weight: bold; }
            .sys-cls-btn { cursor: pointer; color: #ff0044; font-weight: 900; text-shadow: 0 0 15px #ff0044; font-size: 14px; }
        `;
        document.head.appendChild(stl);

        p.className = 'drx-wrap';
        let inC = document.createElement('div');
        inC.className = 'drx-in';
        
        let headerWrap = document.createElement('div');
        headerWrap.className = 'header-bg';
        let headerContent = document.createElement('div');
        headerContent.className = 'header-content';
        headerContent.innerHTML = `<span class="drx-title-anim" id="drx-title">${uF('NX XHAWON')} <span class="custom-badge">ZIGZAG+DABOL</span></span><span class="sys-cls-btn" id="sys-cls">✕</span>`;
        headerWrap.appendChild(headerContent);
        inC.appendChild(headerWrap);

        let bodyWrap = document.createElement('div');
        bodyWrap.className = 'body-content';
        
        headerContent.querySelector('#sys-cls').onclick = () => { clearInterval(st.autoInt); clearInterval(st.preScn); p.remove(); lkOvl.remove(); document.body.style.overflow = ''; };

        let drg=false,sx,sy,sl,st_y;
        function dSt(e){if(e.target.tagName==='SPAN')return;drg=true;let ev=e.type.includes('touch')?e.touches[0]:e;sx=ev.clientX;sy=ev.clientY;sl=p.offsetLeft;st_y=p.offsetTop;}
        function dMv(e){if(!drg)return;e.preventDefault();let ev=e.type.includes('touch')?e.touches[0]:e;p.style.left=(sl+ev.clientX-sx)+'px';p.style.top=(st_y+ev.clientY-sy)+'px';}
        function dEn(){drg=false; localStorage.setItem('drx_ui_x', p.style.left); localStorage.setItem('drx_ui_y', p.style.top);}
        headerContent.addEventListener('mousedown',dSt);headerContent.addEventListener('touchstart',dSt,{passive:false});
        document.addEventListener('mousemove',dMv);document.addEventListener('touchmove',dMv,{passive:false});
        document.addEventListener('mouseup',dEn);document.addEventListener('touchend',dEn);

        const p1 = document.createElement('div');
        p1.innerHTML = `
            <div style="text-align:center;margin-bottom:8px;padding:8px;background:rgba(0,255,224,0.05);border-radius:8px;border:1px solid #00ffe0;">
                <span class="txt-blk" style="font-size:9px;color:#00ffe0;">${uF('CURRENT BAL')}</span><br>
                <span id="pre-bal" class="txt-blk-cyan" style="font-size:15px;">--</span>
            </div>
            <input type="number" id="tgtInp" class="input-field" placeholder="TARGET AMT">
            <div style="display:flex;gap:5px;margin:8px 0;">
                <button id="divBtn" class="btn-neon" style="flex:1;">DIV</button>
                <button id="dblBtn" class="btn-neon" style="flex:1;border-color:#ff00ff;color:#ff00ff;">DBL</button>
            </div>
            <div id="mInpWrap" style="display:none;margin-bottom:8px;">
                <input type="number" id="mInp" class="input-field" placeholder="BASE AMOUNT">
            </div>
            <div style="margin-bottom:8px;">
                <select id="timeSel" class="input-field" style="appearance:none;">
                    ${(() => { let opts = ""; for(let i=1;i<=60;i++) opts += `<option value="${i}">${i}</option>`; opts += `<option value="NO" selected>NO</option>`; return opts; })()}
                </select>
            </div>
            <button id="goBtn" class="btn-neon" style="width:100%;border-color:#a020f0;color:#a020f0;">${uF('START ENGINE')}</button>
        `;
        bodyWrap.appendChild(p1);

        const p2 = document.createElement('div');
        p2.style.display = 'none';
        
        p2.innerHTML = `
            <div style="text-align:center;padding:8px;background:rgba(0,255,224,0.05);border-radius:8px;border:1px solid #00ffe0;margin-bottom:8px;">
                <span class="txt-blk" style="font-size:9px;color:#00ffe0;">${uF('LIVE BAL / PROFIT')}</span><br>
                <span id="ui-bal" class="txt-blk-cyan" style="font-size:16px;">--</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 8px;padding:6px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid #4a00e0;">
                <span class="txt-blk" style="color:#888;">${uF('AI:')}</span><span id="ui-ai" class="txt-blk-zero">ZIGZAG+DABOL</span>
                <span class="txt-blk" style="color:#888;">${uF('TGT:')}</span><span id="ui-tgt" class="txt-blk">0</span>
                <span class="txt-blk" style="color:#888;">${uF('AMT:')}</span><span id="ui-bet" class="txt-blk-warn">5</span>
                <span class="txt-blk" style="color:#888;">${uF('STEP:')}</span><span id="ui-step" class="txt-blk-step">1</span>
                <span class="txt-blk" style="color:#888;">${uF('LATEST:')}</span><span id="ui-latest" class="txt-blk-zero">-</span>
                <span class="txt-blk" style="color:#888;">${uF('SIGNAL:')}</span><span id="ui-signal" class="txt-blk-reverse">---</span>
                <span class="txt-blk" style="color:#888;">${uF('TOTAL SIG:')}</span><span id="ui-total-sig" class="stat-signal">0</span>
                <span class="txt-blk" style="color:#888;">${uF('TOTAL WIN:')}</span><span id="ui-total-win" class="stat-win">0</span>
                <span class="txt-blk" style="color:#888;">${uF('TOTAL LOSS:')}</span><span id="ui-total-loss" class="stat-loss">0</span>
                <span class="txt-blk" style="color:#888;">${uF('MAX LOSS:')}</span><span id="ui-max-loss" class="stat-max">0</span>
                <span class="txt-blk" style="color:#888;">${uF('MAX WIN:')}</span><span id="ui-max-win" class="stat-super">0</span>
                <span class="txt-blk" style="color:#888;">${uF('STS:')}</span><span id="ui-sts" class="txt-blk">${uF('WAIT')}</span>
            </div>
            <button id="stpBtn" class="btn-neon btn-neon-stop" style="width:100%;margin-top:8px;">${uF('STOP')}</button>
        `;
        bodyWrap.appendChild(p2);
        
        inC.appendChild(bodyWrap);
        p.appendChild(inC);
        document.body.appendChild(p);

        const tgtInp = document.getElementById('tgtInp');
        const mInpWrap = document.getElementById('mInpWrap');
        const mInp = document.getElementById('mInp');
        const divBtn = document.getElementById('divBtn');
        const dblBtn = document.getElementById('dblBtn');
        const timeSel = document.getElementById('timeSel');
        const goBtn = document.getElementById('goBtn');
        const stpBtn = document.getElementById('stpBtn');

        divBtn.onclick = () => { st.mode = 'DIV'; mInpWrap.style.display = 'block'; mInp.placeholder = 'FIXED AMOUNT'; dblBtn.style.opacity = '0.4'; divBtn.style.opacity = '1'; };
        dblBtn.onclick = () => { st.mode = 'DBL'; mInpWrap.style.display = 'block'; mInp.placeholder = 'FIXED AMOUNT'; divBtn.style.opacity = '0.4'; dblBtn.style.opacity = '1'; };
        timeSel.onchange = () => { st.timeLimit = timeSel.value; };

        st.preScn = setInterval(() => { if(!st.isRun) { let bal = chkBal(); document.getElementById('pre-bal').innerText = uF(bal > 0 ? bal.toFixed(2) : '--'); } }, 1000);

        const exeTrd = (pred, amt, cb) => {
            let pEl = document.querySelector(sel[pred]);
            if(!pEl) { if(cb) cb(false); return; }
            pEl.classList.add('drx-elec-target');
            pEl.click(); 
            setTimeout(() => {
                let inpEl = document.querySelector(sel.A1);
                if(inpEl) {
                    inpEl.focus();
                    let setV = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    if(setV) setV.call(inpEl, amt); else inpEl.value = amt;
                    inpEl.dispatchEvent(new Event('input', { bubbles: true }));
                    inpEl.dispatchEvent(new Event('change', { bubbles: true }));
                }
                setTimeout(() => {
                    let dEl = document.querySelector(sel.DTA);
                    if(dEl) { dEl.click(); setTimeout(() => dEl.click(), 100); }
                    if(pEl) pEl.classList.remove('drx-elec-target');
                    setTimeout(() => { if(cb) cb(true); }, 3000);
                }, 500);
            }, 500);
        };

        const scnUI = (cb) => {
            let ov = document.createElement('div');
            ov.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:transparent;z-index:9999998;pointer-events:none;overflow:hidden;';
            let cBase = '#a020f0';
            let rL = document.createElement('div');
            rL.style.cssText = `position:absolute;width:100%;height:2px;background:${cBase};box-shadow:0 0 10px 3px ${cBase};animation:sR 0.15s linear infinite alternate;`;
            let gL = document.createElement('div'); gL.style.cssText = `position:absolute;height:100%;width:3px;background:${cBase};box-shadow:0 0 15px 5px ${cBase};animation:sG 0.15s cubic-bezier(0.25,0.1,0.25,1) infinite alternate;`;
            let sS = document.createElement('style'); 
            sS.innerHTML = `@keyframes sR { 0% { top: -10px; } 100% { top: 100vh; } } @keyframes sG { 0% { left: -10px; } 100% { left: 100vw; } }`;
            document.head.appendChild(sS); ov.appendChild(rL); ov.appendChild(gL); document.body.appendChild(ov);
            setTimeout(() => { ov.remove(); sS.remove(); if(cb) cb(); }, 1500);
        };

        const updateUI = () => {
            const uTotalSig = document.getElementById('ui-total-sig');
            const uTotalWin = document.getElementById('ui-total-win');
            const uTotalLoss = document.getElementById('ui-total-loss');
            const uMaxLoss = document.getElementById('ui-max-loss');
            const uMaxWin = document.getElementById('ui-max-win');
            const uStep = document.getElementById('ui-step');
            
            if (uStep) uStep.innerText = st.currentStep + 1;
            if (uTotalSig) uTotalSig.innerText = st.totalSignals;
            if (uTotalWin) uTotalWin.innerText = st.totalWins;
            if (uTotalLoss) uTotalLoss.innerText = st.totalLosses;
            if (uMaxLoss) uMaxLoss.innerText = st.maxLossStreak;
            if (uMaxWin) uMaxWin.innerText = st.maxWinStreak;
        };

        const loopTask = () => {
            if (window._checkAdminStatus()) return; 
            if(!st.isRun || st.isTrd) return;

            chkBal();
            const uBal = document.getElementById('ui-bal'), uSts = document.getElementById('ui-sts'), uBet = document.getElementById('ui-bet');
            const uSignal = document.getElementById('ui-signal');
            const uLatest = document.getElementById('ui-latest');
            
            uBal.innerText = uF(st.curBal > 0 ? st.curBal.toFixed(2) : '--');
            uBet.innerText = uF(st.dynSeq[st.stpIdx] || '--');
            updateUI();

            let sDigRaw = null;
            let pageText = document.body.innerText;
            let histMatches = [...pageText.matchAll(/(20\d{12,18})[\s\n]+(\d)[\s\n]+(Big|Small)/gi)];
            
            if (histMatches.length >= 10) {
                sDigRaw = histMatches.map(m => parseInt(m[2]));
            }
            
            if (sDigRaw && sDigRaw.length >= 5) { 
                let sDig = sDigRaw;
                let cSig = sDig.slice(0, 5).join("-"), sSig = sessionStorage.getItem('drx_sig');
                
                if (cSig !== sSig) {
                    if(st.lastPred && st.lastPeriod) {
                        let actualRes = parseInt(sDig[0]);
                        let isWin = (st.lastPred === 'BIG' && actualRes >= 5) || (st.lastPred === 'SMALL' && actualRes < 5);
                        DataVault.addRecord(st.lastPeriod, actualRes, st.lastPred, isWin);
                        
                        st.totalSignals++;
                        if (isWin) {
                            st.totalWins++;
                            st.currentWinStreak++;
                            st.currentLossStreak = 0;
                            if (st.currentWinStreak > st.maxWinStreak) st.maxWinStreak = st.currentWinStreak;
                            
                            // ✅ WIN → Full Reset
                            st.currentStep = 0;
                            st.lossCount = 0;
                            console.log(`🎉 WIN! RESET → Step 1`);
                        } else {
                            st.totalLosses++;
                            st.currentLossStreak++;
                            st.currentWinStreak = 0;
                            if (st.currentLossStreak > st.maxLossStreak) st.maxLossStreak = st.currentLossStreak;
                            
                            st.currentStep++;
                            st.lossCount++;
                            
                            // ✅ LOSS হলে ডাবল মার্কেট ব্রেক হবে
                            if (st.db_state !== "NONE") {
                                st.db_state = "NONE";
                                st.db_count = 0;
                                console.log(`⚠️ LOSS! DABOL MARKET BROKEN`);
                            }
                            
                            console.log(`❌ LOSS! Step → ${st.currentStep + 1}`);
                        }
                        updateUI();
                    }

                    st.lastPeriod = cSig;
                    st.lastHist = sDig;

                    if (uLatest) {
                        uLatest.innerText = sDig[0];
                        uLatest.style.color = (sDig[0] === 0 || sDig[0] === 2 || sDig[0] === 5 || sDig[0] === 7) ? '#ffcc00' : '#fff';
                    }

                    let resultObj = UserPatternLogic(sDig);
                    let prediction = resultObj.pick;
                    let pattern_name = resultObj.pattern;

                    if (uSignal) {
                        if (prediction !== 'WAIT') {
                            uSignal.innerText = prediction;
                            uSignal.className = 'txt-blk-reverse';
                        } else {
                            uSignal.innerText = '---';
                            uSignal.className = 'txt-blk';
                        }
                    }

                    if (prediction === 'WAIT') {
                        uSts.innerText = uF('WAIT PATTERN'); 
                        uSts.className = 'txt-blk-warn';
                        sessionStorage.setItem('drx_sig', cSig);
                        st.lastPred = null; 
                        st.lastPeriod = null; 
                        return;
                    }

                    st.isTrd = true; uSts.innerText = uF('CHK...'); uSts.className = 'txt-blk-warn';

                    setTimeout(() => {
                        let nBal = chkBal(); uBal.innerText = uF(nBal.toFixed(2));
                        st.dynSeq = calcSeq(nBal, st.tgtAmt);
                        st.stpIdx = 0;
                        let tAmt = st.dynSeq[st.stpIdx];
                        uBet.innerText = uF(tAmt);

                        if(nBal < tAmt) { 
                            uSts.innerText = uF('LOW'); 
                            uSts.className = 'txt-blk-err'; 
                            st.isTrd = false; 
                            return; 
                        }

                        uSts.innerText = uF('EXC...'); uSts.className = 'txt-blk-zero';
                        st.lastPred = prediction;

                        exeTrd(prediction, tAmt, (suc) => {
                            if(suc) {
                                uSts.innerText = uF('OK'); uSts.className = 'txt-blk-accent';
                                sessionStorage.setItem('drx_sig', cSig);
                                st.tradesDone++; 
                            } else { uSts.innerText = uF('ERR'); uSts.className = 'txt-blk-err'; }
                            setTimeout(() => { st.isTrd = false; }, 1000); 
                        });
                    }, cfg.syncDly);
                } else if(!st.isTrd) { 
                    uSts.innerText = uF('SCAN'); uSts.className = 'txt-blk'; 
                }
            }
        };

        goBtn.onclick = () => {
            if (window._checkAdminStatus()) return;

            let a = parseFloat(tgtInp.value); if(!a || a <= 0) return;
            st.extVal = parseFloat(mInp.value) || 0; 
            clearInterval(st.preScn);
            
            st.tradesDone = 0;
            st.lossCount = 0;
            st.currentStep = 0;
            
            // ✅ ডাবল মার্কেট স্টেট রিসেট
            st.db_state = "NONE";
            st.db_count = 0;
            
            st.baseAmount = st.extVal > 0 ? st.extVal : 5;
            st.totalSignals = 0;
            st.totalWins = 0;
            st.totalLosses = 0;
            st.maxLossStreak = 0;
            st.maxWinStreak = 0;
            st.currentLossStreak = 0;
            st.currentWinStreak = 0;

            scnUI(() => {
                sessionStorage.removeItem('drx_sig');
                chkBal(); st.tgtAmt = a; st.dynSeq = calcSeq(st.curBal, st.tgtAmt); st.stpIdx = 0; 
                document.getElementById('ui-tgt').innerText = uF(a);
                
                let pageText = document.body.innerText;
                let hMatches = [...pageText.matchAll(/(20\d{12,18})[\s\n]+(\d)[\s\n]+(Big|Small)/gi)];
                if (hMatches.length >= 5) {
                    let sDig = hMatches.map(m => parseInt(m[2]));
                    sessionStorage.setItem('drx_sig', sDig.slice(0, 5).join("-"));
                } else {
                    sessionStorage.setItem('drx_sig', '0-0-0-0-0');
                }

                p1.style.display = 'none'; p2.style.display = 'block';
                lkOvl.style.display = 'block'; document.body.style.overflow = 'hidden';

                st.isRun = true; st.isTrd = false;
                document.getElementById('ui-sts').innerText = uF('RDY');
                updateUI();
                st.autoInt = setInterval(loopTask, cfg.fRt); 
            });
        };

        stpBtn.onclick = () => {
            st.isRun = false; clearInterval(st.autoInt);
            sessionStorage.removeItem('drx_sig');
            document.getElementById('ui-sts').innerText = uF('HLT'); document.getElementById('ui-sts').className = 'txt-blk-err';
            lkOvl.style.display = 'none'; document.body.style.overflow = '';
            
            stpBtn.innerText = uF('RBT');
            stpBtn.onclick = () => {
                p2.style.display = 'none'; p1.style.display = 'block'; stpBtn.innerText = uF('STOP');
                st.preScn = setInterval(() => { let b = chkBal(); document.getElementById('pre-bal').innerText = uF(b > 0 ? b.toFixed(2) : '--'); }, 2000);
            };
        };
    });
})();