// project.js - исправленная версия (без конфликта переменных)
(function() {
    console.log('project.js запущен');

    const SUPABASE_URL = 'https://eqzulsgpnkmkdbygqata.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_3rpJAQ5CxxoSVOm4iSsaoQ_NlEUk4mD';
    
    if (!window.supabase) {
        console.error('Supabase не загружен!');
        return;
    }
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase клиент создан в project.js');

    async function loadProject() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        console.log('Загрузка проекта с ID:', id);
        
        if (!id) {
            document.getElementById('projectContent').innerHTML = '<div class="error">Проект не найден</div>';
            return;
        }
        
        const { data, error } = await supabase
            .from('content')
            .select('*')
            .eq('id', id)
            .eq('status', 'approved')
            .single();
        
        if (error || !data) {
            console.error('Ошибка загрузки проекта:', error);
            document.getElementById('projectContent').innerHTML = '<div class="error">Проект не найден</div>';
            return;
        }
        
        console.log('Проект загружен:', data.title);
        
        document.title = `${data.title} — Content Spawner`;
        
        const ipHash = await getIpHash();
        const hasVoted = await checkUserVote(data.id, ipHash);
        
        const html = `
            <div class="project-container">
                ${data.image_url ? `<div class="project-image"><img src="${data.image_url}" alt="${data.title}" onerror="this.style.display='none'"></div>` : ''}
                
                <h1 class="project-title">${escapeHtml(data.title)}</h1>
                
                <div class="project-meta">
                    <div>👤 Автор: ${escapeHtml(data.author)}</div>
                    <div>📌 Тип: ${getTypeIcon(data.type)} ${getTypeName(data.type)}</div>
                    ${data.version ? `<div>📦 Версия Minecraft: ${escapeHtml(data.version)}</div>` : ''}
                    <div>📅 Добавлено: ${new Date(data.created_at).toLocaleDateString()}</div>
                </div>
                
                <div class="project-description">
                    ${escapeHtml(data.description)}
                </div>
                
                <div class="vote-buttons">
                    <button class="vote-btn" id="likeBtn" ${hasVoted ? 'disabled' : ''}>👍 ${data.likes || 0}</button>
                    <button class="vote-btn" id="dislikeBtn" ${hasVoted ? 'disabled' : ''}>👎 ${data.dislikes || 0}</button>
                </div>
                
                <div class="action-buttons">
                    <a href="${data.download_url}" class="pixel-btn green" target="_blank">⬇️ СКАЧАТЬ</a>
                    ${data.donate_url ? `<a href="${data.donate_url}" class="pixel-btn" target="_blank">💝 ПОДДЕРЖАТЬ АВТОРА</a>` : ''}
                    <a href="index.html" class="pixel-btn">← На главную</a>
                </div>
            </div>
        `;
        
        document.getElementById('projectContent').innerHTML = html;
        
        if (!hasVoted) {
            document.getElementById('likeBtn').addEventListener('click', () => vote(data.id, 1, ipHash));
            document.getElementById('dislikeBtn').addEventListener('click', () => vote(data.id, -1, ipHash));
        }
    }

    async function getIpHash() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return btoa(data.ip);
        } catch {
            return 'guest_' + Math.random().toString(36);
        }
    }

    async function checkUserVote(contentId, ipHash) {
        const { data } = await supabase
            .from('votes')
            .select('id')
            .eq('content_id', contentId)
            .eq('user_ip', ipHash)
            .maybeSingle();
        return !!data;
    }

    async function vote(contentId, voteValue, ipHash) {
        const { error: voteError } = await supabase
            .from('votes')
            .insert([{ content_id: contentId, user_ip: ipHash, vote: voteValue }]);
        
        if (voteError) {
            alert('Не удалось проголосовать. Возможно, вы уже голосовали.');
            return;
        }
        
        const field = voteValue === 1 ? 'likes' : 'dislikes';
        const { data: current } = await supabase
            .from('content')
            .select(field)
            .eq('id', contentId)
            .single();
        
        const newValue = (current[field] || 0) + 1;
        
        await supabase
            .from('content')
            .update({ [field]: newValue })
            .eq('id', contentId);
        
        location.reload();
    }

    function getTypeIcon(type) {
        const icons = { map: '🗺️', resourcepack: '🖌️', datapack: '📜' };
        return icons[type] || '📦';
    }

    function getTypeName(type) {
        const names = { map: 'Карта', resourcepack: 'Ресурспак', datapack: 'Датапак' };
        return names[type] || type;
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

    // Ждём загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadProject);
    } else {
        loadProject();
    }
})();
