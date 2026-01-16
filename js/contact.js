// EmailJS設定
// 以下の値はEmailJSダッシュボードから取得して設定してください
const EMAILJS_PUBLIC_KEY = '8VW626Nak_dPBPXec'; // EmailJSの公開キー
const EMAILJS_SERVICE_ID = 'service_qtqoj9r'; // EmailサービスID
const EMAILJS_TEMPLATE_ID = 'template_m3jrm9c'; // メールテンプレートID

document.addEventListener('DOMContentLoaded', function() {
    // EmailJS初期化
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const formMessage = document.getElementById('form-message');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // ボタンを送信中状態に
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        formMessage.style.display = 'none';

        // フォームデータを取得
        const templateParams = {
            user_type: document.getElementById('user_type').value,
            user_name: document.getElementById('user_name').value,
            user_email: document.getElementById('user_email').value,
            user_phone: document.getElementById('user_phone').value || '未入力',
            message: document.getElementById('message').value
        };

        // EmailJSでメール送信
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function(response) {
                // 成功時
                formMessage.textContent = 'お問い合わせを送信しました。返信まで2営業日ほどお待ちください。';
                formMessage.className = 'form-message success';
                formMessage.style.display = 'block';
                form.reset();
            })
            .catch(function(error) {
                // エラー時
                console.error('EmailJS Error:', error);
                formMessage.textContent = '送信に失敗しました。しばらく経ってから再度お試しください。';
                formMessage.className = 'form-message error';
                formMessage.style.display = 'block';
            })
            .finally(function() {
                // ボタンを元に戻す
                submitBtn.disabled = false;
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
            });
    });
});
