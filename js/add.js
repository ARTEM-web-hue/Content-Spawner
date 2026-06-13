// add.js - исправленная версия (без конфликта переменных)
(function() {
    console.log('add.js запущен');

    const SUPABASE_URL = 'https://eqzulsgpnkmkdbygqata.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_3rpJAQ5CxxoSVOm4iSsaoQ_NlEUk4mD';
    
    if (!window.supabase) {
        console.error('Supabase не загружен!');
        return;
    }
    
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase клиент создан в add.js');

    const form = document.getElementById('addForm');
    if (!form) {
        console.error('Форма не найдена!');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Форма отправлена');
        
        const formData = {
            title: document.getElementById('title').value.trim(),
            type: document.getElementById('type').value,
            description: document.getElementById('description').value.trim(),
            download_url: document.getElementById('download_url').value.trim(),
            image_url: document.getElementById('image_url').value.trim() || null,
            version: document.getElementById('version').value.trim() || null,
            author: document.getElementById('author').value.trim(),
            donate_url: document.getElementById('donate_url').value.trim() || null,
            status: 'pending',
            created_at: new Date()
        };
        
        if (!formData.title || !formData.description || !formData.download_url || !formData.author) {
            showMessage('Заполните все обязательные поля', 'error');
            return;
        }
        
        if (!formData.download_url.includes('http')) {
            showMessage('Ссылка на скачивание должна начинаться с http:// или https://', 'error');
            return;
        }
        
        console.log('Отправка данных в Supabase...', formData);
        
        const { data, error } = await supabase
            .from('content')
            .insert([formData])
            .select();
        
        if (error) {
            console.error('Ошибка Supabase:', error);
            showMessage('Ошибка при отправке: ' + error.message, 'error');
        } else {
            console.log('Успешно отправлено! ID:', data[0].id);
            showMessage('✅ Спасибо! Ваш контент отправлен на модерацию и появится после проверки.', 'success');
            form.reset();
        }
    });

    function showMessage(msg, type) {
        const msgDiv = document.getElementById('message');
        if (!msgDiv) return;
        msgDiv.innerHTML = `<div class="${type}">${msg}</div>`;
        setTimeout(() => msgDiv.innerHTML = '', 5000);
    }
})();
