const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
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
    
    const { data, error } = await supabase
        .from('content')
        .insert([formData])
        .select();
    
    if (error) {
        console.error(error);
        showMessage('Ошибка при отправке. Попробуйте позже.', 'error');
    } else {
        showMessage('✅ Спасибо! Ваш контент отправлен на модерацию и появится после проверки.', 'success');
        document.getElementById('addForm').reset();
    }
});

function showMessage(msg, type) {
    const msgDiv = document.getElementById('message');
    msgDiv.innerHTML = `<div class="${type}">${msg}</div>`;
    setTimeout(() => msgDiv.innerHTML = '', 5000);
}