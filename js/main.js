// main.js - исправленная версия с правильной работой вкладок
(function() {
    console.log('main.js запущен');

    const SUPABASE_URL = 'https://eqzulsgpnkmkdbygqata.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_3rpJAQ5CxxoSVOm4iSsaoQ_NlEUk4mD';
    
    if (!window.supabase) {
        console.error('Supabase не загружен!');
        return;
    }
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase клиент создан');

    let currentType = 'all';

    async function loadContent() {
        console.log('Загрузка контента, тип:', currentType);
        
        // Строим запрос
        let query = supabase
            .from('content')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        // Применяем фильтр по типу (если не 'all')
        if (currentType !== 'all') {
            query = query.eq('type', currentType);
        }

        const { data, error } = await query;
        
        if (error) {
            console.error('Ошибка Supabase:', error);
            const gridEl = document.getElementById('mapsGrid');
            if (gridEl) gridEl.innerHTML = '<div class="error">Ошибка загрузки: ' + error.message + '</div>';
            return;
        }

        console.log('Получено данных:', data.length);
        
        const statsEl = document.getElementById('stats');
        const gridEl = document.getElementById('mapsGrid');
        
        if (statsEl) statsEl.innerHTML = `📦 Найдено: ${data.length} проектов`;
        
        if (data.length === 0) {
            if (gridEl) gridEl.innerHTML = '<div class="loading">😢 Пока ничего нет... Добавьте контент первым!</div>';
            return;
        }

        const html = data.map(item => `
            <div class="map-card" onclick="window.location.href='project.html?id=${item.id}'">
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'">` : '<div style="height:160px; background:#1a1a1a; display:flex; align-items:center; justify-content:center;">🖼️ Нет превью</div>'}
                <h3>${escapeHtml(item.title)}</h3>
                <div class="author">👤 ${escapeHtml(item.author)}</div>
                <div class="version">📌 ${item.version || 'Любая'}</div>
                <div class="description">${escapeHtml(item.description).substring(0, 100)}${item.description.length > 100 ? '...' : ''}</div>
                <div class="stats">
                    <span>👍 ${item.likes || 0}</span>
                    <span>👎 ${item.dislikes || 0}</span>
                    <span>📅 ${new Date(item.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
        
        if (gridEl) gridEl.innerHTML = html;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        console.log('Найдено табов:', tabs.length);
        
        // Убираем старые обработчики и добавляем новые
        tabs.forEach(btn => {
            // Удаляем старый обработчик, если есть (через cloneNode)
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Клик по вкладке:', newBtn.dataset.type);
                
                // Убираем active у всех
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                // Добавляем active текущей
                newBtn.classList.add('active');
                // Меняем тип
                currentType = newBtn.dataset.type;
                // Перезагружаем контент
                loadContent();
            });
        });
    }

    // Ждём загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM загружен');
            setupTabs();
            loadContent();
        });
    } else {
        setupTabs();
        loadContent();
    }
})();
