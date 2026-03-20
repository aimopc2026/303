// 音频
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
function initAudio() { if (!audioCtx) audioCtx = new AudioContext(); }
function playTone(freq, duration, vol = 0.3) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}
function playSuccessMusic() {
    const melody = [[523, 659], [659, 784], [784, 1046], [1046, 1318], [1318, 1046], [1046, 784], [784, 659], [659, 523]];
    melody.forEach((chord, i) => setTimeout(() => chord.forEach(f => playTone(f, 0.4, 0.2)), i * 400));
}
function playUnlockMusic() {
    [261, 329, 392, 523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.5, 0.25), i * 150));
}

// 画布背景
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let width, height;
function resize() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

const stars = [];
for (let i = 0; i < 500; i++) stars.push({ x: Math.random() * width, y: Math.random() * height, size: Math.random() * 2.5 + 0.5, speed: Math.random() * 0.015 + 0.005, brightness: Math.random(), twinkle: Math.random() * 0.02 });

let shootingStars = [];

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#050510');
    gradient.addColorStop(0.5, '#0a0a20');
    gradient.addColorStop(1, '#0f0f30');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    stars.forEach(star => {
        star.brightness += star.twinkle;
        const alpha = (Math.sin(star.brightness) + 1) / 2 * 0.8 + 0.2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        if (alpha > 0.7) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.15})`;
            ctx.fill();
        }
    });
    
    if (Math.random() < 0.02) shootingStars.push({ x: Math.random() * width, y: -50, vx: 3 + Math.random() * 4, vy: 3 + Math.random() * 4, life: 1, length: 60 + Math.random() * 40 });
    
    shootingStars = shootingStars.filter(s => {
        const tailX = s.x - s.vx * s.length / 15;
        const tailY = s.y - s.vy * s.length / 15;
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
        grad.addColorStop(0.3, `rgba(255, 215, 0, ${s.life * 0.8})`);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
        ctx.fill();
        s.x += s.vx; s.y += s.vy; s.life -= 0.012;
        return s.life > 0 && s.x < width + 100 && s.y < height + 100;
    });
    requestAnimationFrame(drawBackground);
}
drawBackground();

function showScene(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

setTimeout(() => { showScene('planetsScreen'); initAudio(); }, 3500);

// 生成转盘数字（逆时针排列，这样顺时针转动时数字递增）
function createDialNumbers() {
    const dial = document.getElementById('dial');
    for (let i = 0; i < 10; i++) {
        const num = document.createElement('div');
        num.className = 'dial-number';
        num.textContent = i;
        // 逆时针排列：角度 = -i/10 * 360度 - 90度（从顶部开始）
        const angle = -(i / 10) * Math.PI * 2 - Math.PI / 2;
        const x = 150 + Math.cos(angle) * 105;
        const y = 150 + Math.sin(angle) * 105;
        num.style.left = x + 'px';
        num.style.top = y + 'px';
        dial.appendChild(num);
    }
}
createDialNumbers();

let completedStars = 0, currentGame = 0;
const confessions = ['', ['记得我们第一次相遇的那天', '阳光正好，微风不燥', '你的笑容，比阳光更暖'], ['想和你虚度时光', '比如低头看鱼，比如把茶杯留在桌上', '离开，浪费它们好看的阴影'], ['其实我想对你说', '遇见你，是我这辈子最美的意外', '余生很长，想和你一起浪费']];

function openGame(num) {
    const planet = document.getElementById(['', 'planet-star', 'planet-moon', 'planet-heart'][num]);
    if (planet.classList.contains('completed')) return;
    currentGame = num;
    const titles = ['', '✨ 记忆之星 ✨', '🌙 时光之月 🌙', '❤️ 告白之心 ❤️'];
    const instructions = ['', '按顺序点击光点，连接我们的记忆轨迹', '长按屏幕蓄力至100%，点亮时光之月', '快速点击掉落的小心心，收集3颗心愿'];
    document.getElementById('gameTitle').textContent = titles[num];
    document.getElementById('gameInstruction').textContent = instructions[num];
    document.getElementById('gameBtn').textContent = '开始挑战';
    document.getElementById('gameBtn').style.display = 'inline-block';
    document.getElementById('gameBtn').onclick = startMiniGame;
    document.getElementById('gameModal').classList.add('active');
}

function startMiniGame() {
    document.getElementById('gameBtn').style.display = 'none';
    if (currentGame === 1) game1Connect();
    else if (currentGame === 2) game2Charge();
    else if (currentGame === 3) game3Click();
}

function game1Connect() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const points = [];
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        points.push({ x: 200 + Math.cos(angle) * 100, y: 160 + Math.sin(angle) * 80 });
    }
    let currentPoint = 0;
    
    function draw() {
        ctx.clearRect(0, 0, 400, 320);
        const grad = ctx.createRadialGradient(200, 160, 0, 200, 160, 150);
        grad.addColorStop(0, 'rgba(255,215,0,0.1)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 400, 320);
        
        if (currentPoint > 0) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i <= currentPoint; i++) ctx.lineTo(points[i].x, points[i].y);
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 5;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#ffd700';
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        points.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, i <= currentPoint ? 16 : 12, 0, Math.PI * 2);
            ctx.fillStyle = i <= currentPoint ? '#ffd700' : 'rgba(255,255,255,0.3)';
            ctx.shadowBlur = i <= currentPoint ? 30 : 0;
            ctx.shadowColor = '#ffd700';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = i <= currentPoint ? '#000' : 'rgba(255,255,255,0.5)';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i + 1, p.x, p.y);
        });
        
        if (currentPoint < 4) requestAnimationFrame(draw);
        else completeGame();
    }
    
    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const nextPoint = points[currentPoint + 1];
        if (nextPoint && Math.hypot(x - nextPoint.x, y - nextPoint.y) < 35) {
            currentPoint++;
            playTone(400 + currentPoint * 80, 0.2);
        }
    };
    draw();
}

function game2Charge() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let power = 0, charging = false;
    
    function draw() {
        ctx.clearRect(0, 0, 400, 320);
        const bgGrad = ctx.createRadialGradient(200, 140, 0, 200, 140, 140);
        bgGrad.addColorStop(0, `rgba(255,215,0,${power/250})`);
        bgGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 400, 320);
        
        const moonSize = 60 + power * 0.6;
        ctx.beginPath();
        ctx.arc(200, 130, moonSize, 0, Math.PI * 2);
        const moonGrad = ctx.createRadialGradient(200, 130, 0, 200, 130, moonSize);
        moonGrad.addColorStop(0, `rgba(255, 230, 150, ${0.4 + power/150})`);
        moonGrad.addColorStop(0.5, `rgba(255, 200, 100, ${0.3 + power/200})`);
        moonGrad.addColorStop(1, `rgba(255, 180, 80, ${0.2 + power/250})`);
        ctx.fillStyle = moonGrad;
        ctx.shadowBlur = 30 + power / 3;
        ctx.shadowColor = '#ffd700';
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(80, 250, 240, 15);
        const barGrad = ctx.createLinearGradient(80, 0, 320, 0);
        barGrad.addColorStop(0, '#ff4444');
        barGrad.addColorStop(0.5, '#ffaa00');
        barGrad.addColorStop(1, '#00ff44');
        ctx.fillStyle = barGrad;
        ctx.fillRect(80, 250, 240 * (power / 100), 15);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, 250, 240, 15);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.floor(power)}%`, 200, 295);
        
        if (charging && power < 100) { power += 0.4; requestAnimationFrame(draw); }
        else if (power >= 100) completeGame();
        else if (!charging && power > 0) { power = Math.max(0, power - 2); requestAnimationFrame(draw); }
    }
    
    canvas.onmousedown = () => { charging = true; draw(); };
    canvas.onmouseup = () => { charging = false; };
    canvas.ontouchstart = (e) => { e.preventDefault(); charging = true; draw(); };
    canvas.ontouchend = () => { charging = false; };
    draw();
}

function game3Click() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let count = 0, hearts = [];
    
    function spawnHeart() {
        hearts.push({ x: Math.random() * 320 + 40, y: -40, vy: 2.5 + Math.random() * 2.5, size: 25 + Math.random() * 10 });
    }
    
    function draw() {
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(0, 0, 400, 320);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`❤️ ${count}/3`, 200, 50);
        
        hearts.forEach((h, i) => {
            h.y += h.vy;
            ctx.font = `${h.size}px Arial`;
            ctx.fillText('❤️', h.x, h.y);
            if (h.y > 360) hearts.splice(i, 1);
        });
        
        if (hearts.length < 4 && Math.random() < 0.04) spawnHeart();
        if (count < 3) requestAnimationFrame(draw);
        else completeGame();
    }
    
    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        hearts.forEach((h, i) => {
            if (Math.abs(x - h.x) < 30 && Math.abs(y - h.y) < 30) {
                hearts.splice(i, 1);
                count++;
                playTone(500 + count * 100, 0.25);
            }
        });
    };
    spawnHeart(); spawnHeart(); spawnHeart();
    draw();
}

function completeGame() {
    document.getElementById('gameModal').classList.remove('active');
    document.getElementById('gameBtn').style.display = 'inline-block';
    playSuccessMusic();
    
    const overlay = document.getElementById('confessionOverlay');
    const textDiv = document.getElementById('confessionText');
    const lines = confessions[currentGame];
    textDiv.innerHTML = lines.map((line, i) => `<div class="line" style="animation-delay: ${i * 1.5}s">${line}</div>`).join('');
    overlay.classList.add('active');
    
    setTimeout(() => {
        overlay.classList.remove('active');
        document.getElementById(['', 'planet-star', 'planet-moon', 'planet-heart'][currentGame]).classList.add('completed');
        completedStars++;
        if (completedStars === 3) {
            setTimeout(() => {
                showScene('chestScreen');
                createBeams();
            }, 1500);
        }
    }, 7000);
}

function createBeams() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const beam = document.createElement('div');
            beam.style.cssText = `position:fixed;width:4px;height:0;background:linear-gradient(to bottom,transparent,#ffd700,transparent);left:${50 + (i-1)*15}%;top:0;transition:height 1.5s;z-index:5;`;
            document.body.appendChild(beam);
            setTimeout(() => beam.style.height = '45vh', 100);
        }, i * 300);
    }
}

function openLock() {
    document.getElementById('lockModal').classList.add('active');
    initDialDrag();
}

// 随机密码（0-9），每次刷新都会变
const correctPassword = Math.floor(Math.random() * 10);

let dialValue = 0, currentRotation = 0;
function initDialDrag() {
    const dial = document.getElementById('dial');
    let isDragging = false, startAngle = 0, startRotation = 0;
    
    // 鼠标事件
    dial.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // 触摸事件
    dial.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY };
        startDrag(mouseEvent);
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY };
        drag(mouseEvent);
    }, { passive: false });
    
    document.addEventListener('touchend', endDrag);
    
    function startDrag(e) {
        isDragging = true;
        const rect = dial.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        startRotation = currentRotation;
        dial.style.cursor = 'grabbing';
    }
    
    function drag(e) {
        if (!isDragging) return;
        const rect = dial.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        let diff = (angle - startAngle) * 180 / Math.PI;
        currentRotation = startRotation + diff;
        dial.style.transform = `rotate(${currentRotation}deg)`;
        
        const normalizedRotation = ((currentRotation % 360) + 360) % 360;
        dialValue = Math.round(normalizedRotation / 36) % 10;
        document.getElementById('dialNumber').textContent = dialValue;
        
        if (Math.random() < 0.1) playTone(200 + dialValue * 50, 0.05, 0.15);
    }
    
    function endDrag() {
        if (!isDragging) return;
        isDragging = false;
        dial.style.cursor = 'grab';
        currentRotation = dialValue * 36;
        dial.style.transform = `rotate(${currentRotation}deg)`;
        
        if (dialValue === correctPassword) {
            setTimeout(() => {
                document.getElementById('lockModal').classList.remove('active');
                document.querySelectorAll('[style*="position:fixed"]').forEach(el => { if(el.style.width === '4px') el.remove(); });
                document.getElementById('chest').classList.add('open');
                playUnlockMusic();
                setTimeout(showFinal, 2000);
            }, 500);
        }
    }
}

function showFinal() {
    showScene('finalScreen');
    setTimeout(() => {
        document.getElementById('finalBeam').classList.add('active');
        setTimeout(() => {
            document.getElementById('roseContainer').classList.add('show');
            setTimeout(() => document.getElementById('textContainer').classList.add('show'), 2500);
        }, 1500);
    }, 800);
}